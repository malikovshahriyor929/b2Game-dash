export type Product = {
  id: string;
  name: string;
  qrCode: string;
  price: number;
  cost?: number;
  stock: number;
  category: "Paketlar" | "Ichimliklar" | "Snack" | "Fast food" | "Energy drink" | "Merch" | "Promo";
  icon: string;
  imageUrl?: string;
};

export type OrderItem = Product & { qty: number };

export type BarSale = {
  id: string;
  date: string;
  time: string;
  operator: string;
  items: {
    productId: string;
    name: string;
    qty: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  branchId: string;
  shiftId?: string;
};
