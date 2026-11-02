"use client";

import * as React from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/CartDrawer";

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null; // passed in from the server layout
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      {children}
      <CartDrawer />
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "#141414",
            border: "1px solid #262626",
            color: "#f5f5f5",
          },
        }}
      />
    </SessionProvider>
  );
}
