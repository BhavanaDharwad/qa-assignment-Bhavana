"use client";

import { useState, type FormEvent } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { newItemSchema, type Category } from "@/types/domain";
import { useCreateItem } from "../api";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "../constants";

const STRINGS = {
  trigger: "Add item",
  title: "Add an item",
  description: "New items start as available.",
  nameLabel: "Name",
  categoryLabel: "Category",
  cancel: "Cancel",
  submit: "Add item",
  submitting: "Adding…",
  success: (name: string) => `Added "${name}"`,
  failure: "Could not add the item",
};

const CATEGORY_ITEMS = CATEGORY_ORDER.map((value) => ({ value, label: CATEGORY_LABELS[value] }));

export function AddItemDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("laptops");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createItem = useCreateItem({
    onSuccess: (item) => {
      toast.success(STRINGS.success(item.name));
      setOpen(false);
    },
    onError: (error) => {
      if (Object.keys(error.fields).length > 0) setErrors(error.fields);
      else toast.error(STRINGS.failure, { description: error.message });
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName("");
      setCategory("laptops");
      setErrors({});
      createItem.reset();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = newItemSchema.safeParse({ name, category });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.map(String).join(".");
        if (!(key in next)) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    createItem.mutate(parsed.data);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusIcon aria-hidden />
        {STRINGS.trigger}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4" aria-label={STRINGS.title}>
          <DialogHeader>
            <DialogTitle>{STRINGS.title}</DialogTitle>
            <DialogDescription>{STRINGS.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="add-item-name">{STRINGS.nameLabel}</Label>
            <Input
              id="add-item-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "add-item-name-error" : undefined}
              autoFocus
            />
            {errors.name ? (
              <p id="add-item-name-error" role="alert" className="text-sm text-destructive">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="add-item-category">{STRINGS.categoryLabel}</Label>
            <Select<Category> items={CATEGORY_ITEMS} value={category} onValueChange={(value) => value && setCategory(value)}>
              <SelectTrigger id="add-item-category" aria-label={STRINGS.categoryLabel}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ITEMS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createItem.isPending}>
              {STRINGS.cancel}
            </Button>
            <Button type="submit" disabled={createItem.isPending}>
              {createItem.isPending ? STRINGS.submitting : STRINGS.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
