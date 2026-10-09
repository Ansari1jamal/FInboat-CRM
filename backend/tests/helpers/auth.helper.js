const request = require("supertest");

const app = require("../../src/app");

// ========================================
// GET CSRF TOKEN
// ========================================

const getCsrfToken = async () => {
  const response = await request(app)
    .get("/api/auth/csrf-token");

  if (response.statusCode !== 200) {
    throw new Error(
      `Failed to get CSRF token. Status: ${response.statusCode}`
    );
  }

  const csrfToken =
    response.body?.csrfToken ||
    response.body?.data?.csrfToken ||
    response.body?.token;

  if (!csrfToken) {
    throw new Error(
      "CSRF token was not returned by /api/auth/csrf-token"
    );
  }

  return {
    csrfToken,
    cookies: response.headers["set-cookie"] || [],
  };
};

// ========================================
// LOGIN
// ========================================

const login = async ({
  email,
  password,
}) => {
  // --------------------------------------
  // GET CSRF TOKEN FIRST
  // --------------------------------------

  const {
    csrfToken,
    cookies,
  } = await getCsrfToken();

  // --------------------------------------
  // LOGIN REQUEST
  // --------------------------------------

  const response = await request(app)
    .post("/api/auth/login")
    .set("Cookie", cookies)
    .set("X-CSRF-Token", csrfToken)
    .send({
      email,
      password,
    });

  return response;
};

// ========================================
// TEST USER LOGIN
// ========================================

const loginTestUser = async () => {
  const email =
    process.env.TEST_USER_EMAIL;

  const password =
    process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD must be defined in .env.test"
    );
  }

  return login({
    email,
    password,
  });
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  getCsrfToken,
  login,
  loginTestUser,
};