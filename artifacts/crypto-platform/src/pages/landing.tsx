import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Server,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Guardian Monitoring",
    description: "Continuous 24/7 monitoring with automated kill-switch protection. Configurable risk thresholds with instant halt capabilities.",
  },
  {
    icon: Zap,
    title: "Smart Exchange Routing",
    description: "Intelligent routing across BTCC and Bitget exchanges. Real-time latency-based decisions to optimize execution quality.",
  },
  {
    icon: RefreshCw,
    title: "Live Reconciliation",
    description: "Automated position reconciliation across all exchanges. Detect and resolve discrepancies before they become problems.",
  },
  {
    icon: BarChart3,
    title: "Advanced Risk Management",
    description: "Portfolio VaR, drawdown controls, concentration limits, and real-time risk alerts. Built for professional risk discipline.",
  },
  {
    icon: Activity,
    title: "Signal Processing",
    description: "ML-powered signal generation with confidence scoring. Systematic signal tracking from generation to execution.",
  },
  {
    icon: Server,
    title: "Full Audit Trail",
    description: "Complete immutable audit log of every action, routing decision, and system event. Production-grade compliance visibility.",
  },
];

const partners = [
  { name: "BTCC", role: "Primary Crypto Exchange", status: "Active", color: "text-emerald-400" },
  { name: "Bitget", role: "Secondary Crypto Exchange", status: "Active", color: "text-emerald-400" },
  { name: "Forex.com", role: "Broker / Execution Partner", status: "Active", color: "text-blue-400" },
  { name: "Yahoo Finance", role: "Market Data Partner", status: "Active", color: "text-blue-400" },
  { name: "Investopedia", role: "Education Partner", status: "Active", color: "text-purple-400" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">CryptoCore</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 text-xs tracking-widest uppercase">
            Professional Crypto Trading Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Command-Center for{" "}
            <span className="text-primary">Algorithmic</span>{" "}
            Crypto Trading
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            CryptoCore is a unified trading platform built for professional algorithmic traders.
            Monitor live positions, route orders across exchanges, manage risk, and maintain
            full operational visibility — all from a single command center.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Trading <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-border bg-card/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Exchanges", value: "2" },
              { label: "System Uptime", value: "99.9%" },
              { label: "Partners", value: "5" },
              { label: "Monitoring Checks", value: "6" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Built for Professional Operations</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every feature is designed for institutional-grade reliability and operational control.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kill Switch Callout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 flex items-start gap-6">
          <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Emergency Kill Switch</h3>
            <p className="text-muted-foreground leading-relaxed">
              One-click emergency halt for all trading activity across all connected exchanges.
              The Guardian monitor continuously checks system health and can trigger an automated
              halt when risk thresholds are breached — protecting your capital at all times.
            </p>
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="border-t border-border bg-card/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xl font-semibold mb-2">Partner Ecosystem</h2>
            <p className="text-sm text-muted-foreground">Each partner plays a specific, defined role in the platform</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {partners.map((p) => (
              <div key={p.name} className="text-center p-4 rounded-lg border border-border bg-card">
                <div className={`font-bold text-base mb-1 ${p.color}`}>{p.name}</div>
                <div className="text-xs text-muted-foreground mb-2 leading-tight">{p.role}</div>
                <Badge variant="outline" className="text-xs">{p.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>CryptoCore — Professional Crypto Trading Platform</p>
      </div>
    </div>
  );
}
