import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Contract,
  ContractDocument,
} from "../contracts/schemas/contract.schema";
import {
  ContractUser,
  ContractUserDocument,
} from "../contract-users/schemas/contract-user.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { normalizeEmail, normalizePhone } from "./notification-data.helper";

export interface ContactDto {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface ContractUserInfo {
  name?: string;
  email?: string;
  gsm?: string;
  role?: string;
}

export interface CustomerContactInfo {
  name?: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class NotificationContactService {
  constructor(
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    @InjectModel(ContractUser.name, CONTRACT_DB_CONNECTION)
    private contractUserModel: Model<ContractUserDocument>
  ) {}

  /**
   * Müşteri iletişim bilgilerini kontrat kullanıcılarıyla birleştirir, mükerrerleri temizler.
   * Karşılaştırma normalize edilmiş email ve telefon üzerinden yapılır.
   */
  buildContactList(
    customer: CustomerContactInfo | null,
    contractUsers: ContractUserInfo[]
  ): ContactDto[] {
    const contacts: ContactDto[] = [];
    const seenKeys = new Set<string>();

    const addContact = (
      name: string,
      email: string,
      phone: string,
      role: string
    ) => {
      const normEmail = normalizeEmail(email);
      const normPhone = normalizePhone(phone);

      if (!normEmail && !normPhone) return;

      const key = `${normEmail}|${normPhone}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);

      contacts.push({ name, email: normEmail, phone: normPhone, role });
    };

    if (customer) {
      // customer.name firma adıdır, kişi adı değil - bu yüzden name boş bırakılır
      // Kişi adı sadece contractUser'dan gelir
      addContact(
        "",
        customer.email ?? "",
        customer.phone ?? "",
        "primary"
      );
    }

    for (const cu of contractUsers) {
      addContact(
        cu.name ?? "",
        cu.email ?? "",
        cu.gsm ?? "",
        cu.role ?? ""
      );
    }

    return contacts;
  }

  /**
   * Bir müşterinin tüm kontratlarına ait kontrat kullanıcılarını getirir.
   * customerId → Contract.id → ContractUser.contractId zinciri
   */
  async getContractUsersForCustomer(
    customerIds: string[]
  ): Promise<Map<string, ContractUserInfo[]>> {
    if (customerIds.length === 0) return new Map();

    const contracts = await this.contractModel
      .find({ customerId: { $in: customerIds } }, { customerId: 1, id: 1 })
      .lean()
      .exec();

    const contractInternalIds = contracts
      .map((c) => c.id)
      .filter((id): id is string => !!id);

    const contractUsers = contractInternalIds.length > 0
      ? await this.contractUserModel
          .find({ contractId: { $in: contractInternalIds } })
          .lean()
          .exec()
      : [];

    const contractToCustomer = new Map<string, string>();
    for (const c of contracts) {
      if (c.id && c.customerId) {
        contractToCustomer.set(c.id, c.customerId);
      }
    }

    const result = new Map<string, ContractUserInfo[]>();
    for (const cu of contractUsers) {
      const cid = contractToCustomer.get(cu.contractId);
      if (!cid) continue;
      if (!result.has(cid)) result.set(cid, []);
      result.get(cid)!.push({ name: cu.name, email: cu.email, gsm: cu.gsm, role: cu.role });
    }

    return result;
  }

  /**
   * Bir kontrattaki kontrat kullanıcılarını getirir.
   * contract.id üzerinden sorgu yapılır.
   */
  async getContractUsersForContract(
    contractId: string
  ): Promise<ContractUserInfo[]> {
    if (!contractId) return [];
    return this.contractUserModel
      .find({ contractId })
      .lean()
      .exec();
  }

  /**
   * Tek bir müşteri için kontrat kullanıcılarını getirir ve contact listesi oluşturur.
   */
  async buildContactListForCustomer(
    customer: CustomerContactInfo | null,
    customerId: string
  ): Promise<ContactDto[]> {
    if (!customerId) {
      return this.buildContactList(customer, []);
    }

    const contractUsersMap = await this.getContractUsersForCustomer([customerId]);
    const contractUsers = contractUsersMap.get(customerId) ?? [];
    return this.buildContactList(customer, contractUsers);
  }

  /**
   * Tek bir kontrat için kontrat kullanıcılarını getirir ve contact listesi oluşturur.
   */
  async buildContactListForContract(
    customer: CustomerContactInfo | null,
    contractId: string
  ): Promise<ContactDto[]> {
    const contractUsers = await this.getContractUsersForContract(contractId);
    return this.buildContactList(customer, contractUsers);
  }
}
