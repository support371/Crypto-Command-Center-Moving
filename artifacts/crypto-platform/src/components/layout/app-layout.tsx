import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { getGetMeQueryKey, useGetMe } from "@workspace/api-client-react";
import { Redirect, useLocation } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });
  const [location] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (isError || !user) {
    return <Redirect to="/login" />;
  }

  if (!user.onboardingCompleted && location !== "/onboarding") {
    return <Redirect to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
