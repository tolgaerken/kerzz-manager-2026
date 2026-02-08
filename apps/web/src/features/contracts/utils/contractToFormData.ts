import type { Contract, CreateContractInput } from "../types";

const getDateInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export function contractToFormData(contract: Contract): CreateContractInput {
  const startDate = getDateInputValue(contract.startDate);
  const endDate = getDateInputValue(contract.endDate);

  return {
    customerId: contract.customerId || "",
    description: contract.description || "",
    startDate: startDate || new Date().toISOString().split("T")[0],
    endDate,
    noEndDate: !endDate,
    internalFirm: contract.internalFirm || "",
    yearly: !!contract.yearly,
    maturity: 0,
    lateFeeType: "yi-ufe",
    incraseRateType: "yi-ufe",
    incrasePeriod: "3-month",
    noVat: false,
    noNotification: false
  };
}
