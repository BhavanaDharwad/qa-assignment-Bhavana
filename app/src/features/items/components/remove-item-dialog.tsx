"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Item } from "@/types/domain";
import { useDeleteItem } from "../api";

const STRINGS = {
  trigger: (name: string) => `Remove ${name}`,
  title: "Remove item?",
  description: (name: string) => `"${name}" will be removed from the catalogue.`,
  cancel: "Cancel",
  confirm: "Remove",
  removing: "Removing…",
  success: (name: string) => `Removed "${name}"`,
  failure: "Could not remove the item",
};

export function RemoveItemButton({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const deleteItem = useDeleteItem({
    onSuccess: () => {
      toast.success(STRINGS.success(item.name));
      setOpen(false);
    },
    onError: (error) => toast.error(STRINGS.failure, { description: error.message }),
  });

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={STRINGS.trigger(item.name)}
        disabled={item.status !== "available"}
        onClick={() => setOpen(true)}
      >
        <Trash2Icon />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{STRINGS.title}</DialogTitle>
            <DialogDescription>{STRINGS.description(item.name)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleteItem.isPending}>
              {STRINGS.cancel}
            </Button>
            <Button variant="destructive" onClick={() => deleteItem.mutate(item.id)} disabled={deleteItem.isPending}>
              {deleteItem.isPending ? STRINGS.removing : STRINGS.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
