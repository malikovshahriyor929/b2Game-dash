import { FiCoffee, FiDroplet, FiShoppingBag, FiZap } from "react-icons/fi";
import {
  FaAppleAlt,
  FaBeer,
  FaBirthdayCake,
  FaBreadSlice,
  FaCandyCane,
  FaCarrot,
  FaCheese,
  FaCookieBite,
  FaDrumstickBite,
  FaFish,
  FaHamburger,
  FaHotdog,
  FaIceCream,
  FaLemon,
  FaPepperHot,
  FaPizzaSlice,
  FaWineBottle,
} from "react-icons/fa";
import { RiRestaurantLine } from "react-icons/ri";

export const productIcons = [
  { key: "snack", label: "Snack", Icon: FiShoppingBag },
  { key: "drink", label: "Ichimlik", Icon: FiDroplet },
  { key: "cola", label: "Gazli ichimlik", Icon: FaBeer },
  { key: "water", label: "Suv", Icon: FiDroplet },
  { key: "coffee", label: "Coffee", Icon: FiCoffee },
  { key: "energy", label: "Energy drink", Icon: FiZap },
  { key: "burger", label: "Burger", Icon: RiRestaurantLine },
  { key: "hamburger", label: "Hamburger", Icon: FaHamburger },
  { key: "pizza", label: "Pizza", Icon: FaPizzaSlice },
  { key: "hotdog", label: "Hotdog", Icon: FaHotdog },
  { key: "chicken", label: "Chicken", Icon: FaDrumstickBite },
  { key: "fish", label: "Fish", Icon: FaFish },
  { key: "bread", label: "Bread", Icon: FaBreadSlice },
  { key: "cheese", label: "Cheese", Icon: FaCheese },
  { key: "cookie", label: "Cookie", Icon: FaCookieBite },
  { key: "candy", label: "Candy", Icon: FaCandyCane },
  { key: "icecream", label: "Ice cream", Icon: FaIceCream },
  { key: "cake", label: "Cake", Icon: FaBirthdayCake },
  { key: "fruit", label: "Fruit", Icon: FaAppleAlt },
  { key: "vegetable", label: "Vegetable", Icon: FaCarrot },
  { key: "spicy", label: "Spicy", Icon: FaPepperHot },
  { key: "juice", label: "Juice", Icon: FaLemon },
  { key: "bottle", label: "Bottle", Icon: FaWineBottle },
] as const;

export function ProductIcon({ iconKey, className }: { iconKey?: string; className?: string }) {
  const match = productIcons.find((item) => item.key === iconKey) ?? productIcons[0];
  const Icon = match.Icon;
  return <Icon className={className} />;
}
