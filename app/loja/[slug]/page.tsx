import { notFound } from "next/navigation";
import {
  formatCurrency,
  getRestaurantBySlug,
  restaurants,
} from "../../data/restaurants";

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

const storeVisuals: Record<
  string,
  {
    logo: string;
    gradient: string;
    accent: string;
    button: string;
  }
> = {
  "pao-de-alho-do-julio": {
    logo: "🧄",
    gradient: "from-amber-500 via-orange-500 to-emerald-700",
    accent: "bg-amber-100 text-amber-950 ring-amber-200",
    button: "bg-zinc-950 text-white hover:bg-zinc-800",
  },
  "acai-da-maria": {
    logo: "🍧",
    gradient: "from-fuchsia-700 via-violet-600 to-cyan-500",
    accent: "bg-fuchsia-100 text-fuchsia-950 ring-fuchsia-200",
    button: "bg-fuchsia-700 text-white hover:bg-fuchsia-800",
  },
};

export function generateStaticParams() {
  return restaurants.map((restaurant) => ({
    slug: restaurant.slug,
  }));
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const visual = storeVisuals[restaurant.slug] ?? storeVisuals["pao-de-alho-do-julio"];
  const instagramHandle = restaurant.instagram.replace("@", "");
  const whatsappUrl = `https://wa.me/${restaurant.whatsapp}`;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section
        className={`bg-gradient-to-br ${visual.gradient} text-white`}
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
                {visual.logo}
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

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Categorias
              </p>
              <h2 className="mt-1 text-2xl font-black">Explore o cardapio</h2>
            </div>
            <p className="hidden text-sm font-medium text-zinc-500 sm:block">
              {restaurant.products.length} itens disponiveis
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
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-extrabold">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-zinc-600">
                            {product.description}
                          </p>
                        </div>
                        <p className="shrink-0 text-base font-black">
                          {formatCurrency(product.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!restaurant.isOpen}
                        className={`rounded-lg px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 ${visual.button}`}
                      >
                        Adicionar ao pedido
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
