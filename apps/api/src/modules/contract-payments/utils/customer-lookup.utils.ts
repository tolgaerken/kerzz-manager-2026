import { Model, isValidObjectId } from "mongoose";
import {
  Customer,
  CustomerDocument,
} from "../../customers/schemas/customer.schema";

/**
 * Musteri arar: customerId ile tek $or sorgusu kullanir.
 * ObjectId gecerliyse _id, degilse id ve erpId uzerinden arar.
 */
export async function findCustomerByAnyId(
  customerModel: Model<CustomerDocument>,
  customerId: string,
): Promise<Customer | null> {
  const orConditions: Array<Record<string, string>> = [
    { id: customerId },
    { erpId: customerId },
  ];

  // Gecerli ObjectId ise _id ile de ara
  if (isValidObjectId(customerId)) {
    orConditions.unshift({ _id: customerId });
  }

  return customerModel.findOne({ $or: orConditions }).lean().exec();
}
