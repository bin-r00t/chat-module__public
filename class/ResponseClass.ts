export class SocketResponseBase {
  data: any;
  message: string | null;
  error: string | null;

  constructor(data: any, message: string | null, error: string | null) {
    this.data = data;
    this.message = message;
    this.error = error;
  }
}

export class SocketError extends SocketResponseBase {
  constructor(error: string) {
    super(null, null, error);
  }
}

export class SocketResponse extends SocketResponseBase {
  constructor(data: any, message: string) {
    super(data, message, null);
  }
}
