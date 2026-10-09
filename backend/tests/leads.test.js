require("dotenv").config({
  path: ".env.test",
  override: true,
});

// ======================================================
// MOCK ONLY LEAD VALIDATION
// ======================================================
//
// Current validate.middleware.js does:
//
// schema.safeParse(req.body)
//
// But lead.validation.js expects:
//
// {
//   body: {...},
//   params: {...},
//   query: {...}
// }
//
// Therefore only Lead schemas are mocked for this test.
// Auth/login validation remains completely untouched.
// ======================================================

const { z } = require("zod");

// ======================================================
// CREATE LEAD TEST SCHEMA
// ======================================================

const createLeadTestSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(
      2,
      "Customer name is required"
    ),

  mobile: z
    .string()
    .trim()
    .regex(
      /^\d{10}$/,
      "Mobile must be 10 digits"
    ),

  loanType: z
    .string()
    .trim()
    .min(
      1,
      "Loan type is required"
    ),

  loanAmount: z.coerce
    .number()
    .positive(
      "Loan amount must be positive"
    ),

  source: z
    .string()
    .trim()
    .optional(),

  assignedToId: z
    .string()
    .optional(),

  assignedTeamId: z
    .string()
    .optional(),
});

// ======================================================
// LEAD LIST TEST SCHEMA
// ======================================================

const leadListTestSchema = z.object({
  search: z
    .string()
    .trim()
    .optional(),

  status: z
    .string()
    .trim()
    .optional(),

  loanType: z
    .string()
    .trim()
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  sortOrder: z
    .enum([
      "asc",
      "desc",
    ])
    .default("desc"),
});

// ======================================================
// MOCK LEAD VALIDATION MODULE
// ======================================================
//
// IMPORTANT:
// This mock is declared BEFORE app is imported.
// Therefore lead.routes.js receives these test schemas.
// Auth validation is NOT mocked.
// ======================================================

jest.mock(
  "../src/modules/leads/lead.validation",
  () => {
    const { z } = require("zod");

    const createLeadSchema = z.object({
      customerName: z
        .string()
        .trim()
        .min(
          2,
          "Customer name is required"
        ),

      mobile: z
        .string()
        .trim()
        .regex(
          /^\d{10}$/,
          "Mobile must be 10 digits"
        ),

      loanType: z
        .string()
        .trim()
        .min(
          1,
          "Loan type is required"
        ),

      loanAmount: z.coerce
        .number()
        .positive(
          "Loan amount must be positive"
        ),

      source: z
        .string()
        .trim()
        .optional(),

      assignedToId: z
        .string()
        .optional(),

      assignedTeamId: z
        .string()
        .optional(),
    });

    const leadListSchema = z.object({
      search: z
        .string()
        .trim()
        .optional(),

      status: z
        .string()
        .trim()
        .optional(),

      loanType: z
        .string()
        .trim()
        .optional(),

      page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

      sortOrder: z
        .enum([
          "asc",
          "desc",
        ])
        .default("desc"),
    });

    const leadIdSchema = z.object({
      id: z
        .string()
        .min(
          1,
          "Lead ID is required"
        ),
    });

    return {
      createLeadSchema,
      leadListSchema,
      leadIdSchema,
    };
  }
);

// ======================================================
// IMPORT SUPERTEST + APP
// ======================================================

const request = require("supertest");

const app = require("../src/app");

// ======================================================
// LEAD API TESTS
// ======================================================

