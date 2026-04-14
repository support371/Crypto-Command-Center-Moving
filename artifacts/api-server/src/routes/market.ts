import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/market/overview", async (req, res): Promise<void> => {
  res.json({
    btcPrice: 68450.25 + (Math.random() - 0.5) * 1000,
    btcChange24h: 2.34,
    ethPrice: 3820.80 + (Math.random() - 0.5) * 100,
    ethChange24h: -0.87,
    totalMarketCap: 2.48e12,
    totalVolume24h: 98.4e9,
    fearGreedIndex: 72,
    fearGreedLabel: "Greed",
    dominanceBTC: 54.2,
    topMovers: [
      { symbol: "BTC/USDT", price: 68450.25, change24h: 2.34, volume: 28.4e9 },
      { symbol: "ETH/USDT", price: 3820.80, change24h: -0.87, volume: 15.2e9 },
      { symbol: "SOL/USDT", price: 178.45, change24h: 5.12, volume: 4.8e9 },
      { symbol: "BNB/USDT", price: 589.30, change24h: 1.23, volume: 3.1e9 },
      { symbol: "XRP/USDT", price: 0.6234, change24h: -2.45, volume: 2.9e9 },
    ],
    dataSource: "Yahoo Finance",
    lastUpdated: new Date().toISOString(),
  });
});

export default router;
