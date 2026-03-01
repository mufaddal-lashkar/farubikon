import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => "Hello")
  .listen(3001);

console.log(app);