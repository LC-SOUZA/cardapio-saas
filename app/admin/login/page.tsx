import { loginAdmin } from "./actions";

type AdminLoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const query = searchParams ? await searchParams : {};
  const hasError = query.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Admin v1
          </p>
          <h1 className="mt-2 text-3xl font-black">Entrar no painel</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Use a senha local configurada no ambiente do projeto.
          </p>
        </div>

        {hasError ? (
          <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            Senha incorreta.
          </p>
        ) : null}

        <form action={loginAdmin} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
            Senha
            <input
              name="password"
              type="password"
              required
              className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-950"
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
