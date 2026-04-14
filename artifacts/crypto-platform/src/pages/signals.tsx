import { useState } from "react";
import { useGetSignals, useGetSignalsStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

function DirectionIcon({ dir }: { dir: string }) {
  if (dir === "long") return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (dir === "short") return <TrendingDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

export default function Signals() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: signals, isLoading } = useGetSignals({ status: statusFilter as "all" | "active" | "inactive" });
  const { data: stats } = useGetSignalsStats();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trading Signals</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">ML-generated and technical analysis signals across all exchanges</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats ? (
            <>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Signals</div>
                <div className="text-2xl font-bold">{stats.totalSignals}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active</div>
                <div className="text-2xl font-bold text-emerald-400">{stats.activeSignals}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Win Rate</div>
                <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Confidence</div>
                <div className="text-2xl font-bold">{stats.avgConfidence.toFixed(0)}%</div>
              </CardContent></Card>
            </>
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))
          )}
        </div>

        {/* Direction Breakdown */}
        {stats && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-muted-foreground">Long:</span>
              <span className="font-medium">{stats.byDirection.long}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-muted-foreground">Short:</span>
              <span className="font-medium">{stats.byDirection.short}</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Neutral:</span>
              <span className="font-medium">{stats.byDirection.neutral}</span>
            </div>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Signals</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6"><Skeleton className="h-40 w-full" /></div>
            ) : signals?.data.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No signals found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Signal</TableHead>
                      <TableHead>Exchange</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Strength</TableHead>
                      <TableHead className="text-right">Entry</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead className="text-right">Stop Loss</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signals?.data.map((sig) => (
                      <TableRow key={sig.id}>
                        <TableCell>
                          <div className="font-medium text-sm">{sig.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{sig.symbol}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{sig.exchange}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <DirectionIcon dir={sig.direction} />
                            <span className={`text-xs font-medium ${
                              sig.direction === "long" ? "text-emerald-400" :
                              sig.direction === "short" ? "text-red-400" : "text-muted-foreground"
                            }`}>
                              {sig.direction.toUpperCase()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-primary"
                                style={{ width: `${sig.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono">{sig.confidence.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium ${
                            sig.strength === "strong" ? "text-emerald-400" :
                            sig.strength === "moderate" ? "text-amber-400" : "text-muted-foreground"
                          }`}>
                            {sig.strength}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatCurrency(sig.entryZone)}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-emerald-400">{formatCurrency(sig.targetPrice)}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-red-400">{formatCurrency(sig.stopLoss)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              sig.status === "active" ? "text-emerald-400 border-emerald-500/40" :
                              sig.status === "expired" ? "text-red-400 border-red-500/40" :
                              "text-muted-foreground"
                            }`}
                          >
                            {sig.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{sig.source}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
