import { useState, useRef, useCallback } from "react";

interface SSEStreamState {
    data: string;
    isStreaming: boolean;
    error: string | null;
}

interface UseSSEStreamReturn extends SSEStreamState {
    startStream: (url: string) => Promise<void>;
    stopStream: () => void;
    reset: () => void;
}

export function useSSEStream(): UseSSEStreamReturn {
    const [data, setData] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const stopStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
    }, []);

    const reset = useCallback(() => {
        stopStream();
        setData("");
        setError(null);
    }, [stopStream]);

    const startStream = useCallback(async (url: string) => {
        stopStream();

        setData("");
        setError(null);
        setIsStreaming(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch(url, {
                credentials: "include",
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`Stream request failed with status ${response.status}`);
            }

            if (!response.body) {
                throw new Error("Response has no readable body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split("\n\n");

                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;

                    const jsonStr = line.slice(6).trim();

                    try {
                        const parsed: { content: string; done: boolean; error?: string } =
                            JSON.parse(jsonStr);

                        if (parsed.error) {
                            setError(parsed.error);
                            setIsStreaming(false);
                            return;
                        }

                        if (parsed.done) {
                            setIsStreaming(false);
                            return;
                        }

                        if (parsed.content) {
                            setData((prev) => prev + parsed.content);
                        }
                    } catch {
                        console.warn("Failed to parse SSE chunk:", jsonStr);
                    }
                }
            }
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                return;
            }

            setError(
                err instanceof Error ? err.message : "Stream connection failed"
            );
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, [stopStream]);

    return { data, isStreaming, error, startStream, stopStream, reset };
}