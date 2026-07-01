import {
  createBusiness,
  createCategory,
  createProduct,
  deleteBusiness,
  deleteCategory,
  deleteProduct,
  updateBusiness,
  updateProduct,
  updateProductAvailability,
} from "./actions";
import { CollapsibleProductForm } from "./CollapsibleProductForm";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { formatBrazilianMoneyInput } from "../lib/admin-money";
import type {
  AdminBusiness,
  AdminCategory,
  AdminProduct,
} from "../lib/admin-data";

const DEFAULT_LOGO_EMOJI = "\u{1F37D}\uFE0F";

export function StatusMessage({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  const styles =
    type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <section className={`rounded-lg border px-4 py-3 text-sm font-bold ${styles}`}>
      {message}
    </section>
  );
}

export function NewBusinessForm() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5 border-b border-zinc-200 pb-5">
        <h2 className="text-2xl font-black">Nova loja</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-600">
          Crie um restaurante do zero. Depois adicione categorias e produtos na
          tela de edicao.
        </p>
      </div>

      <form action={createBusiness} className="grid gap-4">
        <input name="returnTo" type="hidden" value="/admin/restaurantes/novo" />

        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Nome" name="name" required />
          <TextField
            label="Slug"
            name="slug"
            placeholder="Ex: pizza-do-centro"
            required
          />
          <TextField label="WhatsApp" name="whatsapp" required />
          <TextField label="Instagram" name="instagram" />
          <MoneyField label="Taxa de entrega" name="deliveryFee" defaultValue={0} />
          <TextField label="Endereco" name="address" />
          <TextField
            label="Logo emoji"
            name="logoEmoji"
            defaultValue={DEFAULT_LOGO_EMOJI}
          />
          <TextField
            label="Cor primaria"
            name="primaryColor"
            defaultValue="#111827"
          />
          <TextField
            label="Cor secundaria"
            name="secondaryColor"
            defaultValue="#f59e0b"
          />
        </div>

        <TextAreaField label="Descricao" name="description" />

        <CheckboxField
          label="Restaurante aberto"
          name="isOpen"
          defaultChecked
        />

        <div>
          <button
            type="submit"
            className="rounded-lg bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
          >
            Criar loja
          </button>
        </div>
      </form>
    </section>
  );
}

export function BusinessEditor({ business }: { business: AdminBusiness }) {
  const returnTo = `/admin/restaurantes/${business.id}`;

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 border-b border-zinc-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-2xl">
                {business.logoEmoji || DEFAULT_LOGO_EMOJI}
              </span>
              <div>
                <h2 className="text-2xl font-black">{business.name}</h2>
                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  /loja/{business.slug}
                </p>
              </div>
            </div>
          </div>
          <StatusBadge
            active={business.isOpen}
            activeLabel="Aberto"
            inactiveLabel="Fechado"
          />
        </div>

        <form action={updateBusiness} className="grid gap-4">
          <input name="businessId" type="hidden" value={business.id} />
          <input name="slug" type="hidden" value={business.slug} />
          <input name="returnTo" type="hidden" value={returnTo} />

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Nome"
              name="name"
              defaultValue={business.name}
              required
            />
            <TextField
              label="WhatsApp"
              name="whatsapp"
              defaultValue={business.whatsapp}
            />
            <TextField
              label="Instagram"
              name="instagram"
              defaultValue={business.instagram}
            />
            <MoneyField
              label="Taxa de entrega"
              name="deliveryFee"
              defaultValue={business.deliveryFee}
            />
            <TextField
              label="Endereco"
              name="address"
              defaultValue={business.address}
            />
            <TextField
              label="Logo emoji"
              name="logoEmoji"
              defaultValue={business.logoEmoji}
            />
            <TextField
              label="Cor primaria"
              name="primaryColor"
              defaultValue={business.primaryColor}
            />
            <TextField
              label="Cor secundaria"
              name="secondaryColor"
              defaultValue={business.secondaryColor}
            />
          </div>

          <TextAreaField
            label="Descricao"
            name="description"
            defaultValue={business.description}
          />

          <CheckboxField
            label="Restaurante aberto"
            name="isOpen"
            defaultChecked={business.isOpen}
          />

          <div>
            <button
              type="submit"
              className="rounded-lg bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
            >
              Salvar restaurante
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-black">Categorias e produtos</h3>

          {business.categories.length === 0 ? (
            <p className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-zinc-600 shadow-sm">
              Nenhuma categoria cadastrada.
            </p>
          ) : (
            business.categories.map((category) => (
              <CategorySection
                key={category.id}
                business={business}
                category={category}
                returnTo={returnTo}
              />
            ))
          )}
        </div>

        <NewCategoryForm business={business} returnTo={returnTo} />
      </section>

      <DangerZone business={business} returnTo={returnTo} />
    </div>
  );
}

