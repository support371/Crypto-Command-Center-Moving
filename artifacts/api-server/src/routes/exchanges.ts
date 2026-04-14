import { Router, type IRouter } from "express";

const router: IRouter = Router();

const exchanges = [
  {
    id: "btcc",
    name: "BTCC",
    type: "crypto",
    status: "connected",
    balance: 75000,
    availableBalance: 68500,
    isPrimary: true,
    isActive: true,
    apiStatus: "ok",
    latencyMs: 42,
    role: "execution",
    lastSync: new Date().toISOString(),
    metadata: {
      description: "Primary crypto exchange. Handles the majority of execution volume.",
      website: "https://www.btcc.com",
      pairs: 320,
    },
  },
  {
    id: "bitget",
    name: "Bitget",
    type: "crypto",
    status: "connected",
    balance: 50000,
    availableBalance: 44200,
    isPrimary: false,
    isActive: true,
    apiStatus: "ok",
    latencyMs: 58,
    role: "execution",
    lastSync: new Date().toISOString(),
    metadata: {
      description: "Secondary crypto exchange. Used for routing overflow and arbitrage.",
      website: "https://www.bitget.com",
      pairs: 580,
    },
  },
  {
    id: "forex",
    name: "Forex.com",
    type: "broker",
    status: "connected",
    balance: 0,
    availableBalance: 0,
    isPrimary: false,
    isActive: true,
    apiStatus: "ok",
    latencyMs: 95,
    role: "broker",
    lastSync: new Date().toISOString(),
    metadata: {
      description: "Broker and account-data execution partner. NOT an authentication provider. Account data and execution only.",
      website: "https://www.forex.com",
      role: "broker_execution_only",
    },
  },
  {
    id: "yahoo-finance",
    name: "Yahoo Finance",
    type: "market-data",
    status: "connected",
    balance: 0,
    availableBalance: 0,
    isPrimary: false,
    isActive: true,
    apiStatus: "ok",
    latencyMs: 120,
    role: "market-data",
    lastSync: new Date().toISOString(),
    metadata: {
      description: "Market data partner. Provides real-time price feeds, historical data, and market overview. NOT an authentication or execution provider.",
      website: "https://finance.yahoo.com",
      role: "market_data_only",
    },
  },
  {
    id: "investopedia",
    name: "Investopedia",
    type: "education",
    status: "connected",
    balance: 0,
    availableBalance: 0,
    isPrimary: false,
    isActive: true,
    apiStatus: "ok",
    latencyMs: 80,
    role: "education",
    lastSync: new Date().toISOString(),
    metadata: {
      description: "Education partner. Provides curated trading and investment education content. NOT an authentication or execution provider.",
      website: "https://www.investopedia.com",
      role: "education_only",
    },
  },
];

router.get("/exchanges", async (req, res): Promise<void> => {
  res.json(exchanges);
});

router.get("/exchanges/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const exchange = exchanges.find(e => e.id === raw);

  if (!exchange) {
    res.status(404).json({ error: "Not found", message: "Exchange not found" });
    return;
  }

  res.json(exchange);
});

export default router;
