const request = require("supertest");

const app = require("../src/app");
const { registerSchema } = require("../src/modules/auth/auth.validation");

describe("registration validation", () => {
  test("rejects roles outside the supported user-role enum", () => {
    const result = registerSchema.safeParse({
      name: "New User",
      email: "new-user@example.com",
      password: "StrongPassword123",
      role: "SUPERADMIN",
    });

    expect(result.success).toBe(false);
  });
});

// ========================================
// AUTHENTICATION TEST
// ========================================

describe("POST /api/auth/login", () => {
  test("should reject invalid credentials", async () => {
    // ======================================
    // GET CSRF TOKEN
    // ======================================

    const csrfResponse = await request(app)
      .get("/api/auth/csrf-token");

    expect(csrfResponse.statusCode).toBe(200);

    const csrfToken =
      csrfResponse.body?.csrfToken ||
      csrfResponse.body?.data?.csrfToken ||
      csrfResponse.body?.token;

    expect(csrfToken).toBeDefined();

    // ======================================
    // LOGIN WITH WRONG CREDENTIALS
    // ======================================

    const response = await request(app)
      .post("/api/auth/login")
      .set(
        "Cookie",
        csrfResponse.headers["set-cookie"] || []
      )
      .set(
        "X-CSRF-Token",
        csrfToken
      )
      .send({
        email: "wrong@example.com",
        password: "WrongPassword123",
      });

    // ======================================
    // ASSERTIONS
    // ======================================

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });
});

describe("POST /api/auth/register", () => {
  test("requires an authenticated admin", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "New User",
        email: "new-user@example.com",
        password: "StrongPassword123",
        role: "ADMIN",
      });

    expect(response.statusCode).toBe(401);
  });
});