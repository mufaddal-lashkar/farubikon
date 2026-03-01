import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authPlugin } from "./middleware/auth";
import { ticketRoutes } from "./routes/tickets";
import { commentRoutes } from "./routes/comments";
import { aiRoutes } from "./routes/ai";

const app = new Elysia()
  .use(cors({
    origin: "http://localhost:3001",
    credentials: true,
  }))
  .use(swagger())
  .use(authPlugin)
  .use(ticketRoutes)
  .use(commentRoutes)
  .use(aiRoutes)
  .get("/health", () => ({ status: "ok" }))
  .listen(process.env.PORT ?? 3001);

console.log(`Backend running at http://localhost:${app.server?.port}`);