import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import exchangesRouter from "./exchanges";
import positionsRouter from "./positions";
import ordersRouter from "./orders";
import signalsRouter from "./signals";
import tradesRouter from "./trades";
import riskRouter from "./risk";
import guardianRouter from "./guardian";
import auditRouter from "./audit";
import marketRouter from "./market";
import settingsRouter from "./settings";
import logsRouter from "./logs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(exchangesRouter);
router.use(positionsRouter);
router.use(ordersRouter);
router.use(signalsRouter);
router.use(tradesRouter);
router.use(riskRouter);
router.use(guardianRouter);
router.use(auditRouter);
router.use(marketRouter);
router.use(settingsRouter);
router.use(logsRouter);

export default router;
