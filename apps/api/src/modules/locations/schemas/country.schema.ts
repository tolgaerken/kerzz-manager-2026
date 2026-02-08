import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CountryDocument = Country & Document;

@Schema({ collection: "countries" })
export class Country {
  @Prop()
  id: number;

  @Prop()
  name: string;

  @Prop()
  nativeName: string;

  @Prop()
  alpha2Code: string;

  @Prop()
  alpha3Code: string;

  @Prop()
  capital: string;

  @Prop({ type: [String], default: [] })
  callingCodes: string[];

  @Prop()
  flag: string;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
