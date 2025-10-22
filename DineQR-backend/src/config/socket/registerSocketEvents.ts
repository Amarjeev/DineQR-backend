import { Server, Socket } from "socket.io";
import hotelOrdersRoom from "./rooms/hotelOrdersRoom";
import hotelConfirmedOrdersRoom from "./rooms/hotelConfirmedOrdersRoom";
import hotelNotificationRoom from "./rooms/hotelNotificationRoom";
import hotelGuestOrdersRoom from "./rooms/hotelGuestOrdersRoom";
import hotelGuestNotificationRoom from "./rooms/hotelGuestNotificationRoom";

/**
 * Main socket event registration function
 * Registers all room-specific event handlers for socket connections
 *
 * @param io - Socket.IO Server instance for broadcasting
 * @param socket - Individual socket connection for event handling
 */
export default function registerSocketEvents(io: Server, socket: Socket) {
  // Register hotel orders room events and handlers
  hotelOrdersRoom(io, socket);

  // Register hotel confirmed orders room events and handlers
  hotelConfirmedOrdersRoom(io, socket);

  // Register hotel notification room events and handlers
  hotelNotificationRoom(io, socket);

  // Register hotel guest orders room events and handlers
  hotelGuestOrdersRoom(io, socket);

  // Register hotel guest  notification room events and handlers
  hotelGuestNotificationRoom(io, socket);
}
