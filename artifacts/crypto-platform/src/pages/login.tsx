import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, AlertCircle } from "lucide-react";
import { setToken } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await loginMutation.mutateAsync({ data: { email, password } });
      setToken(result.token);
      queryClient.setQueryData(getGetMeQueryKey(), result.user);
      if (!result.user.onboardingCompleted) {
        setLocation("/onboarding");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
            <Activity className="h-9 w-9 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-4">CryptoCore</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Professional-grade crypto trading command center for algorithmic traders.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { label: "Guardian Monitoring", desc: "24/7 automated risk protection" },
              { label: "Multi-Exchange", desc: "BTCC and Bitget routing" },
              { label: "Kill Switch", desc: "One-click emergency halt" },
              { label: "Full Audit Trail", desc: "Complete operational visibility" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-background/50 border border-border">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">CryptoCore</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your trading command center</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="trader@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create account
            </Link>
          </p>

          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-muted-foreground">Email: demo@cryptocore.io</p>
            <p className="text-xs text-muted-foreground">Password: demo1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
