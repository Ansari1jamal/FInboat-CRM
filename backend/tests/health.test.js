const request = require("supertest");

jest.mock("../src/utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const app = require("../src/app");
const logger = require("../src/utils/logger");

describe("Health Check API", () => {
  it("should return API running message", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "FinBoat CRM API is running",
    });
  });

  it("does not log query-string credentials for failed requests", async () => {
    const response = await request(app)
      .get("/api/leads?access_token=private-token")
      .set("X-Request-ID", "valid-request-id");

    expect(response.statusCode).toBe(401);

    const requestLog = logger.warn.mock.calls
      .map(([, context]) => context)
      .find((context) => context?.event === "http_request");

    expect(requestLog).toMatchObject({
      path: "/api/leads",
      statusCode: 401,
    });
    expect(
      JSON.stringify([
        logger.info.mock.calls,
        logger.warn.mock.calls,
        logger.error.mock.calls,
      ])
    )
      .not.toContain("private-token");
  });
});