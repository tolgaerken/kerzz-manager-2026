import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);

  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ limit: "10mb", extended: true }));

  app.setGlobalPrefix("api");

  const port = configService.get<number>("PORT", 3000);
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/api`);
}

void bootstrap();
