export type Message = {
  roomId: string;
  content: string;
  type:
    | "text"
    | "file"
    | "audio-invite"
    | "audio-accept"
    | "audio-reject"
    | "video-invite"
    | "video-accept"
    | "video-reject";
  timestamp: number;
};

const record: Map<string, Message[]> = new Map();

export function cacheMessage(roomId: string, message: Message) {
  const messages = record.get(roomId) || [];
  messages.push(message);
  record.set(roomId, messages);
  console.log("[*] 缓存消息 --- ", record);
}

export function loadMessages(roomId: string) {
  return record.get(roomId) || [];
}
