import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { Toaster } from "sonner";

export function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto relative">
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            maxWidth: "390px",
            borderRadius: "12px",
          },
        }}
      />
    </div>
  );
}