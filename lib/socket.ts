import { Server } from "socket.io"

let io: Server

export function getIO(server: any) {
  if (!io) {
    io = new Server(server, {
      cors: { origin: "*" }
    })
  }
  return io
}