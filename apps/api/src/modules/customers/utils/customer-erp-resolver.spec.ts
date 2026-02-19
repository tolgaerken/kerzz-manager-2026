import {
  resolveCustomerErpId,
  getCustomerErpId,
  findErpMappingByCompany,
  hasErpIdForCompany,
} from "./customer-erp-resolver";
import type { Customer, ErpMapping } from "../schemas/customer.schema";

describe("customer-erp-resolver", () => {
  describe("resolveCustomerErpId", () => {
    it("null/undefined müşteri için empty döner", () => {
      expect(resolveCustomerErpId(null)).toEqual({ erpId: "", source: "empty" });
      expect(resolveCustomerErpId(undefined)).toEqual({ erpId: "", source: "empty" });
    });

    it("legacy erpId varsa onu döner (en yüksek öncelik)", () => {
      const customer = {
        erpId: "LEGACY-001",
        erpMappings: [
          { companyId: "VERI", erpId: "MAPPING-001", isPrimary: true },
        ],
      } as Pick<Customer, "erpId" | "erpMappings">;

      const result = resolveCustomerErpId(customer);
      expect(result).toEqual({ erpId: "LEGACY-001", source: "legacy" });
    });

    it("legacy erpId boşsa mapping'den döner", () => {
      const customer = {
        erpId: "",
        erpMappings: [
          { companyId: "VERI", erpId: "MAPPING-001", isPrimary: false },
        ],
      } as Pick<Customer, "erpId" | "erpMappings">;

      const result = resolveCustomerErpId(customer);
      expect(result).toEqual({ erpId: "MAPPING-001", source: "first" });
    });

    it("context ile eşleşen mapping'i döner", () => {
      const customer = {
        erpId: "",
        erpMappings: [
          { companyId: "VERI", erpId: "VERI-001", isPrimary: false },
          { companyId: "KERZZ", erpId: "KERZZ-001", isPrimary: false },
        ],
      } as Pick<Customer, "erpId" | "erpMappings">;

      const result = resolveCustomerErpId(customer, { companyId: "KERZZ" });
      expect(result).toEqual({ erpId: "KERZZ-001", source: "mapping" });
    });

    it("context internalFirm ile de çalışır", () => {
      const customer = {
        erpId: "",
        erpMappings: [
          { companyId: "VERI", erpId: "VERI-001", isPrimary: false },
          { companyId: "KERZZ", erpId: "KERZZ-001", isPrimary: false },
        ],
      } as Pick<Customer, "erpId" | "erpMappings">;

      const result = resolveCustomerErpId(customer, { internalFirm: "KERZZ" });
      expect(result).toEqual({ erpId: "KERZZ-001", source: "mapping" });
    });

    it("context eşleşmezse primary mapping'i döner", () => {
      const customer = {
        erpId: "",
        erpMappings: [
          { companyId: "VERI", erpId: "VERI-001", isPrimary: false },
          { companyId: "KERZZ", erpId: "KERZZ-001", isPrimary: true },
        ],
      } as Pick<Customer, "erpId" | "erpMappings">;

      const result = resolveCustomerErpId(customer, { companyId: "UNKNOWN" });
      expect(result).toEqual({ erpId: "KERZZ-001", source: "primary" });
    });

    it("primary yoksa ilk geçerli mapping'i döner", () => {
      const customer = {
        erpId: "",
        erpMappings: [
          { companyId: "VERI", erpId: "VERI-001", isPrimary: false },
          { companyId: "KERZZ", erpId: "KERZZ-001", isPrimary: false },
        ],
      } as Pick<Customer, "erpId" | "erpMappings">;

      const result = resolveCustomerErpId(customer);
      expect(result).toEqual({ erpId: "VERI-001", source: "first" });
    });

    it("boş mapping dizisi için empty döner", () => {
      const customer = {
        erpId: "",
        erpMappings: [],
      } as Pick<Customer, "erpId" | "erpMappings">;

      const result = resolveCustomerErpId(customer);
      expect(result).toEqual({ erpId: "", source: "empty" });
    });

    it("case-insensitive companyId eşleştirmesi yapar", () => {
      const customer = {
        erpId: "",
        erpMappings: [
          { companyId: "VERI", erpId: "VERI-001", isPrimary: false },
        ],
      } as Pick<Customer, "erpId" | "erpMappings">;

      const result = resolveCustomerErpId(customer, { companyId: "veri" });
      expect(result).toEqual({ erpId: "VERI-001", source: "mapping" });
    });
  });

  describe("getCustomerErpId", () => {
    it("sadece erpId string döner", () => {
      const customer = {
        erpId: "LEGACY-001",
        erpMappings: [],
      } as Pick<Customer, "erpId" | "erpMappings">;

      expect(getCustomerErpId(customer)).toBe("LEGACY-001");
    });

    it("null müşteri için boş string döner", () => {
      expect(getCustomerErpId(null)).toBe("");
    });
  });

  describe("findErpMappingByCompany", () => {
    const mappings: ErpMapping[] = [
      { companyId: "VERI", erpId: "VERI-001", isPrimary: false },
      { companyId: "KERZZ", erpId: "KERZZ-001", isPrimary: true },
    ];

    it("companyId ile eşleşen mapping'i bulur", () => {
      const result = findErpMappingByCompany(mappings, "KERZZ");
      expect(result).toEqual({ companyId: "KERZZ", erpId: "KERZZ-001", isPrimary: true });
    });

    it("eşleşme yoksa undefined döner", () => {
      const result = findErpMappingByCompany(mappings, "UNKNOWN");
      expect(result).toBeUndefined();
    });

    it("boş mappings için undefined döner", () => {
      expect(findErpMappingByCompany([], "VERI")).toBeUndefined();
      expect(findErpMappingByCompany(undefined, "VERI")).toBeUndefined();
    });

    it("case-insensitive eşleştirme yapar", () => {
      const result = findErpMappingByCompany(mappings, "veri");
      expect(result?.companyId).toBe("VERI");
    });
  });

  describe("hasErpIdForCompany", () => {
    it("legacy erpId varsa true döner", () => {
      const customer = {
        erpId: "LEGACY-001",
        erpMappings: [],
      } as Pick<Customer, "erpId" | "erpMappings">;

      expect(hasErpIdForCompany(customer)).toBe(true);
      expect(hasErpIdForCompany(customer, "VERI")).toBe(true);
    });

    it("legacy erpId yoksa mapping'e bakar", () => {
      const customer = {
        erpId: "",
        erpMappings: [
          { companyId: "VERI", erpId: "VERI-001", isPrimary: false },
        ],
      } as Pick<Customer, "erpId" | "erpMappings">;

      expect(hasErpIdForCompany(customer)).toBe(true);
      expect(hasErpIdForCompany(customer, "VERI")).toBe(true);
      expect(hasErpIdForCompany(customer, "KERZZ")).toBe(false);
    });

    it("null müşteri için false döner", () => {
      expect(hasErpIdForCompany(null)).toBe(false);
    });

    it("boş erpId ve boş mappings için false döner", () => {
      const customer = {
        erpId: "",
        erpMappings: [],
      } as Pick<Customer, "erpId" | "erpMappings">;

      expect(hasErpIdForCompany(customer)).toBe(false);
    });
  });
});
