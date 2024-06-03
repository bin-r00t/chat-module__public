import { io } from "socket.io-client";
import { assert } from "chai";
import { describe, it } from "mocha";
import { Socket } from "socket.io";
import { fork } from "child_process";
import path from "path";

// const { io } = require("socket.io-client");
// const { assert } = require("chai");
// const { describe, it } = require("mocha");
// const { Socket } = require("socket.io");
// const { fork } = require("child_process");
// const { join } = require("path");

/**
 * ts-node mocha issue:
 * https://stackoverflow.com/questions/40910864/cannot-find-module-ts-node-register
 */

describe("Normal User", () => {

  before((done) => {
    console.log("[*] setting testing server...", path.resolve());
    // TODO 这里有错误
    fork("ts-node " + path.join(path.resolve(), "server.ts"), {
      env: {
        PORT: "13000",
      },
    });
    done();
  });

  it("user join", (done) => {
    console.log("[*] connect to server");
    done();
  });
});
