const path = require("path");
const dotenv = require("dotenv");

const envTestPath = path.resolve(
  __dirname,
  "../.env.test"
);

console.log("========================================");
console.log("JEST SETUP");
console.log(".env.test path:");
console.log(envTestPath);
console.log("========================================");

const result = dotenv.config({
  path: envTestPath,
  override: true,
});

if (result.error) {
  throw new Error(
    `.env.test could not be loaded from:\n${envTestPath}\n\n${result.error.message}`
  );
}

console.log(
  "TEST_USER_PASSWORD:",
  process.env.TEST_USER_PASSWORD
    ? "LOADED"
    : "MISSING"
);

if (!process.env.TEST_USER_EMAIL) {
  throw new Error(
    "TEST_USER_EMAIL is missing from .env.test"
  );
}

if (!process.env.TEST_USER_PASSWORD) {
  throw new Error(
    "TEST_USER_PASSWORD is missing from .env.test"
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