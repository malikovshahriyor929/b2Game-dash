export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: "Paketlar" | "Ichimliklar" | "Snack" | "Fast food" | "Energy drink" | "Merch" | "Promo";
  icon: string;
};

export type OrderItem = Product & { qty: number };
