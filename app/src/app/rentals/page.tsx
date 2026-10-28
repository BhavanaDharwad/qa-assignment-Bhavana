import type { Metadata } from "next";
import { Suspense } from "react";
import { RentalsPageClient } from "./rentals-page-client";

export const metadata: Metadata = { title: "Rentals" };

export default function RentalsPage() {
  return (
    <Suspense>
      <RentalsPageClient />
    </Suspense>
  );
}
