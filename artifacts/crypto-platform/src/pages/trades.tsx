import { useState } from "react";
import { useGetTrades, useGetTradesStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, History } from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

function PnlCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground text-sm">—</span>;
  const pos = value >= 0;
  return (
    <span className={`font-mono text-sm font-medium flex items-center gap-1 ${pos ? "text-emerald-400" : "text-red-400"}`}>
      {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {pos ? "+" : ""}{formatCurrency(value)}
    </span>
  );
}

export default function Trades() {
  const [exchangeFilter, setExchangeFilter] = useState("");
  const { data: trades, isLoading } = useGetTrades({ exchange: exchangeFilter || undefined });
  const { data: stats } = useGetTradesStats();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trade History</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Complete record of all executed trades across exchanges</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {stats ? (
            <>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Trades</div>
                <div className="text-2xl font-bold">{stats.totalTrades}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Win Rate</div>
                <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">{stats.winningTrades}W / {stats.losingTrades}L</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Realized PnL</div>
                <div className={`text-2xl font-bold font-mono ${stats.totalRealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {stats.totalRealizedPnl >= 0 ? "+" : ""}{formatCurrency(stats.totalRealizedPnl)}
                </div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best Trade</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">+{formatCurrency(stats.bestTrade)}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Fees</div>
                <div className="text-2xl font-bold font-mono text-muted-foreground">{formatCurrency(stats.totalFees)}</div>
              </CardContent></Card>
            </>
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))
          )}
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Trades</CardTitle>
            <Select value={exchangeFilter} onValueChange={setExchangeFilter}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="All Exchanges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Exchanges</SelectItem>
                <SelectItem value="BTCC">BTCC</SelectItem>
                <SelectItem value="Bitget">Bitget</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6"><Skeleton className="h-40 w-full" /></div>
            ) : trades?.data.length === 0 ? (
              <div className="p-8 text-center">
                <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No trades found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Exchange</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Entry</TableHead>
                      <TableHead className="text-right">Exit</TableHead>
                      <TableHead className="text-right">Realized PnL</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Opened</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades?.data.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-mono text-sm font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{trade.exchange}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium ${trade.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>
                            {trade.side.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{trade.quantity}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatCurrency(trade.entryPrice)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {trade.exitPrice ? formatCurrency(trade.exitPrice) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <PnlCell value={trade.realizedPnl ?? null} />
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-muted-foreground">
                          {formatCurrency(trade.fee)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${
                            trade.status === "closed" ? "text-emerald-400 border-emerald-500/40" :
                            trade.status === "cancelled" ? "text-muted-foreground" : "text-blue-400 border-blue-500/40"
                          }`}>
                            {trade.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(trade.openedAt).toLocaleDateString()}
                        </TableCell>
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
