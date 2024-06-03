import { Server, Socket } from "socket.io";
import { User, mapTokenToUser } from "../db/user";
import E from "../dict/events";
import { v4 } from "uuid";
import { cacheMessage } from "../db/messageLogger";

function sendToAdmin(io: Server, onlineFn: any, offlineFn: any) {
  if (io.of("/super").sockets.size > 0) {
    onlineFn();
  } else {
    offlineFn();
  }
}

/**
 * 普通用户连接之后的流程
 * 1.查询管理员状态
 *  1.1 有管理员在线，则通知管理员（有用户上线），通知用户（管理员在线）
 *  1.2 无管理员在线，则通知用户（管理员不在线），等待管理员上线
 * 2.普通用户发来了消息
 *  2.1 有管理员在线，则通知管理员（有用户发来消息）
 *  2.2 无管理员在线，则存储离线消息
 * @param io
 * @param socket
 * @returns
 */
export default function (io: Server, socket: Socket) {
  // auth: { token, name }
  console.log("[User] connected. token: ", socket.handshake.auth);
  let user = mapTokenToUser(socket.handshake.auth.token);
  if (!user) {
    socket.disconnect();
    return;
  }
  user = new User(v4(), user.name!, socket.id);

  // 连接
  sendToAdmin(
    io,
    () => {
      io.of("/super").emit(E.UserJoin, user);
      socket.emit(E.AdminOnline);
    },
    () => {
      socket.emit(E.WaitingForAdmin, { second: 30 });
    }
  );

  // 断开
  socket.on("disconnect", () => {
    console.log("[User] disconnected: ", user.name);
    io.of("/super").emit(E.UserLeave, user);
  });

  // 加入自己的房间
  socket.join(user.uniqueRoomId);

  // 客户发来消息
  type IncomingMessageType = {
    type:
      | "text"
      | "file"
      | "audio-invite"
      | "audio-accept"
      | "audio-reject"
      | "video-invite"
      | "video-accept"
      | "video-reject";
    content: string;
    timestamp: number;
  };

  socket.on(E.MessageIn, (msg: IncomingMessageType) => {
    console.log("message in: ", msg);
    sendToAdmin(
      io,
      () => {
        // socket.to(user.uniqueRoomId).emit(E.UserMessage, msg);
        io.of("/super").emit(E.UserMessage, {
          type: msg.type,
          content: msg.content,
          roomId: user.uniqueRoomId,
          timestamp: msg.timestamp,
        });
      },
      () => {
        cacheMessage(user.uniqueRoomId, {
          type: msg.type,
          content: msg.content,
          roomId: user.uniqueRoomId,
          timestamp: msg.timestamp,
        });
      }
    );
  });
}
