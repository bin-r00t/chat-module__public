/** 用户保存，与session保存 */
import { v4 } from "uuid";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import users from "./users.json";

/** 用户状态 -- redis */
class OnlineStore {
  store: Map<string, boolean>;
  constructor() {
    this.store = new Map();
  }

  /** 设置某个用户的在线状态 */
  setStatusFor(userId: string, online: boolean) {
    if (this.store.has(userId)) {
      this.store.delete(userId);
    }
    this.store.set(userId, online);
  }
  setOnline(userId: string) {
    this.setStatusFor(userId, true);
  }
  setOffline(userId: string) {
    this.setStatusFor(userId, false);
  }

  removeItem(userId: string) {
    this.store.delete(userId);
  }

  getOnlineUsersId() {
    return Array.from(this.store.keys()).filter((userId) =>
      this.store.get(userId)
    );
  }
}

const store = new OnlineStore();

class User {
  name: string | null;
  socketId: string | null;
  uniqueRoomId: string;
  id: string;
  static users: User[] = [];

  constructor(id: string, name: string, socketId?: string) {
    let existUser: User | undefined;
    try {
      const dbUsers = JSON.parse(
        readFileSync(path.join(__dirname, "./users.json"), "utf-8")
      );
      existUser = dbUsers.find((u: User) => u.name === name);
    } catch (error) {
      console.error("[DB] [User] 初始化读取数据库出错: ", error);
    }
    if (existUser) {
      this.name = existUser.name;
      this.id = existUser.id;
      this.socketId = socketId ?? null;
      this.uniqueRoomId = existUser.uniqueRoomId;
    } else {
      this.name = name;
      this.socketId = socketId ?? null;
      this.id = id;
      this.uniqueRoomId = `private-room-${v4()}`;
    }
    console.log("[Class] [User] 上线用户: ", this.name);
    User.addUser(this);
  }

  setSocketId(socketId: string) {
    this.socketId = socketId;
  }

  static addUser(user: User) {
    try {
      /**
       * TODO: 改用数据库
       */
      const dbUsers = JSON.parse(
        readFileSync(path.join(__dirname, "./users.json"), "utf-8")
      );
      let existUser = dbUsers.find((u: User) => u.name === user.name);
      if (existUser) {
        // console.log("[DB] [User] 更新用户SocketId: ", user.name, user.socketId);
        existUser.socketId = user.socketId;
      } else {
        dbUsers.push(user);
        console.log("[DB] [User] 添加用户: ", user);
      }
      User.users.push(user);
      // 设置在线状态
      store.setOnline(user.id);
      // 持久化
      writeFileSync(
        path.join(__dirname, "./users.json"),
        JSON.stringify(dbUsers),
        {
          encoding: "utf-8",
          flag: "w",
        }
      );
      // console.log("[Class] [User] 加入在线列表", store);
    } catch (error) {
      console.error(
        "[DB] [User] 写入用户失败, 内存及文件里都将不包含该用户数据: ",
        error
      );
    }
  }

  /** 所有产生过的用户 */
  static getUsers(except?: boolean) {
    /**
     * TODO: 改用数据库
     */
    try {
      const dbUsers = JSON.parse(
        readFileSync(path.join(__dirname, "./users.json"), "utf-8")
      ) as User[];
      return dbUsers.filter((u) => {
        if (except) {
          return u.name !== "admin";
        }
        return true;
      });
    } catch (error) {
      console.error("[DB] [User] 读取用户失败: ", error);
      return [];
    }
  }

  /** 所有当前连接的用户 */
  static getOnlineUsers(options: { exclude: User[] } = { exclude: [] }) {
    return User.users.filter((user) => !options.exclude.includes(user));
  }

  static getUserById(id: string) {
    return User.users.find((user) => user.id === id);
  }

  static getUserBySocketId(socketId: string) {
    return User.users.find((user) => user.socketId === socketId);
  }

  static getUserByName(name: string) {
    return User.users.find((user) => user.name === name);
  }

  static getUserByRoomId(roomId: string) {
    return User.users.find((user) => user.uniqueRoomId === roomId);
  }

  static setUserOffline(user: User) {
    User.users.splice(User.users.indexOf(user), 1);
    return User.users;
  }
}

function createDemoUsers() {
  return [
    new User(v4(), "John Doe"),
    new User(v4(), "Jane Wick"),
    new User(v4(), "Sam Smith"),
  ];
}

function mapTokenToUser(token: string) {
  const _u = (users as User[]).filter((user) => user.id == token);
  return _u.length ? _u[0] : null;
}

function mapNameToUser(name: string) {
  const _u = (users as User[]).filter((user) => user.name == name);
  return _u.length ? _u[0] : null;
}

export { User, createDemoUsers, mapTokenToUser, mapNameToUser };
