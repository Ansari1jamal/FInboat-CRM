jest.mock("../src/utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../src/config/db", () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

jest.mock("../src/config/redis", () => ({
  redisConnection: {
    ping: jest.fn(),
    disconnect: jest.fn(),
  },
}));

jest.mock("../src/modules/health/queue.health", () => ({
  getQueueHealth: jest.fn(),
}));

const logger = require("../src/utils/logger");
const requestId = require("../src/middleware/requestId.middleware");
const errorHandler = require("../src/middleware/error.middleware");
const { readiness } = require("../src/modules/health/health.controller");
const { prisma } = require("../src/config/db");
const { redisConnection } = require("../src/config/redis");

describe("security-sensitive logging", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "production";
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("replaces request IDs containing unsafe characters", () => {
    const req = {
      headers: {
        "x-request-id": "bad\r\nInjected: true",
      },
    };
    const res = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();

    requestId(req, res, next);

    expect(req.requestId).toMatch(
      /^[0-9a-f-]{36}$/i
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "X-Request-ID",
      req.requestId
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("does not log query strings or raw production error details", () => {
    const secret = "private-password-value";
    const req = {
      requestId: "request-123",
      method: "GET",
      path: "/api/failure",
      originalUrl: `/api/failure?password=${secret}`,
      user: null,
    };
    const res = {
      status: jest.fn(function setStatus(statusCode) {
        this.statusCode = statusCode;
        return this;
      }),
      json: jest.fn(function sendJson(body) {
        this.body = body;
        return this;
      }),
    };
    const error = new Error(`Database failed for ${secret}`);

    errorHandler(error, req, res, jest.fn());

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error");
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(secret);
    expect(logger.error.mock.calls[0][1]).toMatchObject({
      path: "/api/failure",
      statusCode: 500,
    });
    expect(logger.error.mock.calls[0][1]).not.toHaveProperty("stack");
    expect(logger.error.mock.calls[0][1]).not.toHaveProperty("errorMessage");
  });

  it("does not expose dependency errors in production readiness responses", async () => {
    const secret = "private-database-value";
    prisma.$queryRaw.mockRejectedValueOnce(new Error(secret));
    redisConnection.ping.mockRejectedValueOnce(new Error(secret));

    const res = {
      status: jest.fn(function setStatus(statusCode) {
        this.statusCode = statusCode;
        return this;
      }),
      json: jest.fn(function sendJson(body) {
        this.body = body;
        return this;
      }),
    };

    await readiness({}, res);

    expect(res.statusCode).toBe(503);
    expect(res.body.data.database).toEqual({ status: "down" });
    expect(res.body.data.redis).toEqual({ status: "down" });
    expect(JSON.stringify(res.body)).not.toContain(secret);
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(secret);
  });
});
