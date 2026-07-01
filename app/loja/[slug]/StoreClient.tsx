"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "../../lib/format";
import type { Product, Restaurant } from "../../lib/store-types";

type StoreClientProps = {
  restaurant: Restaurant;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type OrderType = "delivery" | "pickup";
type PaymentMethod = "pix" | "cash" | "card";
type NeedsChange = "no" | "yes";

type CheckoutForm = {
  firstName: string;
  lastName: string;
  phone: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  address: string;
  number: string;
  neighborhood: string;
  complement: string;
  reference: string;
  needsChange: NeedsChange;
  changeFor: string;
  notes: string;
};

type StoreVisual = {
  logo: string;
  gradient: string;
  accent: string;
  button: string;
};

const storeVisuals: Record<string, StoreVisual> = {
  "pao-de-alho-do-julio": {
    logo: "\u{1F9C4}",
    gradient: "from-amber-500 via-orange-500 to-emerald-700",
    accent: "bg-amber-100 text-amber-950 ring-amber-200",
    button: "bg-zinc-950 text-white hover:bg-zinc-800",
  },
  "acai-da-maria": {
    logo: "\u{1F367}",
    gradient: "from-fuchsia-700 via-violet-600 to-cyan-500",
    accent: "bg-fuchsia-100 text-fuchsia-950 ring-fuchsia-200",
    button: "bg-fuchsia-700 text-white hover:bg-fuchsia-800",
  },
};

const emptyForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  phone: "",
  orderType: "delivery",
  paymentMethod: "pix",
  address: "",
  number: "",
  neighborhood: "",
  complement: "",
  reference: "",
  needsChange: "no",
  changeFor: "",
  notes: "",
};

const paymentLabels: Record<PaymentMethod, string> = {
  pix: "Pix",
  cash: "Dinheiro",
  card: "Cart\u00e3o na entrega",
};

const orderTypeLabels: Record<OrderType, string> = {
  delivery: "Entrega",
  pickup: "Retirada",
};

