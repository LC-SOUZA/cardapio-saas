export type Product = {
  id: string;
  code: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
};

export type Category = {
  id: string;
  name: string;
  description: string;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description: string;
  whatsapp: string;
  instagram: string;
  address: string;
  deliveryFee: number;
  isOpen: boolean;
  categories: Category[];
  products: Product[];
};

export const restaurants: Restaurant[] = [
  {
    id: "rest-pao-de-alho-do-julio",
    slug: "pao-de-alho-do-julio",
    name: "Pao de Alho do Julio",
    description:
      "Pao de alho artesanal, recheado e assado na brasa para acompanhar churrascos, encontros e aquele lanche caprichado.",
    whatsapp: "5511999991111",
    instagram: "@paodealhodojulio",
    address: "Rua das Brasas, 142 - Vila Sabor, Sao Paulo - SP",
    deliveryFee: 6.9,
    isOpen: true,
    categories: [
      {
        id: "classicos",
        name: "Classicos",
        description: "Os sabores que nunca saem do pedido.",
      },
      {
        id: "recheados",
        name: "Recheados",
        description: "Pao de alho com recheios generosos.",
      },
      {
        id: "combos",
        name: "Combos",
        description: "Opcoes para dividir sem pensar muito.",
      },
    ],
    products: [
      {
        id: "tradicional-na-brasa",
        code: "PAO-001",
        categoryId: "classicos",
        name: "Tradicional na Brasa",
        description:
          "Pao crocante com creme de alho, manteiga temperada e cheiro-verde.",
        price: 9.9,
      },
      {
        id: "queijo-da-casa",
        code: "PAO-002",
        categoryId: "classicos",
        name: "Queijo da Casa",
        description:
          "A versao tradicional com queijo derretido e finalizacao dourada.",
        price: 12.9,
      },
      {
        id: "calabresa-cremosa",
        code: "PAO-003",
        categoryId: "recheados",
        name: "Calabresa Cremosa",
        description:
          "Recheio de calabresa artesanal, queijo e creme de alho suave.",
        price: 16.9,
      },
      {
        id: "frango-com-catupiry",
        code: "PAO-004",
        categoryId: "recheados",
        name: "Frango com Catupiry",
        description:
          "Frango desfiado temperado, catupiry e cobertura de parmesao.",
        price: 17.9,
      },
      {
        id: "combo-churrasco",
        code: "PAO-005",
        categoryId: "combos",
        name: "Combo Churrasco",
        description:
          "Quatro paes variados para servir junto da carne e dos acompanhamentos.",
        price: 49.9,
      },
      {
        id: "combo-familia",
        code: "PAO-006",
        categoryId: "combos",
        name: "Combo Familia",
        description:
          "Seis unidades com sabores mistos, ideal para mesa cheia.",
        price: 72.9,
      },
    ],
  },
  {
    id: "rest-acai-da-maria",
    slug: "acai-da-maria",
    name: "Acai da Maria",
    description:
      "Acai cremoso montado na hora, com frutas frescas, toppings crocantes e combinacoes para todos os apetites.",
    whatsapp: "5511999992222",
    instagram: "@acaidamaria",
    address: "Avenida Tropical, 88 - Jardim Primavera, Sao Paulo - SP",
    deliveryFee: 4.5,
    isOpen: false,
    categories: [
      {
        id: "copos",
        name: "Copos de Acai",
        description: "Tamanhos individuais para qualquer hora do dia.",
      },
      {
        id: "barcas",
        name: "Barcas",
        description: "Porcoes maiores para compartilhar.",
      },
      {
        id: "adicionais",
        name: "Adicionais",
        description: "Monte do seu jeito com extras favoritos.",
      },
    ],
    products: [
      {
        id: "copo-pequeno",
        code: "ACA-001",
        categoryId: "copos",
        name: "Copo Pequeno",
        description:
          "300ml de acai com banana, granola e leite condensado.",
        price: 14.9,
      },
      {
        id: "copo-medio",
        code: "ACA-002",
        categoryId: "copos",
        name: "Copo Medio",
        description:
          "500ml de acai com duas frutas, granola e cobertura a escolha.",
        price: 21.9,
      },
      {
        id: "copo-tropical",
        code: "ACA-003",
        categoryId: "copos",
        name: "Copo Tropical",
        description:
          "Acai com morango, manga, kiwi, granola e mel.",
        price: 24.9,
      },
      {
        id: "barca-dupla",
        code: "ACA-004",
        categoryId: "barcas",
        name: "Barca Dupla",
        description:
          "Acai para duas pessoas com frutas, leite em po e creme de avela.",
        price: 39.9,
      },
      {
        id: "barca-familia",
        code: "ACA-005",
        categoryId: "barcas",
        name: "Barca Familia",
        description:
          "Camadas de acai, frutas, granola e coberturas para dividir.",
        price: 64.9,
      },
      {
        id: "extra-pacoca",
        code: "ACA-006",
        categoryId: "adicionais",
        name: "Pacoca",
        description: "Porcao extra de pacoca esfarelada.",
        price: 3.5,
      },
      {
        id: "extra-creme-avela",
        code: "ACA-007",
        categoryId: "adicionais",
        name: "Creme de Avela",
        description: "Camada extra de creme de avela.",
        price: 5,
      },
    ],
  },
];

export function getRestaurantBySlug(slug: string) {
  return restaurants.find((restaurant) => restaurant.slug === slug);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
