require("dotenv").config({
  path: ".env.test",
  override: true,
});

const request = require("supertest");
const app = require("../src/app");

describe("CSRF Authentication Flow", () => {
  test("should generate CSRF token", async () => {
    const agent = request.agent(app);

    const response = await agent
      .get("/api/auth/csrf-token");

    console.log(
      "\n========== CSRF RESPONSE =========="
    );

    console.log(
      "Status:",
      response.statusCode
    );

    console.log(
      "Body:",
      response.body
    );

    console.log(
      "Set-Cookie:",
      response.headers["set-cookie"]
    );

    console.log(
      "====================================\n"
    );

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

   expect(
  response.body.data.csrfToken
).toBeDefined();
  });

  test("should login with valid CSRF token", async () => {
    const agent = request.agent(app);

    // ========================================
    // GET CSRF
    // ========================================

    const csrfResponse = await agent
      .get("/api/auth/csrf-token");

    expect(csrfResponse.statusCode).toBe(200);

    const csrfToken =
  csrfResponse.body.data.csrfToken;

    expect(csrfToken).toBeDefined();

    // ========================================
    // LOGIN
    // ========================================

    const loginResponse = await agent
      .post("/api/auth/login")
      .set(
        "X-CSRF-Token",
        csrfToken
      )
      .send({
        email:
          process.env.TEST_USER_EMAIL,

        password:
          process.env.TEST_USER_PASSWORD,
      });

    console.log(
      "\n========== LOGIN RESPONSE =========="
    );

    console.log(
      "Status:",
      loginResponse.statusCode
    );

    console.log(
      "Body:",
      loginResponse.body
    );

    console.log(
      "====================================\n"
    );

    expect(loginResponse.statusCode).toBe(200);
  });

  test("should reject login without CSRF token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email:
          process.env.TEST_USER_EMAIL,

        password:
          process.env.TEST_USER_PASSWORD,
      });

    expect(response.statusCode).toBe(403);
  });
});