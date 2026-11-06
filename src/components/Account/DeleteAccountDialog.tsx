"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteAccountDialogProps {
  // Google-only accounts have no password, so they only type DELETE
  hasPassword: boolean;
}

interface DeleteResponse {
  success?: boolean;
  message?: string;
  error?: string;
  field?: "password" | "confirmText";
}

const CONFIRM_WORD = "DELETE";

export function DeleteAccountDialog({ hasPassword }: DeleteAccountDialogProps) {
  const router = useRouter();
  const uid = useId();
  const passwordId = `${uid}-password`;
  const confirmId = `${uid}-confirm`;

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");

  const canSubmit =
    !loading &&
    confirmText === CONFIRM_WORD &&
    (!hasPassword || password.length > 0);

  const reset = () => {
    setPassword("");
    setShowPassword(false);
    setConfirmText("");
    setPasswordError("");
    setConfirmError("");
    setFormError("");
  };

  const handleOpenChange = (next: boolean) => {
    // Do not allow closing while the request is running
    if (loading) return;
    if (!next) reset();
    setOpen(next);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setPasswordError("");
    setConfirmError("");
    setFormError("");
    setLoading(true);

    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: hasPassword ? password : undefined,
          confirmText,
        }),
      });

      let data: DeleteResponse = {};
      try {
        data = (await res.json()) as DeleteResponse;
      } catch {
        // non-JSON response, handled below
      }

      if (res.ok && data.success) {
        toast.success(data.message || "Your account has been deleted.");

        // The server already expired the cookies. This also clears the
        // session held in the browser by NextAuth.
        try {
          await signOut({ redirect: false });
        } catch {
          // nothing left to sign out of
        }

        setOpen(false);
        router.replace("/");
        router.refresh();
        return;
      }

      const message =
        data.error || "Could not delete your account. Please try again.";
      if (data.field === "password") setPasswordError(message);
      else if (data.field === "confirmText") setConfirmError(message);
      else setFormError(message);
      toast.error(message);
    } catch {
      const message = "Network error. Check your connection and try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border bg-background px-3.5 py-2.5 text-sm outline-none font-mono focus:border-destructive disabled:opacity-60 rounded-[14px] [corner-shape:squircle]";

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-[16px] [corner-shape:squircle] border border-destructive px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-destructive transition hover:bg-destructive hover:text-white cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Delete Account
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto p-6 sm:p-8 rounded-[22px] sm:rounded-[22px] [corner-shape:squircle]">
        <form onSubmit={handleDelete} noValidate className="space-y-6">
          <AlertDialogHeader className="space-y-3 text-left">
            <AlertDialogTitle className="font-heading text-2xl uppercase tracking-tight text-destructive">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              <strong className="text-foreground">
                This action is permanent.
              </strong>{" "}
              All saved addresses and profile preferences will be removed. Past
              fulfilled order records will remain anonymized for tax/invoicing
              records.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {formError && (
            <div
              role="alert"
              className="border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive rounded-[14px] [corner-shape:squircle]"
            >
              {formError}
            </div>
          )}

          {hasPassword && (
            <div>
              <label
                htmlFor={passwordId}
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  aria-invalid={passwordError ? true : undefined}
                  aria-describedby={
                    passwordError ? `${passwordId}-error` : undefined
                  }
                  className={`${inputClass} pr-11 ${
                    passwordError ? "border-destructive" : "border-border"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p
                  id={`${passwordId}-error`}
                  role="alert"
                  className="mt-1.5 text-xs text-destructive"
                >
                  {passwordError}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor={confirmId}
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Type <span className="text-destructive">{CONFIRM_WORD}</span> to
              confirm
            </label>
            <input
              id={confirmId}
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={loading}
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                if (confirmError) setConfirmError("");
              }}
              aria-invalid={confirmError ? true : undefined}
              aria-describedby={confirmError ? `${confirmId}-error` : undefined}
              className={`${inputClass} ${
                confirmError ? "border-destructive" : "border-border"
              }`}
              placeholder={CONFIRM_WORD}
            />
            {confirmError && (
              <p
                id={`${confirmId}-error`}
                role="alert"
                className="mt-1.5 text-xs text-destructive"
              >
                {confirmError}
              </p>
            )}
          </div>

          <AlertDialogFooter className="gap-3 sm:gap-3 sm:space-x-0">
            <AlertDialogCancel
              disabled={loading}
              className="mt-0 rounded-[14px] [corner-shape:squircle] text-xs font-bold uppercase tracking-[0.2em]"
            >
              Cancel
            </AlertDialogCancel>
            {/* A normal button (not AlertDialogAction), so the dialog stays open while loading */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-[14px] [corner-shape:squircle] bg-destructive px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {loading && (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              )}
              <span>{loading ? "Deleting..." : "Delete Permanently"}</span>
            </button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
