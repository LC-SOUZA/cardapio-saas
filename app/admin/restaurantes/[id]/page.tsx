import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessEditor, StatusMessage } from "../../AdminRestaurantForms";
import { requireAdmin } from "../../../lib/admin-auth";
import { getAdminBusinessById } from "../../../lib/admin-data";

type EditRestaurantPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function EditRestaurantPage({
  params,
  searchParams,
}: EditRestaurantPageProps) {
  await requireAdmin();

  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const business = await getAdminBusinessById(id);
  const statusMessage = query.error ?? query.success;
  const statusType = query.error ? "error" : "success";

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-black text-zinc-600 underline-offset-4 hover:underline"
            >
              Voltar para lojas
            </Link>
            <h1 className="mt-3 text-3xl font-black">Editar loja</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Dados do restaurante, categorias, produtos e exclusoes.
            </p>
          </div>
          <Link
            href={`/loja/${business.slug}`}
            target="_blank"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
          >
            Ver loja publica
          </Link>
        </header>

        {statusMessage ? (
          <StatusMessage type={statusType} message={statusMessage} />
        ) : null}

        <BusinessEditor business={business} />
      </div>
    </main>
  );
}
