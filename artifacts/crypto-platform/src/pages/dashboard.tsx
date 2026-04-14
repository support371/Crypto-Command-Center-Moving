import { useState } from "react";
import {
  useGetDashboardSummary,
  useGetPnlChart,
  useGetPositions,
  useGetOrders,
  useGetGuardianState,
  useGetAuditLog,
  useGetMarketOverview,
  useTriggerKillSwitch,
  getGetGuardianStateQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Shield,
  Zap,
  Activity,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
  Power,
} from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

function formatPnl(n: number) {
  const fmt = formatCurrency(Math.abs(n));
  return n >= 0 ? `+${fmt}` : `-${fmt}`;
}

function PnlBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`font-mono font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
      {positive ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
      {formatPnl(value)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    operational: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    degraded: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    halted: "bg-red-500/20 text-red-400 border-red-500/30",
    disconnected: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    connected: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function GuardianCheckIcon({ status }: { status: string }) {
  if (status === "passing") return <CheckCircle className="h-4 w-4 text-emerald-400" />;
  if (status === "warning") return <AlertCircle className="h-4 w-4 text-amber-400" />;
  return <XCircle className="h-4 w-4 text-red-400" />;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [chartPeriod, setChartPeriod] = useState<"1d" | "7d" | "30d" | "90d">("7d");

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: chartData } = useGetPnlChart({ period: chartPeriod });
  const { data: positions } = useGetPositions({ status: "open", limit: 5 });
  const { data: orders } = useGetOrders({ limit: 5 });
  const { data: guardian } = useGetGuardianState();
  const { data: auditLog } = useGetAuditLog({ limit: 5 });
  const { data: market } = useGetMarketOverview();

  const killSwitchMutation = useTriggerKillSwitch();

  const handleKillSwitch = async (activate: boolean) => {
    await killSwitchMutation.mutateAsync({
      data: {
        activate,
        reason: activate ? "Manual kill switch triggered by operator" : "Kill switch deactivated by operator",
      },
    });
    queryClient.invalidateQueries({ queryKey: getGetGuardianStateQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Kill Switch Banner */}
        {summary?.killSwitchActive && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive flex items-center justify-between">
              <span>
                <strong>KILL SWITCH ACTIVE</strong> — All trading halted.{" "}
                {guardian?.killSwitchReason && <span className="ml-1 opacity-80">{guardian.killSwitchReason}</span>}
                {guardian?.killSwitchTriggeredAt && (
                  <span className="ml-2 text-xs opacity-70">
                    {new Date(guardian.killSwitchTriggeredAt).toLocaleTimeString()}
                  </span>
                )}
              </span>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                  Deactivate
                </Button>
              </AlertDialogTrigger>
            </AlertDescription>
          </Alert>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {summary ? `Last updated ${new Date(summary.lastUpdated).toLocaleTimeString()}` : "Loading..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-widest">System</div>
              {summary ? (
                <StatusBadge status={summary.systemStatus} />
              ) : (
                <Skeleton className="h-5 w-24" />
              )}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={summary?.killSwitchActive ? "outline" : "destructive"}
                  size="sm"
                  className="gap-2"
                >
                  <Power className="h-4 w-4" />
                  {summary?.killSwitchActive ? "Deactivate Kill Switch" : "Kill Switch"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {summary?.killSwitchActive ? "Deactivate Kill Switch?" : "Activate Kill Switch?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {summary?.killSwitchActive
                      ? "This will resume all trading activity across all connected exchanges. Make sure conditions are safe before proceeding."
                      : "This will immediately halt ALL trading activity across BTCC and Bitget. All open orders will be cancelled. This action is logged."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleKillSwitch(!summary?.killSwitchActive)}
                    className={summary?.killSwitchActive ? "" : "bg-destructive hover:bg-destructive/90"}
                  >
                    {summary?.killSwitchActive ? "Deactivate" : "Activate Kill Switch"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : summary ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <DollarSign className="h-3 w-3" /> Total Balance
                  </div>
                  <div className="text-2xl font-bold font-mono">{formatCurrency(summary.totalBalance)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Available: {formatCurrency(summary.availableBalance)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <Activity className="h-3 w-3" /> Total Exposure
                  </div>
                  <div className="text-2xl font-bold font-mono">{formatCurrency(summary.totalExposure)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{summary.exposurePercent.toFixed(1)}% of portfolio</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <TrendingUp className="h-3 w-3" /> Unrealized PnL
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    <PnlBadge value={summary.unrealizedPnl} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{summary.totalPositions} open positions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <TrendingUp className="h-3 w-3" /> Realized PnL
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    <PnlBadge value={summary.realizedPnl} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">All time</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <Activity className="h-3 w-3" /> Daily PnL
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    <PnlBadge value={summary.dailyPnl} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{summary.dailyPnlPercent.toFixed(2)}% today</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <Zap className="h-3 w-3" /> Routing Mode
                  </div>
                  <div className="text-2xl font-bold capitalize">{summary.routingMode}</div>
                  <div className="text-xs text-muted-foreground mt-1">{summary.openOrders} pending orders</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <Shield className="h-3 w-3" /> Guardian
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {summary.guardianActive ? (
                      <><CheckCircle className="h-5 w-5 text-emerald-400" /><span className="font-semibold text-emerald-400">Active</span></>
                    ) : (
                      <><XCircle className="h-5 w-5 text-red-400" /><span className="font-semibold text-red-400">Inactive</span></>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {guardian?.alertsTriggered ?? 0} alerts triggered
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <Power className="h-3 w-3" /> Kill Switch
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {summary.killSwitchActive ? (
                      <><AlertTriangle className="h-5 w-5 text-red-400" /><span className="font-semibold text-red-400">ACTIVE</span></>
                    ) : (
                      <><CheckCircle className="h-5 w-5 text-emerald-400" /><span className="font-semibold text-emerald-400">Inactive</span></>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {summary.killSwitchActive ? "All trading halted" : "Trading active"}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Exchanges Status */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Exchange Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summary?.exchangesSummary.map((exch) => (
              <Card key={exch.id} className={exch.isPrimary ? "border-primary/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">{exch.name}</span>
                      {exch.isPrimary && (
                        <Badge variant="outline" className="text-xs text-primary border-primary/40">Primary</Badge>
                      )}
                    </div>
                    <StatusBadge status={exch.status} />
                  </div>
                  <div className="text-lg font-bold font-mono">{formatCurrency(exch.balance)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Balance</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* PnL Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">PnL Performance</CardTitle>
            <div className="flex gap-1">
              {(["1d", "7d", "30d", "90d"] as const).map((p) => (
                <Button
                  key={p}
                  variant={chartPeriod === p ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setChartPeriod(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {chartData ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(222 47% 9%)", border: "1px solid hsl(217 33% 17%)", borderRadius: 8 }}
                    formatter={(v: number) => [formatCurrency(v), ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativePnl"
                    stroke="hsl(217 91% 60%)"
                    fill="url(#pnlGrad)"
                    strokeWidth={2}
                    name="Cumulative PnL"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-48 w-full" />
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Positions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open Positions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {positions?.data.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No open positions</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Exchange</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead className="text-right">Unreal. PnL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions?.data.map((pos) => (
                      <TableRow key={pos.id}>
                        <TableCell className="font-mono text-sm font-medium">{pos.symbol}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{pos.exchange}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium ${pos.side === "long" ? "text-emerald-400" : "text-red-400"}`}>
                            {pos.side.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <PnlBadge value={pos.unrealizedPnl} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Guardian State */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" /> Guardian Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              {guardian ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-mono">{Math.floor(guardian.uptimeSeconds / 3600)}h {Math.floor((guardian.uptimeSeconds % 3600) / 60)}m</span>
                  </div>
                  {guardian.monitoringChecks.map((check) => (
                    <div key={check.name} className="flex items-start gap-2">
                      <GuardianCheckIcon status={check.status} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{check.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{check.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Skeleton className="h-32 w-full" />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Market Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Market Overview
                <Badge variant="outline" className="text-xs ml-auto">via Yahoo Finance</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {market ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "BTC", price: market.btcPrice, change: market.btcChange24h },
                      { label: "ETH", price: market.ethPrice, change: market.ethChange24h },
                    ].map((coin) => (
                      <div key={coin.label} className="p-3 rounded-lg bg-muted/30 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">{coin.label}/USDT</div>
                        <div className="font-bold font-mono">{formatCurrency(coin.price)}</div>
                        <div className={`text-xs font-medium mt-1 ${coin.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {coin.change >= 0 ? "+" : ""}{coin.change.toFixed(2)}% 24h
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fear & Greed Index</span>
                    <span className="font-medium">
                      {market.fearGreedIndex} — {market.fearGreedLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">BTC Dominance</span>
                    <span className="font-mono">{market.dominanceBTC}%</span>
                  </div>
                </div>
              ) : (
                <Skeleton className="h-32 w-full" />
              )}
            </CardContent>
          </Card>

          {/* Recent Audit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Audit Events</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLog?.data.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">No audit events</div>
              ) : (
                <div className="space-y-2">
                  {auditLog?.data.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 text-xs">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        entry.severity === "critical" ? "bg-red-400" :
                        entry.severity === "error" ? "bg-red-400" :
                        entry.severity === "warning" ? "bg-amber-400" : "bg-emerald-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{entry.action}</div>
                        <div className="text-muted-foreground">{entry.category} — {entry.actor}</div>
                      </div>
                      <div className="text-muted-foreground flex-shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
