"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "../lib/format";
import type { AdminBusiness } from "../lib/admin-data";

type AdminBusinessGridProps = {
  businesses: AdminBusiness[];
};

export function AdminBusinessGrid({ businesses }: AdminBusinessGridProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query);

  const filteredBusinesses = useMemo(() => {
    if (!normalizedQuery) {
      return businesses;
    }

    return businesses.filter((business) =>
      normalizeSearch(
        [
          business.name,
          business.slug,
          business.instagram,
          business.whatsapp,
        ].join(" "),
      ).includes(normalizedQuery),
    );
  }, [businesses, normalizedQuery]);

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <label className="grid gap-2 text-sm font-bold text-zinc-700">
          Buscar loja
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, slug, Instagram ou WhatsApp"
            className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-950"
          />
        </label>
      </div>

      {filteredBusinesses.length === 0 && normalizedQuery ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm font-semibold text-zinc-600 shadow-sm">
          Nenhuma loja encontrada para esta busca.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!normalizedQuery ? <NewBusinessCard /> : null}

        {filteredBusinesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </section>
  );
}

function NewBusinessCard() {
  return (
    <Link
      href="/admin/restaurantes/novo"
      className="flex min-h-64 flex-col justify-between rounded-lg border border-dashed border-zinc-300 bg-white p-5 shadow-sm transition hover:border-zinc-950 hover:shadow-md"
    >
      <div>
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-950 text-3xl font-black text-white">
          +
        </div>
        <h2 className="mt-5 text-2xl font-black">Nova loja</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Criar um novo restaurante e depois cadastrar categorias e produtos.
        </p>
      </div>
      <span className="mt-6 text-sm font-black text-zinc-950">
        Criar restaurante
      </span>
    </Link>
  );
}

function BusinessCard({ business }: { business: AdminBusiness }) {
  const productCount = business.categories.reduce(
    (total, category) => total + category.products.length,
    0,
  );

  return (
    <Link
      href={`/admin/restaurantes/${business.id}`}
      className="flex min-h-64 flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-950 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-100 text-3xl">
            {business.logoEmoji || business.name.charAt(0).toUpperCase() || "L"}
          </div>
          <StatusBadge active={business.isOpen} />
        </div>

        <h2 className="mt-5 text-xl font-black">{business.name}</h2>
        <p className="mt-1 text-sm font-semibold text-zinc-500">
          /loja/{business.slug}
        </p>

        <div className="mt-4 grid gap-2 text-sm text-zinc-600">
          <InfoRow label="Entrega" value={formatCurrency(business.deliveryFee)} />
          {business.instagram ? (
            <InfoRow label="Instagram" value={business.instagram} />
          ) : null}
          <InfoRow
            label="Catalogo"
            value={`${business.categories.length} categorias, ${productCount} produtos`}
          />
        </div>
      </div>

      <span className="mt-5 inline-flex items-center text-sm font-black text-zinc-950">
        Editar
      </span>
    </Link>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="truncate font-bold text-zinc-900">{value}</span>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-lg px-2 py-1 text-xs font-black ${
        active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
      }`}
    >
      {active ? "Aberto" : "Fechado"}
    </span>
  );
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
