export function formatINR(rupees: number): string {
  return "₹" + rupees.toLocaleString("en-IN");
}

export const FREE_SHIPPING_THRESHOLD = 2000;
export const SHIPPING_FEE = 99;
