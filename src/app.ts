import * as http from "http";
import { HttpApi } from "./http-api";
import { Config } from "./common/config";
import { Database } from "./common/db";
import { Logger } from "./common/logger";
import { WssLauncher } from "./ws-api";

const logger = Logger("Application");

async function start() {
  // await Database.connect();

  const api = new HttpApi().get();
  const httpServer = http.createServer(api);
  httpServer.listen(Config.PORT, "0.0.0.0", () =>
    logger.info("Starting at PORT=%d", Config.PORT)
  );

  new WssLauncher(httpServer);

  const shutdown = async (signal?: NodeJS.Signals) => {
    logger.info(`shutting down servers`, { signal });

    const closeCallback = (label: string) => {
      return (err?: Error) =>
        err
          ? logger.error(`close error`, err, { label })
          : logger.info(`[${label}] closed`, { label });
    };

    httpServer.close(closeCallback("HttpServer"));

    const waitToClose = 2000;
    setTimeout(() => {
      logger.info(`forcefully exit after ${waitToClose}ms`);
      process.exit();
    }, waitToClose).unref();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => logger.error(err));