function CategorySection({
  business,
  category,
  returnTo,
}: {
  business: AdminBusiness;
  category: AdminCategory;
  returnTo: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-black">{category.name}</h4>
            <StatusBadge
              active={category.isActive}
              activeLabel="Ativa"
              inactiveLabel="Inativa"
            />
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            {category.description || "Sem descricao."}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
            Ordem {category.sortOrder} - {category.products.length} produtos
          </p>
        </div>

        <form action={deleteCategory}>
          <input name="categoryId" type="hidden" value={category.id} />
          <input name="businessId" type="hidden" value={business.id} />
          <input name="slug" type="hidden" value={business.slug} />
          <input name="returnTo" type="hidden" value={returnTo} />
          <ConfirmSubmitButton
            message="Tem certeza que deseja excluir esta categoria? Os produtos desta categoria tambem serao apagados."
            className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-50"
          >
            Excluir categoria
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="grid gap-3">
        {category.products.length === 0 ? (
          <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-600">
            Nenhum produto nesta categoria.
          </p>
        ) : (
          category.products.map((product) => (
            <ProductForm
              key={product.id}
              business={business}
              product={product}
              returnTo={returnTo}
            />
          ))
        )}
      </div>

      <NewProductForm
        business={business}
        category={category}
        returnTo={returnTo}
      />
    </section>
  );
}

function ProductForm({
  business,
  product,
  returnTo,
}: {
  business: AdminBusiness;
  product: AdminProduct;
  returnTo: string;
}) {
  const isAvailable = product.isAvailable;

  return (
    <article
      className={`rounded-lg border p-3 ${
        isAvailable
          ? "border-transparent bg-zinc-50"
          : "border-amber-300 bg-amber-50"
      }`}
    >
      <div className="mb-3 flex flex-col gap-3 border-b border-zinc-200 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-sm font-black">{product.name}</h5>
            <ProductAvailabilityBadge isAvailable={isAvailable} />
          </div>
          {!isAvailable ? (
            <p className="mt-2 text-sm font-semibold leading-6 text-amber-900">
              Este produto aparece na loja, mas o cliente nao consegue
              adicionar ao pedido.
            </p>
          ) : null}
        </div>

        <form action={updateProductAvailability}>
          <input name="productId" type="hidden" value={product.id} />
          <input name="businessId" type="hidden" value={business.id} />
          <input name="slug" type="hidden" value={business.slug} />
          <input name="returnTo" type="hidden" value={returnTo} />
          <input
            name="isAvailable"
            type="hidden"
            value={isAvailable ? "false" : "true"}
          />
          <ConfirmSubmitButton
            message={
              isAvailable
                ? "Tem certeza que deseja tornar este produto indisponivel? Ele continuara aparecendo na loja, mas nao podera ser adicionado ao pedido."
                : "Deseja tornar este produto disponivel novamente?"
            }
            className={`rounded-lg px-3 py-2 text-xs font-black transition ${
              isAvailable
                ? "border border-amber-300 text-amber-800 hover:bg-amber-100"
                : "bg-emerald-700 text-white hover:bg-emerald-800"
            }`}
          >
            {isAvailable ? "Tornar indisponivel" : "Repor produto"}
          </ConfirmSubmitButton>
        </form>
      </div>

      <form action={updateProduct} className="grid gap-3">
        <input name="productId" type="hidden" value={product.id} />
        <input name="slug" type="hidden" value={business.slug} />
        <input name="returnTo" type="hidden" value={returnTo} />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <TextField
            label="Codigo"
            name="code"
            defaultValue={product.code}
            required
          />
          <TextField
            label="Nome"
            name="name"
            defaultValue={product.name}
            required
          />
          <MoneyField
            label="Preco"
            name="price"
            defaultValue={product.price}
            required
          />
          <TextField
            label="Ordem"
            name="sortOrder"
            defaultValue={product.sortOrder}
            type="number"
          />
          <div className="md:col-span-2 xl:col-span-3">
            <TextAreaField
              label="Descricao"
              name="description"
              defaultValue={product.description}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-zinc-600">
            A disponibilidade e alterada pelo botao acima.
          </p>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-black text-zinc-800 transition hover:border-zinc-950"
          >
            Salvar produto
          </button>
        </div>
      </form>

      <form action={deleteProduct} className="mt-3 border-t border-zinc-200 pt-3">
        <input name="productId" type="hidden" value={product.id} />
        <input name="slug" type="hidden" value={business.slug} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <ConfirmSubmitButton
          message="Tem certeza que deseja excluir este produto?"
          className="text-sm font-black text-rose-700 underline-offset-4 hover:underline"
        >
          Excluir produto
        </ConfirmSubmitButton>
      </form>
    </article>
  );
}

