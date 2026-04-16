import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Activity,
  History,
  ShieldAlert,
  TerminalSquare,
  Settings,
  Users,
  BookOpen,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Signals", href: "/signals", icon: Activity },
  { name: "Trades", href: "/trades", icon: History },
  { name: "Risk", href: "/risk", icon: ShieldAlert },
  { name: "Logs", href: "/logs", icon: TerminalSquare },
  { name: "Partners", href: "/partners", icon: Users },
  { name: "Education", href: "/education", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();
  const logoutMutation = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.setQueryData(getGetMeQueryKey(), null);
      setLocation("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const NavLinks = () => (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isActive = location === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon
              className={cn(
                "mr-3 flex-shrink-0 h-5 w-5",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">CryptoCore</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex items-center h-16 px-4 border-b border-sidebar-border bg-sidebar-primary/10">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center mr-2">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-sidebar-foreground">CryptoCore</span>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3">
                <NavLinks />
              </div>
              {user && (
                <div className="p-4 border-t border-sidebar-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <p className="font-medium text-sidebar-foreground">{user.name}</p>
                      <p className="text-xs text-sidebar-foreground/70 truncate w-32">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-sidebar border-sidebar-border min-h-screen">
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border bg-sidebar-primary/10">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center mr-2">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">CryptoCore</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <NavLinks />
        </div>
        {user && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <p className="font-medium text-sidebar-foreground">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate w-40">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
