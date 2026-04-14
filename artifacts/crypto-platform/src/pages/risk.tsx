import { useState } from "react";
import { useGetRiskMetrics, useGetRiskLimits, useUpdateRiskLimits, getGetRiskLimitsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

function RiskLevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    moderate: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    elevated: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    critical: "bg-red-500/20 text-red-400 border-red-500/40",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${map[level] || "bg-muted text-muted-foreground"}`}>
      {level.toUpperCase()}
    </span>
  );
}

export default function Risk() {
  const queryClient = useQueryClient();
  const { data: metrics, isLoading: metricsLoading } = useGetRiskMetrics();
  const { data: limits } = useGetRiskLimits();
  const updateLimits = useUpdateRiskLimits();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const startEdit = () => {
    if (limits) {
      setForm({
        maxPositionSize: String(limits.maxPositionSize),
        maxDailyLoss: String(limits.maxDailyLoss),
        maxDrawdown: String(limits.maxDrawdown),
        maxLeverage: String(limits.maxLeverage),
        maxExposurePercent: String(limits.maxExposurePercent),
        maxConcentrationPercent: String(limits.maxConcentrationPercent),
      });
    }
    setEditMode(true);
  };

  const handleSave = async () => {
    await updateLimits.mutateAsync({
      data: {
        maxPositionSize: Number(form.maxPositionSize),
        maxDailyLoss: Number(form.maxDailyLoss),
        maxDrawdown: Number(form.maxDrawdown),
        maxLeverage: Number(form.maxLeverage),
        maxExposurePercent: Number(form.maxExposurePercent),
        maxConcentrationPercent: Number(form.maxConcentrationPercent),
      },
    });
    queryClient.invalidateQueries({ queryKey: getGetRiskLimitsQueryKey() });
    setEditMode(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Risk Management</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">Portfolio risk metrics and configurable risk limits</p>
          </div>
          {metrics && <RiskLevelBadge level={metrics.overallRiskLevel} />}
        </div>

        {/* Risk Alerts */}
        {metrics?.alerts && metrics.alerts.length > 0 && (
          <div className="space-y-3">
            {metrics.alerts.map((alert) => (
              <Alert key={alert.id} variant={alert.severity === "critical" ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {metricsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : metrics ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Portfolio VaR</div>
                  <div className="text-xl font-bold font-mono text-red-400">
                    ${metrics.portfolioVaR.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">95% confidence</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Max Drawdown</div>
                  <div className="text-xl font-bold font-mono text-red-400">
                    {metrics.maxDrawdown.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Current: {metrics.currentDrawdown.toFixed(1)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sharpe Ratio</div>
                  <div className="text-xl font-bold font-mono">{metrics.sharpeRatio.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Risk-adjusted return</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Beta</div>
                  <div className="text-xl font-bold font-mono">{metrics.beta.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-1">vs. market</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">BTC Correlation</div>
                  <div className="text-xl font-bold font-mono">{metrics.correlationBTC.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-1">R-squared</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Concentration Risk</div>
                  <div className={`text-xl font-bold font-mono ${metrics.concentrationRisk > 40 ? "text-amber-400" : ""}`}>
                    {metrics.concentrationRisk.toFixed(1)}%
                  </div>
                  <Progress value={metrics.concentrationRisk} className="h-1 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Liquidity Score</div>
                  <div className="text-xl font-bold font-mono">{metrics.liquidityScore.toFixed(1)}/10</div>
                  <Progress value={metrics.liquidityScore * 10} className="h-1 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Drawdown</div>
                  <div className={`text-xl font-bold font-mono ${metrics.currentDrawdown > 10 ? "text-red-400" : metrics.currentDrawdown > 5 ? "text-amber-400" : ""}`}>
                    {metrics.currentDrawdown.toFixed(1)}%
                  </div>
                  <Progress value={metrics.currentDrawdown} className="h-1 mt-2" />
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Risk Limits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Risk Limits
            </CardTitle>
            {!editMode ? (
              <Button variant="outline" size="sm" onClick={startEdit}>Edit Limits</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={updateLimits.isPending}>
                  {updateLimits.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {limits ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: "maxPositionSize", label: "Max Position Size", prefix: "$" },
                  { key: "maxDailyLoss", label: "Max Daily Loss", prefix: "$" },
                  { key: "maxDrawdown", label: "Max Drawdown", suffix: "%" },
                  { key: "maxLeverage", label: "Max Leverage", suffix: "x" },
                  { key: "maxExposurePercent", label: "Max Exposure", suffix: "%" },
                  { key: "maxConcentrationPercent", label: "Max Concentration", suffix: "%" },
                ].map(({ key, label, prefix, suffix }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    {editMode ? (
                      <Input
                        type="number"
                        value={form[key] || ""}
                        onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="h-8 text-sm font-mono"
                      />
                    ) : (
                      <div className="text-base font-bold font-mono">
                        {prefix}{limits[key as keyof typeof limits]}{suffix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Skeleton className="h-32 w-full" />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
