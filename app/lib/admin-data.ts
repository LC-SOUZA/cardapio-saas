import { supabaseAdmin } from "./supabase-admin";

type BusinessRow = {
  id: string;
  slug: string;
  name: string | null;
  description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  address: string | null;
  delivery_fee: number | string | null;
  is_open: boolean | null;
  logo_emoji: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  created_at: string | null;
};

type CategoryRow = {
  id: string;
  business_id: string;
  name: string | null;
  description: string | null;
  sort_order: number | string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type ProductRow = {
  id: string;
  business_id: string;
  category_id: string;
  code: string | null;
  name: string | null;
  description: string | null;
  price: number | string | null;
  is_available: boolean | null;
  sort_order: number | string | null;
  created_at: string | null;
};

export type AdminProduct = {
  id: string;
  businessId: string;
  categoryId: string;
  code: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  sortOrder: number;
  createdAt?: string;
};

export type AdminCategory = {
  id: string;
  businessId: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  products: AdminProduct[];
};

export type AdminBusiness = {
  id: string;
  slug: string;
  name: string;
  description: string;
  whatsapp: string;
  instagram: string;
  address: string;
  deliveryFee: number;
  isOpen: boolean;
  logoEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt?: string;
  categories: AdminCategory[];
};

export async function getAdminDashboardData() {
  const [businessesResult, categoriesResult, productsResult] =
    await Promise.all([
      supabaseAdmin
        .from("businesses")
        .select(
          "id, slug, name, description, whatsapp, instagram, address, delivery_fee, is_open, logo_emoji, primary_color, secondary_color, created_at",
        )
        .order("name", { ascending: true }),
      supabaseAdmin
        .from("categories")
        .select(
          "id, business_id, name, description, sort_order, is_active, created_at",
        )
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("products")
        .select(
          "id, business_id, category_id, code, name, description, price, is_available, sort_order, created_at",
        )
        .order("sort_order", { ascending: true }),
    ]);

  if (businessesResult.error) {
    throw new Error(`Error loading businesses: ${businessesResult.error.message}`);
  }

  if (categoriesResult.error) {
    throw new Error(
      `Error loading categories: ${categoriesResult.error.message}`,
    );
  }

  if (productsResult.error) {
    throw new Error(`Error loading products: ${productsResult.error.message}`);
  }

  const productsByCategory = new Map<string, AdminProduct[]>();

  for (const productRow of (productsResult.data ?? []) as ProductRow[]) {
    const product = mapProduct(productRow);
    const products = productsByCategory.get(product.categoryId) ?? [];
    products.push(product);
    productsByCategory.set(product.categoryId, products);
  }

  const categoriesByBusiness = new Map<string, AdminCategory[]>();

  for (const categoryRow of (categoriesResult.data ?? []) as CategoryRow[]) {
    const category = mapCategory(categoryRow);
    category.products = productsByCategory.get(category.id) ?? [];

    const categories = categoriesByBusiness.get(category.businessId) ?? [];
    categories.push(category);
    categoriesByBusiness.set(category.businessId, categories);
  }

  return ((businessesResult.data ?? []) as BusinessRow[]).map((business) => ({
    ...mapBusiness(business),
    categories: categoriesByBusiness.get(business.id) ?? [],
  }));
}

export async function getAdminBusinessById(id: string) {
  const businesses = await getAdminDashboardData();

  return businesses.find((business) => business.id === id) ?? null;
}

function mapBusiness(business: BusinessRow): Omit<AdminBusiness, "categories"> {
  return {
    id: business.id,
    slug: business.slug,
    name: business.name ?? "",
    description: business.description ?? "",
    whatsapp: business.whatsapp ?? "",
    instagram: business.instagram ?? "",
    address: business.address ?? "",
    deliveryFee: Number(business.delivery_fee ?? 0),
    isOpen: Boolean(business.is_open),
    logoEmoji: business.logo_emoji ?? "",
    primaryColor: business.primary_color ?? "",
    secondaryColor: business.secondary_color ?? "",
    createdAt: business.created_at ?? undefined,
  };
}

function mapCategory(category: CategoryRow): AdminCategory {
  return {
    id: category.id,
    businessId: category.business_id,
    name: category.name ?? "",
    description: category.description ?? "",
    sortOrder: Number(category.sort_order ?? 0),
    isActive: Boolean(category.is_active),
    createdAt: category.created_at ?? undefined,
    products: [],
  };
}

function mapProduct(product: ProductRow): AdminProduct {
  return {
    id: product.id,
    businessId: product.business_id,
    categoryId: product.category_id,
    code: product.code ?? "",
    name: product.name ?? "",
    description: product.description ?? "",
    price: Number(product.price ?? 0),
    isAvailable: Boolean(product.is_available),
    sortOrder: Number(product.sort_order ?? 0),
    createdAt: product.created_at ?? undefined,
  };
}