export default function StoreClient({ restaurant }: StoreClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [recentlyAddedProductId, setRecentlyAddedProductId] = useState<
    string | null
  >(null);
  const [cartHighlight, setCartHighlight] = useState(false);
  const cartSectionRef = useRef<HTMLElement | null>(null);

  const visual =
    storeVisuals[restaurant.slug] ?? buildFallbackVisual(restaurant.name);
  const logo = restaurant.logoEmoji || visual.logo;
  const heroStyle =
    restaurant.primaryColor && restaurant.secondaryColor
      ? {
          backgroundImage: `linear-gradient(135deg, ${restaurant.primaryColor}, ${restaurant.secondaryColor})`,
        }
      : undefined;

  const instagramHandle = restaurant.instagram.replace("@", "");
  const whatsappUrl = `https://wa.me/${restaurant.whatsapp}`;

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    [cart],
  );
  const deliveryFee =
    form.orderType === "delivery" ? restaurant.deliveryFee : 0;
  const total = subtotal + deliveryFee;
  const totalItems = useMemo(
    () => cart.reduce((totalItems, item) => totalItems + item.quantity, 0),
    [cart],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!recentlyAddedProductId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setRecentlyAddedProductId(null);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [recentlyAddedProductId]);

  useEffect(() => {
    if (!cartHighlight) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCartHighlight(false);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [cartHighlight]);

  function updateForm<Field extends keyof CheckoutForm>(
    field: Field,
    value: CheckoutForm[Field],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function addToCart(product: Product) {
    if (product.available === false) {
      setToast("Produto indisponivel no momento");
      return;
    }

    setCart((current) => {
      const itemExists = current.some(
        (item) => item.product.id === product.id,
      );

      if (!itemExists) {
        return [...current, { product, quantity: 1 }];
      }

      return current.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    });
    setRecentlyAddedProductId(product.id);
    setCartHighlight(true);
    setToast("Produto adicionado ao pedido");
  }

  function scrollToCart() {
    cartSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function increaseQuantity(productId: string) {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function decreaseQuantity(productId: string) {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.product.id !== productId) {
          return item;
        }

        if (item.quantity === 1) {
          return [];
        }

        return { ...item, quantity: item.quantity - 1 };
      }),
    );
  }

  function removeFromCart(productId: string) {
    setCart((current) =>
      current.filter((item) => item.product.id !== productId),
    );
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (cart.length === 0) {
      nextErrors.cart = "Adicione pelo menos um item ao pedido.";
    }

    if (!form.firstName.trim()) {
      nextErrors.firstName = "Informe o nome.";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = "Informe o sobrenome.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Informe o telefone.";
    }

    if (form.orderType === "delivery") {
      if (!form.address.trim()) {
        nextErrors.address = "Informe o endereco.";
      }

      if (!form.number.trim()) {
        nextErrors.number = "Informe o numero.";
      }

      if (!form.neighborhood.trim()) {
        nextErrors.neighborhood = "Informe o bairro.";
      }
    }

    if (
      form.paymentMethod === "cash" &&
      form.needsChange === "yes" &&
      !form.changeFor.trim()
    ) {
      nextErrors.changeFor = "Informe o valor para troco.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function sendOrderToWhatsApp() {
    if (!validateForm()) {
      return;
    }

    const orderCode = generateOrderCode(restaurant);
    const message = buildWhatsAppMessage({
      orderCode,
      restaurant,
      cart,
      form,
      subtotal,
      deliveryFee,
      total,
    });
    const url = `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank");
  }

  return (
    <main
      className={`min-h-screen bg-zinc-50 text-zinc-950 ${
        cart.length > 0 ? "pb-36 lg:pb-0" : "pb-0"
      }`}
    >
      <section
        className={`${
          heroStyle ? "" : `bg-gradient-to-br ${visual.gradient}`
        } text-white`}
        style={heroStyle}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <a
              href={whatsappUrl}
              className="rounded-lg border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/25"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <span
              className={`inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold ${
                restaurant.isOpen ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  restaurant.isOpen ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              {restaurant.isOpen ? "Aberto agora" : "Fechado agora"}
            </span>
          </div>

          <div className="grid gap-8 py-6 md:grid-cols-[1fr_280px] md:items-end">
            <div className="flex max-w-3xl flex-col gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white text-5xl shadow-lg shadow-black/10">
                {logo}
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
                  Cardapio digital
                </p>
                <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
                  {restaurant.name}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                  {restaurant.description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg bg-white p-4 text-zinc-950 shadow-xl shadow-black/10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Endereco
                </p>
                <p className="mt-1 text-sm font-medium leading-6">
                  {restaurant.address}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-zinc-200 pt-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Entrega
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {formatCurrency(restaurant.deliveryFee)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Instagram
                  </p>
                  <a
                    href={`https://instagram.com/${instagramHandle}`}
                    className="mt-1 block text-sm font-bold text-zinc-950 underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {restaurant.instagram}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="flex min-w-0 flex-col gap-8">
          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Categorias
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Explore o cardapio
                </h2>
              </div>
              <p className="hidden text-sm font-medium text-zinc-500 sm:block">
                {restaurant.products.length} itens no cardapio
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {restaurant.categories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className={`shrink-0 rounded-lg px-4 py-3 text-sm font-bold ring-1 ${visual.accent}`}
                >
                  {category.name}
                </a>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-10">
            {restaurant.categories.map((category) => {
              const products = restaurant.products.filter(
                (product) => product.categoryId === category.id,
              );

              return (
                <section
                  key={category.id}
                  id={category.id}
                  className="scroll-mt-8"
                >
                  <div className="mb-4 flex flex-col gap-1">
                    <h2 className="text-2xl font-black">{category.name}</h2>
                    <p className="text-sm leading-6 text-zinc-600">
                      {category.description}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {products.map((product) => {
                      const isAvailable = product.available !== false;

                      return (
                        <article
                          key={product.id}
                          className={`grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm ${
                            isAvailable ? "" : "opacity-60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                                {product.code}
                              </p>
                              <h3 className="mt-1 text-lg font-extrabold">
                                {product.name}
                              </h3>
                              <p className="mt-2 text-sm leading-6 text-zinc-600">
                                {product.description}
                              </p>
                              {!isAvailable ? (
                                <p className="mt-3 text-sm font-black text-rose-700">
                                  Indisponivel no momento
                                </p>
                              ) : null}
                            </div>
                            <p className="shrink-0 text-base font-black">
                              {formatCurrency(product.price)}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => addToCart(product)}
                            className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                              isAvailable
                                ? visual.button
                                : "cursor-not-allowed bg-zinc-200 text-zinc-500"
                            }`}
                          >
                            {!isAvailable
                              ? "Indisponivel no momento"
                              : recentlyAddedProductId === product.id
                                ? "Adicionado!"
                                : "Adicionar ao pedido"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <aside
          ref={cartSectionRef}
          className="scroll-mt-6 lg:sticky lg:top-6 lg:self-start"
        >
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Pedido
                </p>
                <h2 className="mt-1 text-2xl font-black">Seu carrinho</h2>
              </div>
              <span className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-bold text-zinc-700">
                {totalItems}
              </span>
            </div>

            {errors.cart ? (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {errors.cart}
              </p>
            ) : null}

            {cart.length === 0 ? (
              <p className="mt-5 text-sm leading-6 text-zinc-600">
                Escolha os itens do cardapio para liberar a finalizacao do
                pedido.
              </p>
            ) : (
              <div className="mt-5 flex flex-col gap-5">
                <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                  {cart.map((item) => (
                    <div key={item.product.id} className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                            {item.product.code}
                          </p>
                          <h3 className="mt-1 text-sm font-extrabold">
                            {item.product.name}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-600">
                            {formatCurrency(item.product.price)} cada
                          </p>
                        </div>
                        <p className="text-sm font-black">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-lg border border-zinc-200">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.product.id)}
                            className="flex h-9 w-9 items-center justify-center text-lg font-black text-zinc-700 transition hover:bg-zinc-100"
                            aria-label={`Diminuir ${item.product.name}`}
                          >
                            -
                          </button>
                          <span className="flex h-9 min-w-10 items-center justify-center border-x border-zinc-200 text-sm font-black">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.product.id)}
                            className="flex h-9 w-9 items-center justify-center text-lg font-black text-zinc-700 transition hover:bg-zinc-100"
                            aria-label={`Aumentar ${item.product.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-sm font-bold text-rose-700 underline-offset-4 hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 text-sm">
                  <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
                  <SummaryRow
                    label="Entrega"
                    value={formatCurrency(deliveryFee)}
                  />
                  <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-black">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <section className="flex flex-col gap-4 border-t border-zinc-200 pt-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Finalizar pedido
                    </p>
                    <h2 className="mt-1 text-xl font-black">
                      Dados do cliente
                    </h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <TextField
                      label="Nome"
                      value={form.firstName}
                      error={errors.firstName}
                      onChange={(value) => updateForm("firstName", value)}
                    />
                    <TextField
                      label="Sobrenome"
                      value={form.lastName}
                      error={errors.lastName}
                      onChange={(value) => updateForm("lastName", value)}
                    />
                    <TextField
                      label="Telefone"
                      value={form.phone}
                      error={errors.phone}
                      onChange={(value) => updateForm("phone", value)}
                    />
                    <SelectField
                      label="Tipo de pedido"
                      value={form.orderType}
                      onChange={(value) =>
                        updateForm("orderType", value as OrderType)
                      }
                      options={[
                        { value: "delivery", label: "Entrega" },
                        { value: "pickup", label: "Retirada" },
                      ]}
                    />
                    <SelectField
                      label="Forma de pagamento"
                      value={form.paymentMethod}
                      onChange={(value) =>
                        updateForm("paymentMethod", value as PaymentMethod)
                      }
                      options={[
                        { value: "pix", label: "Pix" },
                        { value: "cash", label: "Dinheiro" },
                        { value: "card", label: "Cart\u00e3o na entrega" },
                      ]}
                    />
                  </div>

                  {form.orderType === "delivery" ? (
                    <div className="grid gap-3 border-t border-zinc-200 pt-4 sm:grid-cols-2 lg:grid-cols-1">
                      <TextField
                        label="Endereco"
                        value={form.address}
                        error={errors.address}
                        onChange={(value) => updateForm("address", value)}
                      />
                      <TextField
                        label="Numero"
                        value={form.number}
                        error={errors.number}
                        onChange={(value) => updateForm("number", value)}
                      />
                      <TextField
                        label="Bairro"
                        value={form.neighborhood}
                        error={errors.neighborhood}
                        onChange={(value) =>
                          updateForm("neighborhood", value)
                        }
                      />
                      <TextField
                        label="Complemento"
                        value={form.complement}
                        onChange={(value) => updateForm("complement", value)}
                      />
                      <TextField
                        label="Ponto de referencia"
                        value={form.reference}
                        onChange={(value) => updateForm("reference", value)}
                      />
                    </div>
                  ) : null}

                  {form.paymentMethod === "cash" ? (
                    <div className="grid gap-3 border-t border-zinc-200 pt-4 sm:grid-cols-2 lg:grid-cols-1">
                      <SelectField
                        label="Precisa de troco?"
                        value={form.needsChange}
                        onChange={(value) =>
                          updateForm("needsChange", value as NeedsChange)
                        }
                        options={[
                          { value: "no", label: "Nao" },
                          { value: "yes", label: "Sim" },
                        ]}
                      />
                      <TextField
                        label="Troco para quanto?"
                        value={form.changeFor}
                        error={errors.changeFor}
                        onChange={(value) => updateForm("changeFor", value)}
                      />
                    </div>
                  ) : null}

                  <TextAreaField
                    label="Observacao do pedido"
                    value={form.notes}
                    onChange={(value) => updateForm("notes", value)}
                  />

                  <button
                    type="button"
                    onClick={sendOrderToWhatsApp}
                    className={`rounded-lg px-4 py-3 text-sm font-black transition ${visual.button}`}
                  >
                    Enviar pedido no WhatsApp
                  </button>
                </section>
              </div>
            )}
          </div>
        </aside>
      </div>

      {toast ? (
        <div
          className="fixed bottom-28 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 shadow-xl shadow-black/10 lg:hidden"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      {cart.length > 0 ? (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md lg:hidden">
          <button
            type="button"
            onClick={scrollToCart}
            className={`flex w-full items-center justify-between gap-4 rounded-lg bg-zinc-950 px-4 py-3 text-left text-white shadow-2xl shadow-black/25 transition duration-200 ${
              cartHighlight ? "scale-[1.01] animate-pulse" : "scale-100"
            }`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <CartIcon />
              <span className="min-w-0">
                <span className="block text-sm font-black">Ver pedido</span>
                <span className="block text-xs font-medium text-white/70">
                  {formatCurrency(subtotal)}
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-black text-zinc-950">
              {totalItems}
            </span>
          </button>
        </div>
      ) : null}
    </main>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.2 3H3" />
      <path d="M9 20h.01" />
      <path d="M18 20h.01" />
    </svg>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-zinc-700">
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function TextField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 rounded-lg border bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-950 ${
          error ? "border-rose-400" : "border-zinc-200"
        }`}
      />
      {error ? <span className="text-xs font-semibold text-rose-700">{error}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-950"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="resize-none rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-950"
      />
    </label>
  );
}

function buildFallbackVisual(name: string): StoreVisual {
  return {
    logo: name.trim().charAt(0).toUpperCase() || "L",
    gradient: "from-zinc-900 via-teal-700 to-amber-500",
    accent: "bg-teal-100 text-teal-950 ring-teal-200",
    button: "bg-teal-700 text-white hover:bg-teal-800",
  };
}

function generateOrderCode(restaurant: Restaurant) {
  const prefixes: Record<string, string> = {
    "pao-de-alho-do-julio": "PDA",
    "acai-da-maria": "ACA",
  };
  const prefix = prefixes[restaurant.slug] ?? getInitials(restaurant.name);
  const number = Math.floor(1000 + Math.random() * 9000);

  return `#${prefix}-${number}`;
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials || "PED";
}

function buildWhatsAppMessage({
  orderCode,
  restaurant,
  cart,
  form,
  subtotal,
  deliveryFee,
  total,
}: {
  orderCode: string;
  restaurant: Restaurant;
  cart: CartItem[];
  form: CheckoutForm;
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  const lines = [
    `PEDIDO ${orderCode}`,
    restaurant.name,
    "",
    "CLIENTE",
    `Nome: ${form.firstName.trim()} ${form.lastName.trim()}`,
    `Telefone: ${form.phone.trim()}`,
    "",
    "TIPO DE PEDIDO",
    orderTypeLabels[form.orderType],
    "",
    "ITENS",
    ...cart.flatMap((item, index) =>
      [
        `${item.quantity}x [${item.product.code}] ${item.product.name}`,
        `${formatCurrency(item.product.price)} cada = ${formatCurrency(
          item.product.price * item.quantity,
        )}`,
        index < cart.length - 1 ? "" : undefined,
      ].filter((line): line is string => line !== undefined),
    ),
    "",
    "RESUMO",
    `Subtotal: ${formatCurrency(subtotal)}`,
    `Entrega: ${formatCurrency(deliveryFee)}`,
    `Total: ${formatCurrency(total)}`,
  ];

  if (form.orderType === "delivery") {
    lines.push(
      "",
      "ENDERE\u00c7O",
      `Rua: ${form.address.trim()}`,
      `N\u00famero: ${form.number.trim()}`,
      `Bairro: ${form.neighborhood.trim()}`,
      `Complemento: ${form.complement.trim() || "-"}`,
      `Refer\u00eancia: ${form.reference.trim() || "-"}`,
    );
  } else {
    lines.push("", "RETIRADA", "Retirada no local.");
  }

  lines.push(
    "",
    "PAGAMENTO",
    `Forma de pagamento: ${paymentLabels[form.paymentMethod]}`,
  );

  if (form.paymentMethod === "cash") {
    if (form.needsChange === "yes" && form.changeFor.trim()) {
      lines.push(`Troco para: ${formatChangeValue(form.changeFor)}`);
    }
  }

  if (form.notes.trim()) {
    lines.push("", "OBSERVA\u00c7\u00c3O", form.notes.trim());
  }

  return lines.join("\n");
}

function formatChangeValue(value: string) {
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/[R$]/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const numericValue = Number(normalized);

  if (!Number.isFinite(numericValue)) {
    return value.trim();
  }

  return formatCurrency(numericValue);
}
