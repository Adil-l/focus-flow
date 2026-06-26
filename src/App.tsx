import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import OnboardingWizard from "@/components/OnboardingWizard";
import { isTauri } from "@/lib/desktop";
import { initAnalytics, track } from "@/lib/analytics";
import NotFound from "./pages/NotFound.tsx";

// Marketing landing at "/", the app at "/app" — both code-split.
const Landing = lazy(() => import("./pages/Landing.tsx"));
const Index = lazy(() => import("./pages/Index.tsx"));

const queryClient = new QueryClient();

initAnalytics();
track("app_opened");

// In the desktop app, open straight to the focus dashboard (/app) instead of the
// marketing landing page.
function DesktopRedirect() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    if (isTauri() && pathname === "/") navigate("/app", { replace: true });
  }, [pathname, navigate]);
  return null;
}

const App = () => {
  // Bumping this key remounts the routed tree so every store hook re-initialises
  // from localStorage — cheaper and less jarring than window.location.reload(),
  // and it keeps desktop (Tauri) init intact. Used by sign-out (after clearing
  // data) and by the cloud pull-on-login (after hydrating from the cloud).
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    const remount = () => setResetKey((k) => k + 1);
    window.addEventListener("focusflow:signout", remount);
    window.addEventListener("focusflow:rehydrate", remount);
    return () => {
      window.removeEventListener("focusflow:signout", remount);
      window.removeEventListener("focusflow:rehydrate", remount);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OnboardingWizard>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <DesktopRedirect />
            <Suspense fallback={null}>
              <Routes key={resetKey}>
                <Route path="/" element={<Landing />} />
                <Route path="/app" element={<ErrorBoundary><Index /></ErrorBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </OnboardingWizard>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
