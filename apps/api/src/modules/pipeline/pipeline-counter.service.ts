import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Counter, CounterDocument } from "./schemas/counter.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class PipelineCounterService {
  constructor(
    @InjectModel(Counter.name, CONTRACT_DB_CONNECTION)
    private counterModel: Model<CounterDocument>
  ) {}

  /**
   * Yeni pipelineRef üretir: PL-YYYY-NNNNN
   * MongoDB findOneAndUpdate ile atomik increment yapar.
   */
  async generateRef(): Promise<string> {
    const year = new Date().getFullYear();
    const counterId = `pipeline-${year}`;

    const counter = await this.counterModel.findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seq = counter.seq.toString().padStart(5, "0");
    return `PL-${year}-${seq}`;
  }

  /**
   * Sale için yeni no üretir (incremental)
   * MongoDB findOneAndUpdate ile atomik increment yapar.
   */
  async generateSaleNo(): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { _id: "sale-no" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return counter.seq;
  }

  /**
   * Offer için yeni no üretir (incremental)
   * MongoDB findOneAndUpdate ile atomik increment yapar.
   */
  async generateOfferNo(): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { _id: "offer-no" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return counter.seq;
  }
}
