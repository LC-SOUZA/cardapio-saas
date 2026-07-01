"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminAuthCookie, requireAdmin } from "../lib/admin-auth";
import { parseBrazilianMoneyInput } from "../lib/admin-money";
import { supabaseAdmin } from "../lib/supabase-admin";

const DEFAULT_LOGO_EMOJI = "\u{1F37D}\uFE0F";

export async function logoutAdmin() {
  await clearAdminAuthCookie();
  redirect("/admin/login");
}

export async function createBusiness(formData: FormData) {
  await requireAdmin();

  const returnTo = getReturnTo(formData);
  const slug = normalizeSlug(getRequiredString(formData, "slug", "Slug", returnTo));

  if (!slug) {
    redirectAdminError("Slug precisa ter letras ou numeros.", returnTo);
  }

  const { data, error } = await supabaseAdmin
    .from("businesses")
    .insert({
      slug,
      name: getRequiredString(formData, "name", "Nome", returnTo),
      description: getString(formData, "description"),
      whatsapp: getRequiredString(formData, "whatsapp", "WhatsApp", returnTo),
      instagram: getString(formData, "instagram"),
      address: getString(formData, "address"),
      delivery_fee: getMoney(formData, "deliveryFee", "Taxa de entrega", returnTo),
      is_open: getCheckbox(formData, "isOpen"),
      logo_emoji: getString(formData, "logoEmoji") || DEFAULT_LOGO_EMOJI,
      primary_color: getString(formData, "primaryColor") || "#111827",
      secondary_color: getString(formData, "secondaryColor") || "#f59e0b",
    })
    .select("id")
    .single();

  if (error) {
    redirectAdminError(`Nao foi possivel criar a loja: ${error.message}`, returnTo);
  }

  revalidateAdminAndStore(slug, returnTo);
  redirectAdminSuccess(
    "Nova loja criada com sucesso.",
    `/admin/restaurantes/${data.id}`,
  );
}

export async function updateBusiness(formData: FormData) {
  await requireAdmin();

  const returnTo = getReturnTo(formData);
  const businessId = getRequiredString(
    formData,
    "businessId",
    "Restaurante",
    returnTo,
  );
  const slug = getRequiredString(formData, "slug", "Slug", returnTo);

  const { error } = await supabaseAdmin
    .from("businesses")
    .update({
      name: getRequiredString(formData, "name", "Nome", returnTo),
      description: getString(formData, "description"),
      whatsapp: getString(formData, "whatsapp"),
      instagram: getString(formData, "instagram"),
      address: getString(formData, "address"),
      delivery_fee: getMoney(formData, "deliveryFee", "Taxa de entrega", returnTo),
      is_open: getCheckbox(formData, "isOpen"),
      logo_emoji: getString(formData, "logoEmoji") || DEFAULT_LOGO_EMOJI,
      primary_color: getString(formData, "primaryColor") || "#111827",
      secondary_color: getString(formData, "secondaryColor") || "#f59e0b",
    })
    .eq("id", businessId);

  if (error) {
    redirectAdminError(
      `Nao foi possivel salvar o restaurante: ${error.message}`,
      returnTo,
    );
  }

  finishMutation(slug, "Restaurante salvo com sucesso.", returnTo);
}

export async function deleteBusiness(formData: FormData) {
  await requireAdmin();

  const returnTo = getReturnTo(formData);
  const businessId = getRequiredString(
    formData,
    "businessId",
    "Restaurante",
    returnTo,
  );
  const slug = getRequiredString(formData, "slug", "Slug", returnTo);

  const { error } = await supabaseAdmin
    .from("businesses")
    .delete()
    .eq("id", businessId);

  if (error) {
    redirectAdminError(`Nao foi possivel excluir a loja: ${error.message}`, returnTo);
  }

  revalidateAdminAndStore(slug, returnTo);
  redirectAdminSuccess("Loja excluida com sucesso.");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const returnTo = getReturnTo(formData);
  const businessId = getRequiredString(
    formData,
    "businessId",
    "Restaurante",
    returnTo,
  );
  const slug = getRequiredString(formData, "slug", "Slug", returnTo);

  const { error } = await supabaseAdmin.from("categories").insert({
    business_id: businessId,
    name: getRequiredString(formData, "name", "Nome", returnTo),
    description: getString(formData, "description"),
    sort_order: getNumber(formData, "sortOrder"),
    is_active: getCheckbox(formData, "isActive"),
  });

  if (error) {
    redirectAdminError(`Nao foi possivel criar a categoria: ${error.message}`, returnTo);
  }

  finishMutation(slug, "Categoria criada com sucesso.", returnTo);
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();

  const returnTo = getReturnTo(formData);
  const categoryId = getRequiredString(formData, "categoryId", "Categoria", returnTo);
  const businessId = getRequiredString(
    formData,
    "businessId",
    "Restaurante",
    returnTo,
  );
  const slug = getRequiredString(formData, "slug", "Slug", returnTo);

  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("business_id", businessId);

  if (error) {
    redirectAdminError(
      `Nao foi possivel excluir a categoria: ${error.message}`,
      returnTo,
    );
  }

  finishMutation(slug, "Categoria excluida com sucesso.", returnTo);
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  const returnTo = getReturnTo(formData);
  const productId = getRequiredString(formData, "productId", "Produto", returnTo);
  const slug = getRequiredString(formData, "slug", "Slug", returnTo);

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      code: getRequiredString(formData, "code", "Codigo", returnTo),
      name: getRequiredString(formData, "name", "Nome", returnTo),
      description: getString(formData, "description"),
      price: getMoney(formData, "price", "Preco", returnTo, true),
      sort_order: getNumber(formData, "sortOrder"),
    })
    .eq("id", productId);

  if (error) {
    redirectAdminError(`Nao foi possivel salvar o produto: ${error.message}`, returnTo);
  }

  finishMutation(slug, "Produto salvo com sucesso.", returnTo);
}

