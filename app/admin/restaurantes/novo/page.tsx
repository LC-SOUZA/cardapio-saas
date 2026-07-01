import Link from "next/link";
import { NewBusinessForm, StatusMessage } from "../../AdminRestaurantForms";
import { requireAdmin } from "../../../lib/admin-auth";

type NewRestaurantPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function NewRestaurantPage({
  searchParams,
}: NewRestaurantPageProps) {
  await requireAdmin();

  const query = searchParams ? await searchParams : {};
  const statusMessage = query.error ?? query.success;
  const statusType = query.error ? "error" : "success";

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-black text-zinc-600 underline-offset-4 hover:underline"
            >
              Voltar para lojas
            </Link>
            <h1 className="mt-3 text-3xl font-black">Nova loja</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Cadastre os dados iniciais do restaurante.
            </p>
          </div>
        </header>

        {statusMessage ? (
          <StatusMessage type={statusType} message={statusMessage} />
        ) : null}

        <NewBusinessForm />
      </div>
    </main>
  );
}
