import { AdminBusinessGrid } from "./AdminBusinessGrid";
import { logoutAdmin } from "./actions";
import { StatusMessage } from "./AdminRestaurantForms";
import { getAdminDashboardData } from "../lib/admin-data";
import { requireAdmin } from "../lib/admin-auth";

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();

  const query = searchParams ? await searchParams : {};
  const businesses = await getAdminDashboardData();
  const statusMessage = query.error ?? query.success;
  const statusType = query.error ? "error" : "success";

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Cardapio SaaS
            </p>
            <h1 className="mt-2 text-3xl font-black">Admin v1</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Gerencie lojas, categorias e produtos.
            </p>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
            >
              Sair
            </button>
          </form>
        </header>

        {statusMessage ? (
          <StatusMessage type={statusType} message={statusMessage} />
        ) : null}

        <AdminBusinessGrid businesses={businesses} />
      </div>
    </main>
  );
}
