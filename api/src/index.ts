import express from "express";
import cors from "cors";
import cache from "./caching/cacheMiddleware";
import { getDbSize, initDatabase } from "./db/buildDatabase";
import { getStatus, getWeb3IndexRevenue } from "./db/networkRevenueProvider";
import { syncPriceHistory } from "./db/priceHistoryProvider";
import { syncBlocks } from "./akash/akashSync";
import { getCacheSize } from "./akash/dataStore";
import { executionMode, ExecutionMode, isProd } from "./shared/constants";
import { bytesToHumanReadableSize } from "./shared/utils/files";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { statsProcessor } from "./akash/statsProcessor";
import { getGraphData, getDashboardData } from "./db/statsProvider";
import * as marketDataProvider from "./providers/marketDataProvider";
import { fetchGithubReleases } from "./providers/githubProvider";
import { getNetworkCapacity, getProviders, syncProvidersInfo } from "./providers/providerStatusProvider";
import { getTemplateGallery } from "./providers/templateReposProvider";
import { Scheduler } from "./scheduler";
import { getDeployment } from "./db/explorerProvider";
import { getBlock, getBlocks } from "./db/blocksProvider";
import { getTransaction, getTransactions } from "./db/transactionsProvider";
import { getAddressBalance, getValidator, getValidators } from "./providers/apiNodeProvider";

require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: process.env.AKASHLYTICS_CORS_WEBSITE_URLS?.split(",") || ["http://localhost:3000", "http://localhost:3001"],
    optionsSuccessStatus: 200
  })
);

const { PORT = 3080 } = process.env;

let latestQueryingError = null;
let latestQueryingErrorDate = null;

Sentry.init({
  dsn: "https://1ef35fcd6f3b43aa887cd8a152df1014@o877251.ingest.sentry.io/5957967",
  environment: process.env.NODE_ENV,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({
      // to trace all requests to the default router
      app
      // alternatively, you can specify the routes you want to trace:
      // router: someRouter,
    })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.1
});

