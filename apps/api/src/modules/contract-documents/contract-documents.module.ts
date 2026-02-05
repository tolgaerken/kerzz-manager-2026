import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContractDocumentsController } from "./contract-documents.controller";
import { ContractDocumentsService } from "./contract-documents.service";
import { ContractDocument, ContractDocumentSchema } from "./schemas/contract-document.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ContractDocument.name, schema: ContractDocumentSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [ContractDocumentsController],
  providers: [ContractDocumentsService],
  exports: [ContractDocumentsService]
})
export class ContractDocumentsModule {}
