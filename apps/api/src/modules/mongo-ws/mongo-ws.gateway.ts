import { Logger } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import type {
  MongoChangeEvent,
  CollectionSubscription,
} from "./mongo-ws.types";

/**
 * Global WebSocket gateway.
 *
 * Client'lar "subscribe" mesaji ile collection adini bildirir,
 * gateway o client'i ilgili room'a ekler.
 * Change stream degisiklikleri "change" eventi ile ilgili room'a yayinlanir.
 */
@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/mongo-ws",
})
export class MongoWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MongoWsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(
      `Client baglandi: ${client.id} (transport: ${client.conn.transport.name})`
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client ayrildi: ${client.id} (reason: manual)`
    );
  }

  /**
   * Client belirli bir collection'i dinlemek istediginde cagirilir.
   * Client ilgili room'a eklenir.
   */
  @SubscribeMessage("subscribe")
  handleSubscribe(client: Socket, payload: CollectionSubscription) {
    const room = `collection:${payload.collection}`;
    client.join(room);
    this.logger.log(
      `[subscribe] Client ${client.id} => room "${room}" abone oldu`
    );
  }

  /**
   * Client dinlemeyi birakmak istediginde cagirilir.
   */
  @SubscribeMessage("unsubscribe")
  handleUnsubscribe(client: Socket, payload: CollectionSubscription) {
    const room = `collection:${payload.collection}`;
    client.leave(room);
    this.logger.log(
      `[unsubscribe] Client ${client.id} => room "${room}" abonelikten cikarildi`
    );
  }

  /**
   * Change stream'den gelen degisikligi ilgili room'a yayinlar.
   * ChangeStreamService tarafindan cagirilir.
   */
  async emitChange(event: MongoChangeEvent) {
    const room = `collection:${event.collection}`;
    const sockets = await this.server.in(room).fetchSockets();
    const clientCount = sockets.length;

    this.server.to(room).emit("change", event);
    this.logger.log(
      `[emit] ${event.collection} [${event.operationType}] doc=${event.documentId} => ${clientCount} client'a gonderildi`
    );
  }
}
