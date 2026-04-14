import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings2, CheckCircle } from "lucide-react";

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        routingMode: settings.routingMode,
        defaultLeverage: settings.defaultLeverage,
        reconciliationInterval: settings.reconciliationInterval,
        guardianHeartbeatInterval: settings.guardianHeartbeatInterval,
        notificationsEnabled: settings.notificationsEnabled,
        emailAlerts: settings.emailAlerts,
        auditRetentionDays: settings.auditRetentionDays,
        theme: settings.theme,
        timezone: settings.timezone,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({ data: form });
    queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">Platform configuration and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                <CheckCircle className="h-4 w-4" /> Saved
              </div>
            )}
            <Button onClick={handleSave} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Execution Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> Execution Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm">Routing Mode</Label>
                <Select value={form.routingMode} onValueChange={(v) => set("routingMode", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto — Intelligent routing based on latency & liquidity</SelectItem>
                    <SelectItem value="manual">Manual — Override all routing decisions</SelectItem>
                    <SelectItem value="disabled">Disabled — Pause all order routing</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Auto mode routes to BTCC or Bitget based on real-time conditions.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Default Leverage</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="1"
                  max="100"
                  value={form.defaultLeverage || ""}
                  onChange={(e) => set("defaultLeverage", Number(e.target.value))}
                  className="w-32 font-mono"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm">Reconciliation Interval (seconds)</Label>
                <Input
                  type="number"
                  value={form.reconciliationInterval || ""}
                  onChange={(e) => set("reconciliationInterval", Number(e.target.value))}
                  className="w-32 font-mono"
                />
                <p className="text-xs text-muted-foreground">How often to reconcile positions across exchanges.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Guardian Heartbeat Interval (seconds)</Label>
                <Input
                  type="number"
                  value={form.guardianHeartbeatInterval || ""}
                  onChange={(e) => set("guardianHeartbeatInterval", Number(e.target.value))}
                  className="w-32 font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Audit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications & Audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">System Notifications</Label>
                  <p className="text-xs text-muted-foreground">In-app alerts for risk events and system status changes</p>
                </div>
                <Switch
                  checked={form.notificationsEnabled || false}
                  onCheckedChange={(v) => set("notificationsEnabled", v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">Send critical alerts to your registered email</p>
                </div>
                <Switch
                  checked={form.emailAlerts || false}
                  onCheckedChange={(v) => set("emailAlerts", v)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm">Audit Log Retention (days)</Label>
                <Input
                  type="number"
                  min="30"
                  max="365"
                  value={form.auditRetentionDays || ""}
                  onChange={(e) => set("auditRetentionDays", Number(e.target.value))}
                  className="w-32 font-mono"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm">Theme</Label>
                <Select value={form.theme} onValueChange={(v) => set("theme", v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Timezone</Label>
                <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Zurich">Zurich</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Asia/Singapore">Singapore</SelectItem>
                    <SelectItem value="Asia/Hong_Kong">Hong Kong</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
