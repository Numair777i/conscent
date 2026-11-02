"use client";

import { useState } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChangePasswordForm } from "@/components/Account/ChangePasswordForm";

// A dashboard card that opens the Change Password form in a pop-up card
export function ChangePasswordModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group cursor-pointer p-6 border border-border bg-card hover:border-foreground/60 transition-all flex flex-col justify-between text-left w-full h-full outline-none focus-visible:border-foreground"
        >
          <div>
            <KeyRound className="size-6 mb-4 text-muted-foreground group-hover:text-brand transition-colors" />
            <h2 className="font-heading text-lg uppercase tracking-wide mb-1">
              Change Password
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Update your sign-in password to keep your account secure.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1 text-[11px] font-bold tracking-widest uppercase text-brand group-hover:translate-x-1 transition-transform">
            <span>Change Password</span>
            <ArrowRight className="size-3" />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-md gap-6 overflow-y-auto rounded-none border-border p-6 sm:rounded-none sm:p-8">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="font-heading text-2xl uppercase tracking-tight">
            Change Password
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Enter your current password, then choose a new one.
          </DialogDescription>
        </DialogHeader>

        <ChangePasswordForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