const scheduler = new Scheduler({
  healthchecksEnabled: process.env.HealthchecksEnabled === "true",
  errorHandler: (task, error) => {
    console.error(`Task "${task.name}" failed: ${error}`);
    Sentry.captureException(error);
  }
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

const apiRouter = express.Router();
const web3IndexRouter = express.Router();

apiRouter.get("/templates", cache(60 * 5), async (req, res) => {
  try {
    const templates = await getTemplateGallery();
    res.send(templates);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch templates");
  }
});

apiRouter.get("/blocks", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit?.toString());
    const blocks = await getBlocks(limit || 20);

    if (blocks) {
      res.send(blocks);
    } else {
      res.status(400).send("Error fetching blocks.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/blocks/:height", async (req, res) => {
  try {
    const heightInt = parseInt(req.params.height);
    const blockInfo = await getBlock(heightInt);

    if (blockInfo) {
      res.send(blockInfo);
    } else {
      res.status(400).send("Block not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/transactions", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit?.toString());
    const transactions = await getTransactions(limit || 20);

    if (transactions) {
      res.send(transactions);
    } else {
      res.status(400).send("Error fetching blocks.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/transactions/:hash", async (req, res) => {
  try {
    const txInfo = await getTransaction(req.params.hash);

    if (txInfo) {
      res.send(txInfo);
    } else {
      res.status(404).send("Tx not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/addresses/:address", async (req, res) => {
  try {
    const balances = await getAddressBalance(req.params.address);
    res.send(balances);
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/validators", async (req, res) => {
  try {
    const validators = await getValidators();
    res.send(validators);
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/validators/:address", async (req, res) => {
  try {
    const validator = await getValidator(req.params.address);

    res.send(validator);
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/deployment/:owner/:dseq", async (req, res) => {
  try {
    const deployment = await getDeployment(req.params.owner, req.params.dseq);

    if (deployment) {
      res.send(deployment);
    } else {
      res.status(404).send("Deployment not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/latestDeployToolVersion", cache(120), async (req, res) => {
  try {
    const releaseData = await fetchGithubReleases();
    res.send(releaseData);
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/getNetworkCapacity", waitForInitMiddleware, async (req, res) => {
  try {
    const networkCapacity = await getNetworkCapacity();
    res.send(networkCapacity);
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/providers", waitForInitMiddleware, async (req, res) => {
  try {
    const providers = await getProviders();
    res.send(providers);
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

apiRouter.get("/getDashboardData", waitForInitMiddleware, async (req, res) => {
  try {
    const dashboardData = await getDashboardData();
    const marketData = marketDataProvider.getAktMarketData();
    const networkCapacity = await getNetworkCapacity();
    const latestBlocks = await getBlocks(5);

    res.send({ ...dashboardData, marketData, networkCapacity, latestBlocks });
  } catch (err) {
    console.error(err);
  }
});

apiRouter.get("/getGraphData/:dataName", waitForInitMiddleware, async (req, res) => {
  try {
    const dataName = req.params.dataName;
    const authorizedDataNames = [
      "dailyUAktSpent",
      "dailyLeaseCount",
      "totalUAktSpent",
      "activeLeaseCount",
      "totalLeaseCount",
      "activeCPU",
      "activeMemory",
      "activeStorage"
    ];

    if (!authorizedDataNames.includes(dataName)) {
      console.log("Rejected graph request: " + dataName);
      res.sendStatus(404);
      return;
    }

    const graphData = await getGraphData(dataName);
    res.send(graphData);
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
});

apiRouter.get("/status", waitForInitMiddleware, async (req, res) => {
  try {
    const status = scheduler.getTasksStatus();
    res.send(status);
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || err);
  }
});

web3IndexRouter.get("/status", waitForInitMiddleware, async (req, res) => {
  console.log("getting debug infos");

  try {
    const debugInfos = await getStatus();
    const cacheSize = await getCacheSize();
    const dbSize = await getDbSize();
    const memoryInBytes = process.memoryUsage();
    const memory = {
      rss: bytesToHumanReadableSize(memoryInBytes.rss),
      heapTotal: bytesToHumanReadableSize(memoryInBytes.heapTotal),
      heapUsed: bytesToHumanReadableSize(memoryInBytes.heapUsed),
      external: bytesToHumanReadableSize(memoryInBytes.external)
    };

    res.send({ ...debugInfos, latestQueryingError, latestQueryingErrorDate, ...cacheSize, dbSize, memory });
  } catch (err) {
    res.status(500).send(err);
  }
});

web3IndexRouter.get("/revenue", waitForInitMiddleware, async (req, res) => {
  try {
    console.log("calculating revenue");

    const revenueData = await getWeb3IndexRevenue(req.query.debug === "true");

    res.send(revenueData);
  } catch (err) {
    latestQueryingError = err;
    latestQueryingErrorDate = new Date();
    console.error(err);

    res.status(500).send("An error occured");
  }
});

app.use("/api", apiRouter);
app.use("/web3-index", web3IndexRouter);

// the rest of your app
app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => {
  console.log("server started at http://localhost:" + PORT);
});

let initDatabaseTask = null;
async function waitForInitMiddleware(req, res, next) {
  try {
    if (initDatabaseTask) {
      console.log(`Call to ${req.originalUrl} is blocked while downloading database`);
      await initDatabaseTask;
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Intizialize database schema
 * Populate db
 * Create backups per version
 * Load from backup if exists for current version
 */
async function initApp() {
  try {
    if (executionMode === ExecutionMode.DoNotSync) {
      await marketDataProvider.fetchLatestData();
      return;
    }

    initDatabaseTask = initDatabase();
    await initDatabaseTask;
    initDatabaseTask = null;

    if (executionMode === ExecutionMode.RebuildStats) {
      await statsProcessor.rebuildStatsTables();
    } else if (executionMode === ExecutionMode.RebuildAll) {
      console.time("Rebuilding all");
      await syncBlocks();
      console.timeEnd("Rebuilding all");
    } else if (executionMode === ExecutionMode.DownloadAndSync || executionMode === ExecutionMode.SyncOnly) {
      scheduler.registerTask("Sync Blocks", syncBlocks, "7 seconds", true, {
        id: "66fa2c48-8a7c-4245-81ac-a0493298f9de",
        measureDuration: true
      });
      scheduler.registerTask("Sync AKT Market Data", marketDataProvider.fetchLatestData, "5 minutes", true, {
        id: "23e94b00-940a-4b4a-8b61-c2167865fa2f",
        measureDuration: true
      });
      scheduler.registerTask("Sync AKT Price History", syncPriceHistory, "1 hour", true, { id: "21a14234-8721-4477-a792-049f6c6104d8", measureDuration: true });
      scheduler.registerTask("Sync Providers Info", syncProvidersInfo, "15 minutes", true, {
        id: "98b40f97-b946-4d6b-a957-5a6e266a4a93",
        measureDuration: true
      });
      scheduler.start();
    } else {
      throw "Invalid execution mode";
    }
  } catch (err) {
    console.error("Error while initializing app", err);

    Sentry.captureException(err);
  }
}

initApp();

export default app;
