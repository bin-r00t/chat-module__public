import { Server } from "socket.io";
import initAdmin from "./setupAdminSocket";
import initNormalUser from "./setupUserSocket";

function initIo(io: Server) {
  io.of("/super").on("connection", (socket) => {
    initAdmin(io, socket);
  });

  io.on("connection", (socket) => {
    initNormalUser(io, socket);
  });
}

export { initIo };
