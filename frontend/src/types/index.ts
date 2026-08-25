export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
}

export interface ProductSize {
  id: string;
  menuItemId: string;
  name: string;
  price: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  description: string | null;
  image: string | null;
  active: boolean;
  isPizza: boolean;
  featured: boolean;
  sortOrder: number;
  sizes: ProductSize[];
}

export interface CategoryWithItems extends Category {
  menuItems: MenuItem[];
}

export interface Topping {
  id: string;
  name: string;
  price: string;
  premium: boolean;
  active: boolean;
  sortOrder: number;
}

export interface PizzaToppingFees {
  small: number;
  medium: number;
  large: number;
  premium: number;
}

export interface Deal {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  active: boolean;
  sortOrder: number;
}

export type OrderType = "PICKUP" | "DELIVERY";
export type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

export interface CartLineCustomization {
  crust?: string;
  toppingIds: string[];
  toppingNames: string[];
  specialInstructions?: string;
}

export interface CartLine {
  cartLineId: string;
  menuItemId: string;
  name: string;
  image: string | null;
  isPizza: boolean;
  sizeId: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  customization: CartLineCustomization;
}

export interface OrderItemDTO {
  id: string;
  nameSnapshot: string;
  quantity: number;
  size: string | null;
  basePrice: string;
  price: string;
  customization: {
    crust?: string;
    toppings?: { name: string; price: number }[];
    specialInstructions?: string;
  } | null;
}

export interface OrderDTO {
  id: string;
  ticketNumber: string;
  customerName: string;
  phone: string;
  email: string | null;
  orderType: OrderType;
  address: string | null;
  apartment: string | null;
  city: string | null;
  postalCode: string | null;
  deliveryNotes: string | null;
  isAsap: boolean;
  requestedTime: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  items: OrderItemDTO[];
}
