const path = require("path");
const dotenv = require("dotenv");

const envTestPath = path.resolve(
  __dirname,
  "../.env.test"
);

const result = dotenv.config({
  path: envTestPath,
  override: true,
  quiet: true,
});

if (result.error && result.error.code !== "ENOENT") {
  throw new Error(
    `.env.test could not be loaded from:\n${envTestPath}\n\n${result.error.message}`
  );
}

if (!process.env.TEST_USER_EMAIL) {
  throw new Error(
    "TEST_USER_EMAIL must be set in .env.test or the test environment"
  );
}

if (!process.env.TEST_USER_PASSWORD) {
  throw new Error(
    "TEST_USER_PASSWORD must be set in .env.test or the test environment"
  );
}

afterAll(async () => {
  const {
    redisConnection,
  } = require("../src/config/redis");

  const {
    prisma,
  } = require("../src/config/db");

  const queueDirectory = `${path.sep}src${path.sep}queues${path.sep}`;
  const queues = Object.values(require.cache)
    .filter((module) => module.filename.includes(queueDirectory))
    .flatMap((module) => Object.values(module.exports))
    .filter((value) => value && typeof value.close === "function");

  await Promise.allSettled(
    queues.map((queue) => queue.close())
  );

  await Promise.allSettled([
    redisConnection.disconnect(),
    prisma.$disconnect(),
  ]);
});