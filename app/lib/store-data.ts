import { supabase } from "./supabase";
import type { Category, Product, Restaurant } from "./store-types";

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

export async function getRestaurantBySlug(
  slug: string,
): Promise<Restaurant | null> {
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      "id, slug, name, description, whatsapp, instagram, address, delivery_fee, is_open, logo_emoji, primary_color, secondary_color, created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (businessError) {
    throw new Error(`Error fetching business: ${businessError.message}`);
  }

  if (!business) {
    return null;
  }

  const businessRow = business as BusinessRow;

  const [categoriesResult, productsResult] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "id, business_id, name, description, sort_order, is_active, created_at",
      )
      .eq("business_id", businessRow.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(
        "id, business_id, category_id, code, name, description, price, is_available, sort_order, created_at",
      )
      .eq("business_id", businessRow.id)
      .eq("is_available", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (categoriesResult.error) {
    throw new Error(
      `Error fetching categories: ${categoriesResult.error.message}`,
    );
  }

  if (productsResult.error) {
    throw new Error(`Error fetching products: ${productsResult.error.message}`);
  }

  const categories = (categoriesResult.data as CategoryRow[]).map(
    mapCategory,
  );
  const products = (productsResult.data as ProductRow[]).map(mapProduct);

  return {
    id: businessRow.id,
    slug: businessRow.slug,
    name: businessRow.name ?? "",
    description: businessRow.description ?? "",
    whatsapp: businessRow.whatsapp ?? "",
    instagram: businessRow.instagram ?? "",
    address: businessRow.address ?? "",
    deliveryFee: Number(businessRow.delivery_fee ?? 0),
    isOpen: Boolean(businessRow.is_open),
    logoEmoji: businessRow.logo_emoji ?? undefined,
    primaryColor: businessRow.primary_color ?? undefined,
    secondaryColor: businessRow.secondary_color ?? undefined,
    createdAt: businessRow.created_at ?? undefined,
    categories,
    products,
  };
}

function mapCategory(category: CategoryRow): Category {
  return {
    id: category.id,
    businessId: category.business_id,
    name: category.name ?? "",
    description: category.description ?? "",
    sortOrder: Number(category.sort_order ?? 0),
    isActive: Boolean(category.is_active),
    createdAt: category.created_at ?? undefined,
  };
}

function mapProduct(product: ProductRow): Product {
  return {
    id: product.id,
    businessId: product.business_id,
    categoryId: product.category_id,
    code: product.code ?? "",
    name: product.name ?? "",
    description: product.description ?? "",
    price: Number(product.price ?? 0),
    available: Boolean(product.is_available),
    sortOrder: Number(product.sort_order ?? 0),
    createdAt: product.created_at ?? undefined,
  };
}
