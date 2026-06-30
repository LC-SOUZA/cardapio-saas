import { notFound } from "next/navigation";
import { getRestaurantBySlug, restaurants } from "../../data/restaurants";
import StoreClient from "./StoreClient";

type StorePageProps = {
  params: Promise<{ slug: string }>;
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

  return <StoreClient restaurant={restaurant} />;
}
