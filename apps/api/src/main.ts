import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { json, urlencoded } from "express";
import { networkInterfaces } from "os";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);

  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ limit: "10mb", extended: true }));

  app.setGlobalPrefix("api");

  const port = configService.get<number>("PORT", 3000);
  await app.listen(port, '0.0.0.0'); // Local network üzerinden erişilebilir yapar

  // Network adreslerini bul
  const nets = networkInterfaces();
  const networkAddresses: string[] = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // IPv4 ve internal olmayan adresleri al
      if (net.family === 'IPv4' && !net.internal) {
        networkAddresses.push(net.address);
      }
    }
  }

  console.log(`\n🚀 API running on:`);
  console.log(`   ➜ Local:   http://localhost:${port}/api`);
  networkAddresses.forEach(address => {
    console.log(`   ➜ Network: http://${address}:${port}/api`);
  });
  console.log();
}

void bootstrap();
