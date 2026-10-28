import { Badge } from "@/components/ui/badge";
import type { Category, ItemStatus } from "@/types/domain";
import { CATEGORY_EMOJI, CATEGORY_LABELS, ITEM_STATUS_CLASSES, ITEM_STATUS_LABELS } from "../constants";

export function ItemStatusBadge({ status }: { status: ItemStatus }) {
  return (
    <Badge variant="outline" className={ITEM_STATUS_CLASSES[status]} data-testid="item-status" data-status={status}>
      {ITEM_STATUS_LABELS[status]}
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge variant="outline" className="gap-1">
      <span aria-hidden>{CATEGORY_EMOJI[category]}</span>
      <span data-testid="item-category" data-category={category}>
        {CATEGORY_LABELS[category]}
      </span>
    </Badge>
  );
}