export async function updateProductAvailability(formData: FormData) {
  await requireAdmin();

  const returnTo = getReturnTo(formData);
  const productId = getRequiredString(formData, "productId", "Produto", returnTo);
  const businessId = getRequiredString(
    formData,
    "businessId",
    "Restaurante",
    returnTo,
  );
  const slug = getRequiredString(formData, "slug", "Slug", returnTo);
  const isAvailable = getRequiredString(
    formData,
    "isAvailable",
    "Disponibilidade",
    returnTo,
  );
  const nextAvailability = isAvailable === "true";

  if (isAvailable !== "true" && isAvailable !== "false") {
    redirectAdminError("Disponibilidade invalida.", returnTo);
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      is_available: nextAvailability,
    })
    .eq("id", productId)
    .eq("business_id", businessId);

  if (error) {
    redirectAdminError(
      `Nao foi possivel alterar a disponibilidade: ${error.message}`,
      returnTo,
    );
  }

  finishMutation(
    slug,
    nextAvailability
      ? "Produto marcado como disponivel."
      : "Produto marcado como indisponivel.",
    returnTo,
  );
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const returnTo = getReturnTo(formData);
  const businessId = getRequiredString(
    formData,
    "businessId",
    "Restaurante",
    returnTo,
  );
  const categoryId = getRequiredString(
    formData,
    "categoryId",
    "Categoria",
    returnTo,
  );
  const slug = getRequiredString(formData, "slug", "Slug", returnTo);

  const { error } = await supabaseAdmin.from("products").insert({
    business_id: businessId,
    category_id: categoryId,
    code: getRequiredString(formData, "code", "Codigo", returnTo),
    name: getRequiredString(formData, "name", "Nome", returnTo),
    description: getString(formData, "description"),
    price: getMoney(formData, "price", "Preco", returnTo, true),
    is_available: true,
    sort_order: getNumber(formData, "sortOrder"),
  });

  if (error) {
    redirectAdminError(`Nao foi possivel criar o produto: ${error.message}`, returnTo);
  }

  finishMutation(slug, "Produto criado com sucesso.", returnTo);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const returnTo = getReturnTo(formData);
  const productId = getRequiredString(formData, "productId", "Produto", returnTo);
  const slug = getRequiredString(formData, "slug", "Slug", returnTo);

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    redirectAdminError(`Nao foi possivel excluir o produto: ${error.message}`, returnTo);
  }

  finishMutation(slug, "Produto excluido com sucesso.", returnTo);
}

function revalidateAdminAndStore(slug: string, adminPath?: string) {
  revalidatePath("/admin");
  revalidatePath(`/loja/${slug}`);

  if (adminPath && adminPath !== "/admin") {
    revalidatePath(adminPath);
  }
}

function finishMutation(slug: string, message: string, returnTo: string): never {
  revalidateAdminAndStore(slug, returnTo);
  redirectAdminSuccess(message, returnTo);
}

function getString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function getRequiredString(
  formData: FormData,
  name: string,
  label: string,
  returnTo: string,
) {
  const value = getString(formData, name);

  if (!value) {
    redirectAdminError(`${label} e obrigatorio.`, returnTo);
  }

  return value;
}

function getCheckbox(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function getMoney(
  formData: FormData,
  name: string,
  label: string,
  returnTo: string,
  required = false,
) {
  const result = parseBrazilianMoneyInput(getString(formData, name), label, {
    required,
  });

  if (!result.ok) {
    redirectAdminError(result.error, returnTo);
  }

  return result.value;
}

function getNumber(formData: FormData, name: string) {
  const value = getString(formData, name);

  if (!value) {
    return 0;
  }

  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

function getReturnTo(formData: FormData) {
  const returnTo = getString(formData, "returnTo");

  if (!returnTo.startsWith("/admin")) {
    return "/admin";
  }

  return returnTo.split("?")[0];
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function redirectAdminSuccess(message: string, pathname = "/admin"): never {
  redirect(`${pathname}?success=${encodeURIComponent(message)}`);
}

function redirectAdminError(message: string, pathname = "/admin"): never {
  redirect(`${pathname}?error=${encodeURIComponent(message)}`);
}
