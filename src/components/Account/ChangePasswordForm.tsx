"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Loader2, Minus } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/password-rules";

type FieldName = "currentPassword" | "newPassword" | "confirmPassword";
type FieldErrors = Partial<Record<FieldName, string>>;

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  error?: string;
  describedBy?: string;
  disabled?: boolean;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  describedBy,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  const describedIds = [error ? errorId : null, describedBy]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          disabled={disabled}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedIds || undefined}
          className={`w-full border bg-background px-3.5 py-2.5 pr-11 text-sm outline-none font-mono focus:border-brand disabled:opacity-60 ${
            error ? "border-destructive" : "border-border"
          }`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:text-foreground outline-none cursor-pointer"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface ChangePasswordFormProps {
  // Called after the password was changed (the modal uses it to close itself)
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const uid = useId();
  const currentId = `${uid}-current`;
  const newId = `${uid}-new`;
  const confirmId = `${uid}-confirm`;
  const rulesId = `${uid}-rules`;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const ruleResults = PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(newPassword),
  }));
  const allRulesMet = ruleResults.every((r) => r.met);
  const hasConfirm = confirmPassword.length > 0;
  const passwordsMatch = hasConfirm && newPassword === confirmPassword;
  const mismatch = hasConfirm && !passwordsMatch;
  const canSubmit =
    !loading && currentPassword.length > 0 && allRulesMet && passwordsMatch;

  const clearMessages = () => {
    setErrors({});
    setFormError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    clearMessages();

    // Quick checks in the browser (the server checks everything again)
    if (!allRulesMet) {
      const message = "Please meet all password requirements.";
      setErrors({ newPassword: message });
      toast.error(message);
      return;
    }
    if (newPassword !== confirmPassword) {
      const message = "New passwords do not match.";
      setErrors({ confirmPassword: message });
      toast.error(message);
      return;
    }
    if (newPassword === currentPassword) {
      const message =
        "New password must be different from your current password.";
      setErrors({ newPassword: message });
      toast.error(message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      let data: {
        success?: boolean;
        error?: string;
        message?: string;
        field?: FieldName;
      } = {};
      try {
        data = await res.json();
      } catch {
        // non-JSON response, handled below
      }

      if (res.ok && data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        const message = data.message || "Your password has been updated.";
        setSuccess(message);
        toast.success(message);
        onSuccess?.();
        return;
      }

      const message =
        data.error || "Could not update your password. Please try again.";
      if (data.field) {
        setErrors({ [data.field]: message });
      } else {
        setFormError(message);
      }
      toast.error(message);
    } catch {
      const message = "Network error. Check your connection and try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-busy={loading}
    >
      {formError && (
        <div
          role="alert"
          className="border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive"
        >
          {formError}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="border border-emerald-500/40 bg-emerald-500/5 px-3.5 py-2.5 text-xs text-emerald-500"
        >
          {success}
        </div>
      )}

      <PasswordField
        id={currentId}
        label="Current Password"
        value={currentPassword}
        onChange={(v) => {
          setCurrentPassword(v);
          if (errors.currentPassword)
            setErrors((p) => ({ ...p, currentPassword: undefined }));
        }}
        autoComplete="current-password"
        error={errors.currentPassword}
        disabled={loading}
      />

      <div className="space-y-3">
        <PasswordField
          id={newId}
          label="New Password"
          value={newPassword}
          onChange={(v) => {
            setNewPassword(v);
            if (errors.newPassword)
              setErrors((p) => ({ ...p, newPassword: undefined }));
          }}
          autoComplete="new-password"
          error={errors.newPassword}
          describedBy={rulesId}
          disabled={loading}
        />

        <ul
          id={rulesId}
          aria-label="Password requirements"
          className="grid grid-cols-1 gap-1.5 sm:grid-cols-2"
        >
          {ruleResults.map((rule) => (
            <li
              key={rule.id}
              className={`flex items-center gap-2 text-xs transition-colors ${
                rule.met ? "text-emerald-500" : "text-muted-foreground"
              }`}
            >
              {rule.met ? (
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Minus className="size-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{rule.label}</span>
              <span className="sr-only">
                {rule.met ? "(met)" : "(not met yet)"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <PasswordField
          id={confirmId}
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            if (errors.confirmPassword)
              setErrors((p) => ({ ...p, confirmPassword: undefined }));
          }}
          autoComplete="new-password"
          error={errors.confirmPassword}
          disabled={loading}
        />
        <p
          aria-live="polite"
          className={`mt-1.5 min-h-4 text-xs ${mismatch ? "text-destructive" : "text-emerald-500"}`}
        >
          {mismatch
            ? "Passwords do not match."
            : passwordsMatch
              ? "Passwords match."
              : ""}
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-brand text-brand-foreground py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
      >
        {loading && (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        )}
        <span>{loading ? "Updating..." : "Update Password"}</span>
      </button>
    </form>
  );
}
