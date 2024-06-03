import express from "express";
import { Server as SocketIoServer } from "socket.io";
import { createServer } from "http";
import { initIo } from "./setup";
import { initExpress } from "./setup/httpServer";
import { instrument } from "@socket.io/admin-ui";

const app = express();
const httpServer = createServer(app);
const io = new SocketIoServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://localhost:5173",
      "http://127.0.0.1:5500",
      "https://admin.socket.io",
      "http://localhost",
      "http://localhost:8000",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
    ],
    credentials: true,
  },
});
// 初始化 socket.io 配置
instrument(io, {
  auth: false,
  mode: "development",
});
initIo(io);
// 初始化 express 配置
initExpress(app);

let PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log("listening on http://localhost:" + PORT);
});
