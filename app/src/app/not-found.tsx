import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const STRINGS = {
  title: "Page not found",
  body: "The page you asked for does not exist.",
  back: "Back to catalogue",
};

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center" role="alert">
      <h1 className="text-2xl font-semibold">{STRINGS.title}</h1>
      <p className="text-muted-foreground">{STRINGS.body}</p>
      <Link href="/items" className={buttonVariants()}>
        {STRINGS.back}
      </Link>
    </section>
  );
}
