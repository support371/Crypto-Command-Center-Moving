import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetMe } from "@workspace/api-client-react";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Signals from "@/pages/signals";
import Trades from "@/pages/trades";
import Risk from "@/pages/risk";
import LogsPage from "@/pages/logs-page";
import Settings from "@/pages/settings";
import Partners from "@/pages/partners";
import Education from "@/pages/education";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found.</p>
        <a href="/" className="mt-4 inline-block text-primary hover:underline">Go home</a>
      </div>
    </div>
  );
}

function ProtectedLogin() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  if (isLoading) return null;
  if (user) return <Redirect to="/dashboard" />;
  return <Login />;
}

function ProtectedRegister() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  if (isLoading) return null;
  if (user) return <Redirect to="/dashboard" />;
  return <Register />;
}

function ProtectedLanding() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  if (isLoading) return null;
  if (user) return <Redirect to="/dashboard" />;
  return <Landing />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProtectedLanding} />
      <Route path="/login" component={ProtectedLogin} />
      <Route path="/register" component={ProtectedRegister} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/signals" component={Signals} />
      <Route path="/trades" component={Trades} />
      <Route path="/risk" component={Risk} />
      <Route path="/logs" component={LogsPage} />
      <Route path="/settings" component={Settings} />
      <Route path="/partners" component={Partners} />
      <Route path="/education" component={Education} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
