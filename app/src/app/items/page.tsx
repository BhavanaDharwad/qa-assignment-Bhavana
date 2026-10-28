import type { Metadata } from "next";
import { ItemsPageClient } from "./items-page-client";

export const metadata: Metadata = { title: "Catalogue" };

export default function ItemsPage() {
  return <ItemsPageClient />;
}
