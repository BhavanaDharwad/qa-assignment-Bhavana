"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema, type Role } from "@/types/domain";
import { useSignIn } from "../api";

const STRINGS = {
  title: "Sign in to Kit Desk",
  description: "Enter your name and choose how you want to use the app. No password needed.",
  nameLabel: "Your name",
  namePlaceholder: "e.g. Robin",
  roleLabel: "Role",
  member: "Member",
  memberHint: "Request equipment and return it",
  admin: "Admin",
  adminHint: "Manage the catalogue and approve requests",
  submit: "Sign in",
  submitting: "Signing in…",
  failure: "Could not sign in",
};

export function SignInForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [error, setError] = useState<string | null>(null);
  const signIn = useSignIn({
    onSuccess: () => router.replace("/items"),
    onError: (apiError) => {
      const fieldError = apiError.fields.name;
      if (fieldError) setError(fieldError);
      else toast.error(STRINGS.failure, { description: apiError.message });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = signInSchema.safeParse({ name, role });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setError(null);
    signIn.mutate(parsed.data);
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">
          <h1>{STRINGS.title}</h1>
        </CardTitle>
        <CardDescription>{STRINGS.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-5" aria-label={STRINGS.title}>
          <div className="grid gap-2">
            <Label htmlFor="sign-in-name">{STRINGS.nameLabel}</Label>
            <Input
              id="sign-in-name"
              name="name"
              autoComplete="off"
              placeholder={STRINGS.namePlaceholder}
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "sign-in-name-error" : undefined}
              autoFocus
            />
            {error ? (
              <p id="sign-in-name-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">{STRINGS.roleLabel}</legend>
            <RoleOption value="member" current={role} onChange={setRole} label={STRINGS.member} hint={STRINGS.memberHint} />
            <RoleOption value="admin" current={role} onChange={setRole} label={STRINGS.admin} hint={STRINGS.adminHint} />
          </fieldset>

          <Button type="submit" disabled={signIn.isPending}>
            {signIn.isPending ? STRINGS.submitting : STRINGS.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

type RoleOptionProps = { value: Role; current: Role; onChange: (role: Role) => void; label: string; hint: string };

function RoleOption({ value, current, onChange, label, hint }: RoleOptionProps) {
  const id = `sign-in-role-${value}`;
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 has-checked:border-primary">
      <input
        id={id}
        type="radio"
        name="role"
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
        className="mt-1"
      />
      <span className="grid">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}
