"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/CartDrawer";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
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
