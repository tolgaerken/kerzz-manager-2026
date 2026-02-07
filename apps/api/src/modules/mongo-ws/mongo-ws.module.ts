import { Global, Module } from "@nestjs/common";
import { MongoWsGateway } from "./mongo-ws.gateway";
import { ChangeStreamService } from "./change-stream.service";

/**
 * Global MongoDB WebSocket modulu.
 *
 * AppModule'e bir kez import edilir.
 * Diger moduller ChangeStreamService'i inject ederek
 * kendi collection'larini kayit edebilir.
 */
@Global()
@Module({
  providers: [MongoWsGateway, ChangeStreamService],
  exports: [ChangeStreamService],
})
export class MongoWsModule {}
