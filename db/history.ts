/** 历史记录保存，与缓存 */
const offlineMessage = new Map<string, Message[]>();

type Message = {
  roomId: string;
  content: string;
  time: number;
  username: string;
  userId: string;
};

function cacheMessage(roomId: string, message: Message) {
  const messages = offlineMessage.get(roomId) || [];
  messages.push(message);
  offlineMessage.set(roomId, messages);
}

function clearCache(roomId: string) {
  offlineMessage.delete(roomId);
}

function getCache(roomId: string) {
  return offlineMessage.get(roomId) || [];
}

function clearAll() {
  offlineMessage.clear();
}

function loopCache(callback: any) {
  offlineMessage.forEach((value, key) => {
    callback(key, value);
  });
}

export { cacheMessage, clearCache, getCache, clearAll, loopCache, Message };
