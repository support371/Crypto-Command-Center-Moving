import { useState } from "react";
import { useLocation } from "wouter";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Activity, Shield, Zap, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Welcome to CryptoCore",
    icon: Activity,
    content: (
      <div className="space-y-6">
        <p className="text-muted-foreground leading-relaxed text-lg">
          CryptoCore is your unified command center for professional algorithmic crypto trading.
          This onboarding will walk you through the core concepts before you start.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "Execution Layer", desc: "Routes orders to BTCC (primary) and Bitget (secondary) based on real-time latency and liquidity." },
            { title: "Guardian System", desc: "Continuously monitors all activity. Automatically halts trading if risk thresholds are breached." },
            { title: "Risk Engine", desc: "Enforces position size limits, daily loss caps, drawdown limits, and concentration rules." },
            { title: "Audit Trail", desc: "Every action, decision, and system event is logged immutably for operational visibility." },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-lg border border-border bg-card">
              <CheckCircle className="h-4 w-4 text-emerald-400 mb-2" />
              <h4 className="font-medium text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Exchange Configuration",
    icon: Zap,
    content: (
      <div className="space-y-6">
        <p className="text-muted-foreground leading-relaxed">
          CryptoCore integrates with two active crypto exchanges. Understanding how routing works is essential.
        </p>
        <div className="space-y-4">
          {[
            {
              name: "BTCC",
              role: "Primary Exchange",
              color: "border-emerald-500/40 bg-emerald-500/5",
              badge: "bg-emerald-500/20 text-emerald-400",
              desc: "Receives the majority of order flow. Selected when latency and liquidity are optimal. Primary balance custody.",
            },
            {
              name: "Bitget",
              role: "Secondary Exchange",
              color: "border-blue-500/40 bg-blue-500/5",
              badge: "bg-blue-500/20 text-blue-400",
              desc: "Handles overflow volume and arbitrage opportunities. Automatic failover when BTCC is unavailable.",
            },
            {
              name: "Forex.com",
              role: "Broker / Execution Partner",
              color: "border-purple-500/40 bg-purple-500/5",
              badge: "bg-purple-500/20 text-purple-400",
              desc: "Account data and execution partner only. Not a crypto exchange. Not an authentication provider.",
            },
          ].map((exch) => (
            <div key={exch.name} className={`p-4 rounded-lg border ${exch.color}`}>
              <div className="flex items-start gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${exch.badge}`}>{exch.role}</span>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{exch.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{exch.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Risk Acknowledgment",
    icon: Shield,
    content: (
      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-2 text-destructive">Important Risk Disclosure</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Algorithmic crypto trading involves substantial risk. Markets can be highly volatile.
                Automated systems may experience connectivity issues, data feed errors, or unexpected behavior.
                Always monitor your positions and ensure risk limits are properly configured.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            "The Guardian system is your first line of defense — keep it enabled at all times",
            "Set conservative risk limits initially and adjust only with careful analysis",
            "Review the audit log regularly to understand all system decisions",
            "The kill switch provides instant halt of all activity — know where it is",
            "Market data is provided by Yahoo Finance as a reference feed only",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          By proceeding to the dashboard, you acknowledge you have read and understood the risk disclosure above.
        </p>
      </div>
    ),
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [completing, setCompleting] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const currentStep = steps.find(s => s.id === step) || steps[0];
  const isLastStep = step === steps.length;

  const handleNext = async () => {
    if (isLastStep) {
      setCompleting(true);
      try {
        const token = getToken();
        const response = await fetch("/api/auth/complete-onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (response.ok) {
          const updatedUser = await response.json();
          queryClient.setQueryData(getGetMeQueryKey(), updatedUser);
        }
      } catch (err) {
        console.error("Failed to complete onboarding:", err);
      } finally {
        setCompleting(false);
      }
      setLocation("/dashboard");
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">CryptoCore</span>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s.id < step
                    ? "bg-primary text-primary-foreground"
                    : s.id === step
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.id < step ? <CheckCircle className="h-4 w-4" /> : s.id}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 min-w-8 ${s.id < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <currentStep.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Step {step} of {steps.length}</p>
              <h2 className="text-xl font-bold">{currentStep.title}</h2>
            </div>
          </div>

          {currentStep.content}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button onClick={handleNext} disabled={completing}>
              {completing ? "Saving..." : isLastStep ? "Enter Dashboard" : "Continue"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
