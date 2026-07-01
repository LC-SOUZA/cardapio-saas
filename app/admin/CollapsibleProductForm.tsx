"use client";

import { useState } from "react";

type CollapsibleProductFormProps = {
  children: React.ReactNode;
};

export function CollapsibleProductForm({
  children,
}: CollapsibleProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm font-black text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-50"
        >
          + Criar novo produto
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h5 className="text-sm font-black uppercase tracking-[0.12em] text-zinc-500">
          Novo produto
        </h5>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-black text-zinc-700 transition hover:border-zinc-950"
        >
          Cancelar
        </button>
      </div>

      {children}
    </div>
  );
}
