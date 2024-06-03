import express, { Express } from "express";
import morgan from "morgan";
import cors from "cors";

// import { User, saveUser } from "../db/user";

function initExpress(app: Express) {
  app.use(morgan("dev"));
  app.use(cors());
  app.use(express.json());
  // app.use((req, res, next) => {});
  app.post("/login", (req, res) => {
    // let username = req.body.username;
    // username = username.trim() ? username.trim() : "匿名用户";
    // const user = new User(username);
    // if (user) {
    //   saveUser(user);
    //   res.send(true);
    // }
  });
}

export { initExpress };