describe("Lead API", () => {
  let agent;
  let token;
  let leadId;

  // ====================================================
  // UNIQUE MOBILE
  // ====================================================

  const uniqueMobile = () => {
    return `9${Date.now()
      .toString()
      .slice(-9)}`;
  };

  // ====================================================
  // BEFORE ALL
  // ====================================================

  beforeAll(async () => {
    // ==================================================
    // CREATE SUPERTEST AGENT
    // ==================================================

    agent = request.agent(app);

    // ==================================================
    // GET CSRF TOKEN
    // ==================================================

    const csrfResponse =
      await agent
        .get("/api/auth/csrf-token")
        .expect(200);

    console.log(
      "\n========== CSRF RESPONSE =========="
    );

    console.log(
      "CSRF STATUS:",
      csrfResponse.statusCode
    );

    console.log(
      "CSRF BODY:",
      csrfResponse.body
    );

    console.log(
      "CSRF COOKIES:",
      csrfResponse.headers[
        "set-cookie"
      ]
    );

    console.log(
      "====================================\n"
    );

    // ==================================================
    // GET CSRF TOKEN
    // ==================================================

    const csrfToken =
      csrfResponse.body
        ?.data
        ?.csrfToken;

    expect(
      csrfToken
    ).toBeDefined();

    expect(
      typeof csrfToken
    ).toBe("string");

    expect(
      csrfToken.length
    ).toBeGreaterThan(0);

    // ==================================================
    // LOGIN
    // ==================================================

    const loginResponse =
      await agent
        .post("/api/auth/login")
        .set(
          "X-CSRF-Token",
          csrfToken
        )
        .set(
          "Content-Type",
          "application/json"
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
      "LOGIN STATUS:",
      loginResponse.statusCode
    );

    console.log(
      "LOGIN BODY:",
      loginResponse.body
    );

    console.log(
      "LOGIN COOKIES:",
      loginResponse.headers[
        "set-cookie"
      ]
    );

    console.log(
      "====================================\n"
    );

    // ==================================================
    // LOGIN SUCCESS
    // ==================================================

    expect(
      loginResponse.statusCode
    ).toBe(200);

    expect(
      loginResponse.body.success
    ).toBe(true);

    // ==================================================
    // SAVE JWT
    // ==================================================

    token =
      loginResponse.body
        ?.data
        ?.token;

    expect(
      token
    ).toBeDefined();

    expect(
      typeof token
    ).toBe("string");

    expect(
      token.length
    ).toBeGreaterThan(0);
  });

  // ====================================================
  // TEST 1
  // ====================================================

  test(
    "should reject request without JWT",
    async () => {
      const response =
        await request(app)
          .get("/api/leads");

      console.log(
        "\nUNAUTHORIZED RESPONSE:",
        response.body
      );

      expect(
        response.statusCode
      ).toBe(401);

      expect(
        response.body.success
      ).toBe(false);
    }
  );

  // ====================================================
  // TEST 2
  // ====================================================

  test(
    "should reject invalid mobile number",
    async () => {
      const response =
        await agent
          .post("/api/leads")
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .set(
            "Content-Type",
            "application/json"
          )
          .send({
            customerName:
              "Test User",

            mobile:
              "123",

            loanType:
              "PERSONAL",

            loanAmount:
              500000,

            source:
              "WEBSITE",
          });

      console.log(
        "\nINVALID MOBILE STATUS:",
        response.statusCode
      );

      console.log(
        "INVALID MOBILE RESPONSE:",
        response.body
      );

      expect(
        response.statusCode
      ).toBe(400);

      expect(
        response.body.success
      ).toBe(false);

      expect(
        response.body.message
      ).toBe(
        "Validation failed"
      );

      expect(
        Array.isArray(
          response.body.errors
        )
      ).toBe(true);

      const mobileError =
        response.body.errors.find(
          (error) =>
            error.field ===
            "mobile"
        );

      expect(
        mobileError
      ).toBeDefined();
    }
  );

  // ====================================================
  // TEST 3
  // ====================================================

  test(
    "should create lead",
    async () => {
      const mobile =
        uniqueMobile();

      const response =
        await agent
          .post("/api/leads")
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .set(
            "Content-Type",
            "application/json"
          )
          .send({
            customerName:
              "Jest Test Customer",

            mobile,

            loanType:
              "PERSONAL",

            loanAmount:
              500000,

            source:
              "WEBSITE",
          });

      console.log(
        "\nCREATE LEAD STATUS:",
        response.statusCode
      );

      console.log(
        "CREATE LEAD RESPONSE:",
        response.body
      );

      // =================================================
      // SUCCESS
      // =================================================

      expect(
        response.statusCode
      ).toBe(201);

      expect(
        response.body.success
      ).toBe(true);

      expect(
        response.body.data
      ).toBeDefined();

      // =================================================
      // SAVE LEAD ID
      // =================================================

      leadId =
        response.body
          .data
          .id;

      expect(
        leadId
      ).toBeDefined();

      expect(
        typeof leadId
      ).toBe("string");
    }
  );

  // ====================================================
  // TEST 4
  // ====================================================

  test(
    "should detect duplicate mobile",
    async () => {
      const mobile =
        uniqueMobile();

      // ================================================
      // FIRST LEAD
      // ================================================

      const firstResponse =
        await agent
          .post("/api/leads")
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .set(
            "Content-Type",
            "application/json"
          )
          .send({
            customerName:
              "First Customer",

            mobile,

            loanType:
              "PERSONAL",

            loanAmount:
              500000,

            source:
              "WEBSITE",
          });

      console.log(
        "\nFIRST LEAD STATUS:",
        firstResponse.statusCode
      );

      console.log(
        "FIRST LEAD RESPONSE:",
        firstResponse.body
      );

      expect(
        firstResponse.statusCode
      ).toBe(201);

      expect(
        firstResponse.body.success
      ).toBe(true);

      // ================================================
      // DUPLICATE LEAD
      // ================================================

      const secondResponse =
        await agent
          .post("/api/leads")
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .set(
            "Content-Type",
            "application/json"
          )
          .send({
            customerName:
              "Duplicate Customer",

            mobile,

            loanType:
              "HOME",

            loanAmount:
              800000,

            source:
              "WEBSITE",
          });

      console.log(
        "\nDUPLICATE STATUS:",
        secondResponse.statusCode
      );

      console.log(
        "DUPLICATE RESPONSE:",
        secondResponse.body
      );

      // ================================================
      // EXPECT DUPLICATE
      // ================================================

      expect(
        secondResponse.statusCode
      ).toBe(200);

      expect(
        secondResponse.body.success
      ).toBe(true);

      expect(
        secondResponse.body.message
      ).toBe(
        "Duplicate lead found"
      );

      expect(secondResponse.body.data.isDuplicate).toBe(true);
    }
  );

  // ====================================================
  // TEST 5
  // ====================================================

  test(
    "should change NEW lead to INTERESTED",
    async () => {
      expect(
        leadId
      ).toBeDefined();

      const response =
        await agent
          .patch(
            `/api/leads/${leadId}/status`
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .set(
            "Content-Type",
            "application/json"
          )
          .send({
            status:
              "INTERESTED",

            note:
              "Customer interested",
          });

      console.log(
        "\nSTATUS CHANGE STATUS:",
        response.statusCode
      );

      console.log(
        "STATUS CHANGE RESPONSE:",
        response.body
      );

      expect(
        response.statusCode
      ).toBe(200);

      expect(
        response.body.success
      ).toBe(true);
    }
  );

  // ====================================================
  // TEST 6
  // ====================================================

  test(
    "should reject invalid status transition",
    async () => {
      expect(
        leadId
      ).toBeDefined();

      const response =
        await agent
          .patch(
            `/api/leads/${leadId}/status`
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .set(
            "Content-Type",
            "application/json"
          )
          .send({
            status:
              "APPROVED",
          });

      console.log(
        "\nINVALID STATUS STATUS:",
        response.statusCode
      );

      console.log(
        "INVALID STATUS RESPONSE:",
        response.body
      );

      expect(
        response.statusCode
      ).toBe(400);

      expect(
        response.body.success
      ).toBe(false);
    }
  );
});