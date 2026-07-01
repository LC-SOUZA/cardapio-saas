import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "../../lib/store-data";
import StoreClient from "./StoreClient";

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  return <StoreClient restaurant={restaurant} />;
}
