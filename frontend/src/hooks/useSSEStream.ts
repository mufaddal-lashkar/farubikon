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

    // AbortController ref — persists across renders, used to cancel the fetch
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
        // Cancel any existing stream before starting a new one
        stopStream();

        setData("");
        setError(null);
        setIsStreaming(true);

        // Create a fresh AbortController for this stream
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

            // Read the stream chunk by chunk
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                // Decode the chunk and add to buffer
                buffer += decoder.decode(value, { stream: true });

                // SSE lines are separated by double newlines — process complete events
                const lines = buffer.split("\n\n");

                // Keep the last incomplete chunk in the buffer
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;

                    const jsonStr = line.slice(6).trim(); // remove "data: " prefix

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
                            // Accumulate content — don't replace, append
                            setData((prev) => prev + parsed.content);
                        }
                    } catch {
                        // Skip malformed JSON chunks — don't crash the whole stream
                        console.warn("Failed to parse SSE chunk:", jsonStr);
                    }
                }
            }
        } catch (err) {
            // AbortError is expected when stopStream() is called — not a real error
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