import type { ReactNode } from "react";

// The real <html> layout lives in app/[locale]/layout.tsx.
// This pass-through root layout is required because app/not-found.tsx sits at the root.
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
