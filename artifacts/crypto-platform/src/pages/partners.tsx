import { useGetExchanges } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertCircle, Server, BarChart3, BookOpen, XCircle } from "lucide-react";

function StatusIcon({ status }: { status: string }) {
  if (status === "connected") return <CheckCircle className="h-4 w-4 text-emerald-400" />;
  if (status === "degraded") return <AlertCircle className="h-4 w-4 text-amber-400" />;
  return <XCircle className="h-4 w-4 text-red-400" />;
}

function RoleIcon({ role }: { role: string }) {
  if (role === "execution") return <Server className="h-5 w-5 text-blue-400" />;
  if (role === "broker") return <Server className="h-5 w-5 text-purple-400" />;
  if (role === "market-data") return <BarChart3 className="h-5 w-5 text-amber-400" />;
  if (role === "education") return <BookOpen className="h-5 w-5 text-emerald-400" />;
  return <Server className="h-5 w-5 text-muted-foreground" />;
}

const roleLabels: Record<string, { label: string; color: string; bg: string; description: string }> = {
  execution: {
    label: "Crypto Exchange",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    description: "Active crypto exchange for order execution and asset custody.",
  },
  broker: {
    label: "Broker / Execution Partner",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
    description: "Account data and execution partner. NOT a crypto exchange. NOT an authentication provider.",
  },
  "market-data": {
    label: "Market Data Partner",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    description: "Provides real-time and historical market data feeds. NOT an authentication or execution provider.",
  },
  education: {
    label: "Education Partner",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    description: "Curated trading and investment education content. NOT an authentication or execution provider.",
  },
};

const boundaryNotes: Record<string, string[]> = {
  btcc: [
    "Primary order execution exchange",
    "Balance custody and position management",
    "Real-time market data for BTCC-listed pairs",
    "NOT an authentication or login provider",
  ],
  bitget: [
    "Secondary order execution exchange",
    "Overflow routing and arbitrage",
    "Automatic failover from BTCC",
    "NOT an authentication or login provider",
  ],
  forex: [
    "Account data and execution partner only",
    "NOT a crypto exchange",
    "NOT an authentication or login provider",
    "Strict boundary: broker and execution data only",
  ],
  "yahoo-finance": [
    "Market data feed provider",
    "Real-time and historical price data",
    "NOT an execution or authentication provider",
    "Data is for reference and informational purposes",
  ],
  investopedia: [
    "Educational content provider",
    "Trading and investment articles",
    "NOT an execution or authentication provider",
    "Content is for educational purposes only",
  ],
};

export default function Partners() {
  const { data: exchanges, isLoading } = useGetExchanges();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Partner Ecosystem</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            All integration partners, their roles, boundaries, and current status
          </p>
        </div>

        {/* Important Note */}
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Partner Boundary Policy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each partner has a strictly defined role. No partner serves as an authentication provider.
                Authentication is handled internally by the CryptoCore platform.
                Exchange partners (BTCC, Bitget) are the only execution venues.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid lg:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {exchanges?.map((exch) => {
              const roleInfo = roleLabels[exch.role] || roleLabels.execution;
              const notes = boundaryNotes[exch.id] || [];
              const metadataDescription =
                typeof exch.metadata?.description === "string"
                  ? exch.metadata.description
                  : undefined;
              return (
                <Card key={exch.id} className={`border ${roleInfo.bg}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
                          <RoleIcon role={exch.role} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{exch.name}</CardTitle>
                          <span className={`text-xs font-medium ${roleInfo.color}`}>{roleInfo.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon status={exch.status} />
                        <Badge variant="outline" className="text-xs capitalize">{exch.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {metadataDescription || roleInfo.description}
                    </p>

                    {exch.role === "execution" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-card border border-border">
                          <div className="text-xs text-muted-foreground">API Latency</div>
                          <div className="font-mono font-bold">{exch.latencyMs}ms</div>
                        </div>
                        <div className="p-3 rounded-lg bg-card border border-border">
                          <div className="text-xs text-muted-foreground">API Status</div>
                          <div className="font-mono font-bold capitalize">{exch.apiStatus}</div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Role Boundaries</h4>
                      <div className="space-y-1.5">
                        {notes.map((note, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>

                    {exch.isPrimary && (
                      <Badge className="text-xs">Primary Exchange</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
