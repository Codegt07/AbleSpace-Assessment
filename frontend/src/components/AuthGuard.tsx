"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Home/login page is public.
    if (pathname === "/") {
      setCheckingAuth(false);
      return;
    }

    const storedGuest = localStorage.getItem("guest");

    if (!storedGuest) {
      router.replace("/");
      return;
    }

    try {
      const guest = JSON.parse(storedGuest);

      if (!guest?.guestId || !guest?.workspaceId) {
        localStorage.clear();
        router.replace("/");
        return;
      }

      setCheckingAuth(false);
    } catch {
      localStorage.clear();
      router.replace("/");
    }
  }, [pathname, router]);

  if (pathname !== "/" && checkingAuth) {
    return null;
  }

  return <>{children}</>;
}