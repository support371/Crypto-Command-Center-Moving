import { useState } from "react";
import { useGetSystemLogs } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TerminalSquare, Search } from "lucide-react";

function LevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    debug: "bg-slate-500/20 text-slate-400 border-slate-500/40",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    warn: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    error: "bg-red-500/20 text-red-400 border-red-500/40",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-mono font-medium ${map[level] || "bg-muted text-muted-foreground"}`}>
      {level.toUpperCase()}
    </span>
  );
}

export default function LogsPage() {
  const [levelFilter, setLevelFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: logs, isLoading } = useGetSystemLogs({
    level: levelFilter as "debug" | "info" | "warn" | "error" | undefined || undefined,
    source: sourceFilter || undefined,
  });

  const filtered = logs?.data.filter((log) =>
    !search || log.message.toLowerCase().includes(search.toLowerCase()) || log.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Real-time system log viewer across all platform components</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sources</SelectItem>
              <SelectItem value="routing-engine">routing-engine</SelectItem>
              <SelectItem value="guardian">guardian</SelectItem>
              <SelectItem value="risk-monitor">risk-monitor</SelectItem>
              <SelectItem value="reconciler">reconciler</SelectItem>
              <SelectItem value="market-feed">market-feed</SelectItem>
              <SelectItem value="execution-core">execution-core</SelectItem>
              <SelectItem value="bitget-connector">bitget-connector</SelectItem>
              <SelectItem value="signal-processor">signal-processor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Log Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TerminalSquare className="h-4 w-4" /> Log Stream
              {logs && <Badge variant="outline" className="ml-auto text-xs">{logs.total} entries</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : filtered?.length === 0 ? (
              <div className="p-8 text-center">
                <TerminalSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No log entries found</p>
              </div>
            ) : (
              <div className="font-mono text-xs divide-y divide-border">
                {filtered?.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground flex-shrink-0 w-20 pt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex-shrink-0 pt-0.5">
                      <LevelBadge level={log.level} />
                    </div>
                    <span className="text-primary/70 flex-shrink-0 w-32 truncate pt-0.5">{log.source}</span>
                    <span className="flex-1 text-foreground leading-relaxed">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
