import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, BarChart3, Shield, Cpu, TrendingUp } from "lucide-react";

const categories = [
  {
    name: "Trading Basics",
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    articles: [
      { title: "Understanding Crypto Market Structure", readTime: "8 min", level: "beginner", description: "Learn how crypto markets work, the role of exchanges, and how prices are determined." },
      { title: "Order Types Explained: Market, Limit, Stop", readTime: "6 min", level: "beginner", description: "A comprehensive guide to the different order types and when to use each one." },
      { title: "How Leverage Works in Crypto Trading", readTime: "10 min", level: "intermediate", description: "Understanding leverage, margin, and liquidation risk in leveraged crypto trading." },
    ],
  },
  {
    name: "Technical Analysis",
    icon: BarChart3,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    articles: [
      { title: "Reading Candlestick Charts", readTime: "12 min", level: "beginner", description: "Interpreting candlestick patterns and what they reveal about market sentiment." },
      { title: "RSI and Momentum Indicators", readTime: "9 min", level: "intermediate", description: "Using the Relative Strength Index and other momentum indicators to time entries and exits." },
      { title: "Support, Resistance, and Breakouts", readTime: "11 min", level: "intermediate", description: "Identifying key price levels and trading breakout strategies effectively." },
    ],
  },
  {
    name: "Risk Management",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    articles: [
      { title: "Position Sizing: The Kelly Criterion", readTime: "14 min", level: "advanced", description: "Using mathematical frameworks to determine optimal position sizes based on edge and risk tolerance." },
      { title: "Portfolio Diversification in Crypto", readTime: "8 min", level: "intermediate", description: "How to build a diversified crypto portfolio and manage correlation risk." },
      { title: "Drawdown Control and Capital Preservation", readTime: "10 min", level: "advanced", description: "Strategies for managing drawdowns and protecting your capital during adverse market conditions." },
    ],
  },
  {
    name: "Algorithmic Trading",
    icon: Cpu,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    articles: [
      { title: "Introduction to Algorithmic Trading", readTime: "15 min", level: "intermediate", description: "The fundamentals of systematic and algorithmic trading strategies in crypto markets." },
      { title: "Backtesting: How to Validate a Strategy", readTime: "13 min", level: "advanced", description: "How to properly backtest trading strategies and avoid common pitfalls like overfitting." },
      { title: "Signal Generation and ML in Trading", readTime: "18 min", level: "advanced", description: "Overview of machine learning applications in trading signal generation and strategy optimization." },
    ],
  },
];

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  advanced: "bg-purple-500/20 text-purple-400 border-purple-500/40",
};

export default function Education() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Education Hub</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">Curated trading education content</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/40">
              Investopedia
            </Badge>
          </div>
        </div>

        {/* Partner Notice */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Educational content curated in partnership with Investopedia.
              Investopedia is an <strong>education partner only</strong> — not an authentication or execution provider.
              Content is for informational purposes.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.name}>
              <div className={`flex items-center gap-3 p-3 rounded-lg border mb-4 ${cat.bg}`}>
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                <h2 className={`font-semibold ${cat.color}`}>{cat.name}</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.articles.map((article) => (
                  <Card key={article.title} className="hover:border-primary/40 transition-colors cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={`text-xs ${levelColors[article.level]}`}>
                          {article.level}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <Clock className="h-3 w-3" /> {article.readTime}
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm leading-tight mb-2">{article.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{article.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