function NewProductForm({
  business,
  category,
  returnTo,
}: {
  business: AdminBusiness;
  category: AdminCategory;
  returnTo: string;
}) {
  return (
    <CollapsibleProductForm>
      <form action={createProduct} className="grid gap-3">
        <input name="businessId" type="hidden" value={business.id} />
        <input name="categoryId" type="hidden" value={category.id} />
        <input name="slug" type="hidden" value={business.slug} />
        <input name="returnTo" type="hidden" value={returnTo} />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <TextField label="Codigo" name="code" required />
          <TextField label="Nome" name="name" required />
          <MoneyField label="Preco" name="price" required />
          <TextField
            label="Ordem"
            name="sortOrder"
            type="number"
            defaultValue={0}
          />
          <div className="md:col-span-2 xl:col-span-3">
            <TextAreaField label="Descricao" name="description" />
          </div>
        </div>

        <button
          type="submit"
          className="justify-self-start rounded-lg bg-zinc-950 px-4 py-2 text-sm font-black text-white transition hover:bg-zinc-800"
        >
          Criar produto
        </button>
      </form>
    </CollapsibleProductForm>
  );
}

function NewCategoryForm({
  business,
  returnTo,
}: {
  business: AdminBusiness;
  returnTo: string;
}) {
  return (
    <aside className="rounded-lg border border-dashed border-zinc-300 bg-white p-4 shadow-sm lg:self-start">
      <h3 className="text-xl font-black">Nova categoria</h3>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        A categoria criada fica vinculada a {business.name}.
      </p>

      <form action={createCategory} className="mt-4 grid gap-3">
        <input name="businessId" type="hidden" value={business.id} />
        <input name="slug" type="hidden" value={business.slug} />
        <input name="returnTo" type="hidden" value={returnTo} />

        <TextField label="Nome" name="name" required />
        <TextAreaField label="Descricao" name="description" />
        <TextField
          label="Ordem"
          name="sortOrder"
          type="number"
          defaultValue={0}
        />
        <CheckboxField label="Categoria ativa" name="isActive" defaultChecked />

        <button
          type="submit"
          className="rounded-lg bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
        >
          Criar categoria
        </button>
      </form>
    </aside>
  );
}

function DangerZone({
  business,
  returnTo,
}: {
  business: AdminBusiness;
  returnTo: string;
}) {
  return (
    <section className="rounded-lg border border-rose-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-black text-rose-800">Zona de perigo</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
        Excluir a loja remove tambem as categorias e produtos vinculados. Esta
        acao e definitiva no Admin v1.
      </p>

      <form action={deleteBusiness} className="mt-4">
        <input name="businessId" type="hidden" value={business.id} />
        <input name="slug" type="hidden" value={business.slug} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <ConfirmSubmitButton
          message="Tem certeza que deseja excluir esta loja? Categorias e produtos tambem serao apagados."
          className="rounded-lg bg-rose-700 px-4 py-3 text-sm font-black text-white transition hover:bg-rose-800"
        >
          Excluir loja
        </ConfirmSubmitButton>
      </form>
    </section>
  );
}

function MoneyField({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: number | string;
  required?: boolean;
}) {
  return (
    <TextField
      label={label}
      name={name}
      defaultValue={formatBrazilianMoneyInput(defaultValue)}
      inputMode="decimal"
      placeholder="Ex: 7,50"
      required={required}
      type="text"
    />
  );
}

function TextField({
  label,
  name,
  defaultValue = "",
  type = "text",
  required = false,
  step,
  inputMode,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  step?: string;
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        step={step}
        defaultValue={defaultValue}
        inputMode={inputMode}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-950"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="resize-none rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-950"
      />
    </label>
  );
}

function CheckboxField({
  label,
  name,
  defaultChecked = false,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-bold text-zinc-700">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-zinc-300"
      />
      {label}
    </label>
  );
}

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={`rounded-lg px-2 py-1 text-xs font-black ${
        active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function ProductAvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span
      className={`rounded-lg px-2 py-1 text-xs font-black ${
        isAvailable
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-200 text-amber-950"
      }`}
    >
      {isAvailable ? "Disponivel" : "Indisponivel no momento"}
    </span>
  );
}
