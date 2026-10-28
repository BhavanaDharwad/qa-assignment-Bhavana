"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { ErrorState } from "@/components/layout/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Rental, RentalStatus, User } from "@/types/domain";
import { useRentalAction, useRentals, type RentalAction } from "../api";
import { RentalRow } from "./rental-row";

const STRINGS = {
  title: "Rentals",
  adminDescription: "Approve requests and confirm returns.",
  memberDescription: "Track your requests and return equipment when you are done.",
  tabsLabel: "Rental views",
  emptyTitle: "Nothing here",
  emptyDescription: "Rentals in this state will show here.",
  listLabel: "Rentals",
  success: {
    approve: (name: string) => `Approved "${name}"`,
    reject: (name: string) => `Rejected "${name}"`,
    return: (name: string) => `Return requested for "${name}"`,
    "confirm-return": (name: string) => `"${name}" is back in the catalogue`,
  } satisfies Record<RentalAction, (name: string) => string>,
  failure: "Action failed",
};

type TabDefinition = { value: string; label: string; status: RentalStatus | "all"; countBadge?: boolean };

const ADMIN_TABS: TabDefinition[] = [
  { value: "requests", label: "Requests", status: "requested", countBadge: true },
  { value: "on-loan", label: "On loan", status: "approved" },
  { value: "returns", label: "Returns", status: "return-pending", countBadge: true },
  { value: "history", label: "History", status: "all" },
];

const MEMBER_TABS: TabDefinition[] = [
  { value: "active", label: "Active", status: "all" },
  { value: "history", label: "History", status: "all" },
];

const ACTIVE: RentalStatus[] = ["requested", "approved", "return-pending"];
const TAB_PARAM = "tab";

function tabsFor(user: User): TabDefinition[] {
  return user.role === "admin" ? ADMIN_TABS : MEMBER_TABS;
}

/** The member "Active" tab and both "History" tabs derive from the full list on the client. */
function rowsFor(tab: TabDefinition, user: User, rentals: Rental[]): Rental[] {
  if (user.role === "member" && tab.value === "active") return rentals.filter((rental) => ACTIVE.includes(rental.status));
  if (tab.value === "history") return rentals.filter((rental) => !ACTIVE.includes(rental.status));
  return rentals;
}

export function RentalsView({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = tabsFor(user);
  const rawTab = searchParams.get(TAB_PARAM);
  const tab = tabs.find((candidate) => candidate.value === rawTab) ?? tabs[0];

  function selectTab(next: unknown) {
    if (typeof next !== "string" || next === tab.value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === tabs[0].value) params.delete(TAB_PARAM);
    else params.set(TAB_PARAM, next);
    const suffix = params.size > 0 ? `?${params.toString()}` : "";
    router.replace(`${pathname}${suffix}`, { scroll: false });
  }

  return (
    <>
      <PageHeader title={STRINGS.title} description={user.role === "admin" ? STRINGS.adminDescription : STRINGS.memberDescription} />
      <Tabs value={tab.value} onValueChange={selectTab}>
        <TabsList aria-label={STRINGS.tabsLabel} variant="line">
          {tabs.map((definition) => (
            <TabsTrigger key={definition.value} value={definition.value}>
              {definition.label}
              {definition.countBadge ? <TabCount status={definition.status} /> : null}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((definition) => (
          <TabsContent key={definition.value} value={definition.value} className="pt-4">
            {definition.value === tab.value ? <RentalList tab={definition} user={user} /> : null}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

function TabCount({ status }: { status: RentalStatus | "all" }) {
  const rentals = useRentals(status);
  if (!rentals.data) return null;
  return (
    <Badge variant="secondary" className="ml-1" data-testid="tab-count">
      {rentals.data.length}
    </Badge>
  );
}

function RentalList({ tab, user }: { tab: TabDefinition; user: User }) {
  const rentals = useRentals(tab.status);
  const action = useRentalAction({
    onSuccess: (rental, variables) => toast.success(STRINGS.success[variables.action](rental.itemName)),
    onError: (error) => toast.error(STRINGS.failure, { description: error.message }),
  });

  if (rentals.isPending) {
    return (
      <div className="grid gap-2" aria-busy="true" data-testid="rentals-loading">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }
  if (rentals.isError) return <ErrorState error={rentals.error} onRetry={() => rentals.refetch()} />;

  const rows = rowsFor(tab, user, rentals.data);
  if (rows.length === 0) return <EmptyState title={STRINGS.emptyTitle} description={STRINGS.emptyDescription} />;

  return (
    <ul className="grid gap-2" aria-label={STRINGS.listLabel} data-testid="rental-list">
      {rows.map((rental) => (
        <RentalRowContainer key={rental.id} rental={rental} user={user} action={action} />
      ))}
    </ul>
  );
}

type RentalRowContainerProps = { rental: Rental; user: User; action: ReturnType<typeof useRentalAction> };

function RentalRowContainer({ rental, user, action }: RentalRowContainerProps) {
  const pendingAction =
    action.isPending && action.variables?.rentalId === rental.id ? action.variables.action : null;
  return (
    <RentalRow rental={rental} user={user} pendingAction={pendingAction} onAction={(target, kind) => action.mutate({ rentalId: target.id, action: kind })} />
  );
}

