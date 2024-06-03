import { Server, Socket } from "socket.io";
import { v4 } from "uuid";
import { User, mapNameToUser, mapTokenToUser } from "../db/user";
import E from "../dict/events";
import { Message } from "../db/messageLogger";

/**
 * 管理员连接之后的流程
 * 1.推送提前登陆的用户名单，并依次加入房间
 * 2.通知所有在线的用户（管理员已上线）
 * 3.监听新用户加入
 * 4.查看存储的离线消息
 *  4.1 有离线消息，则推送给管理员，并在前端分类
 *  4.2 无离线消息，则不做处理
 * @param io
 * @param socket
 */
export default function (io: Server, socket: Socket) {
  // console.log("[Admin] token: ", socket.handshake.auth.token);
  let admin = mapTokenToUser(socket.handshake.auth.token);
  if (!admin) {
    socket.disconnect();
    return;
  }
  admin = new User(v4(), "admin", socket.id);

  // 连接
  // 推送提前登陆的用户名单，并依次加入房间
  const onlineUsers = User.getOnlineUsers({ exclude: [admin] });
  console.log(
    "[Admin] 当前在线用户: ",
    onlineUsers.map((u) => u.name).join("; ")
  );
  socket.emit(E.ActiveUsers, onlineUsers);
  onlineUsers.forEach((user) => {
    console.log("[Admin] 通知用户 Admin 已上线");
    io.of("/").to(user.uniqueRoomId).emit(E.AdminJoin);
  });

  // 断开
  socket.on("disconnect", () => {
    console.log("[Admin] disconnected: ", socket.id);
    User.setUserOffline(admin);
    // 通知所有用户
    User.getOnlineUsers().forEach((user) => {
      io.of("/").to(user.uniqueRoomId).emit(E.AdminLeave);
    });
  });

  // 有新用户加入
  socket.on(E.UserJoin, (user: User) => {
    console.log("[Admin] 有用户上线: ", user);
    socket.join(user.uniqueRoomId);
  });

  // 在管理端，点击用户的时候，加入用户的房间
  socket.on(E.JoinRoom, (user: User) => {
    console.log("[Admin] 手动加入用户房间: ", user);
    socket.join(user.uniqueRoomId);
  });

  // 收到管理端发来的消息
  socket.on(
    E.MessageIn,
    (data: {
      type: "text" | "image" | "file" | "media";
      payload: {
        roomId: string;
        content: string;
        timestamp: number;
        sender: string;
      } | null;
    }) => {
      console.log("[Admin] 收到管理端消息: ", data);
      if (data.payload && data.payload.roomId) {
        io.of("/").to(data.payload.roomId).emit(E.ServerMessage, {
          sender: 'liubin',
          type: data.type,
          // 为什么是 datetime 而不是 timestamp
          // 因为客户的前端用的是 datetime 
          datetime: data.payload.timestamp,
          content: data.payload.content,
        });
      }
    }
  );

  // 收到用户发来的消息
  socket.on(E.UserMessage, (data: Message) => {
    console.log("[Admin] 收到用户消息: ", data);
    // socket.emit(E.MessageOut, data);
  });
}
