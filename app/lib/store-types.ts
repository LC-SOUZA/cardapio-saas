export type Product = {
  id: string;
  businessId?: string;
  categoryId: string;
  code: string;
  name: string;
  description: string;
  price: number;
  available?: boolean;
  sortOrder?: number;
  createdAt?: string;
};

export type Category = {
  id: string;
  businessId?: string;
  name: string;
  description: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description: string;
  whatsapp: string;
  instagram: string;
  address: string;
  deliveryFee: number;
  isOpen: boolean;
  logoEmoji?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt?: string;
  categories: Category[];
  products: Product[];
};
