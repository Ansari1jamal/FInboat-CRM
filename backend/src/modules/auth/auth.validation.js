
const { z } = require("zod");

// ========================================
// PASSWORD VALIDATION
// ========================================

const passwordSchema = z
  .string()
  .min(
    8,
    "Password must be at least 8 characters long"
  )
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter"
  )
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter"
  )
  .regex(
    /[0-9]/,
    "Password must contain at least one number"
  );

// ========================================
// REGISTER VALIDATION
// ========================================

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Name must be at least 2 characters long"
    ),

  email: z
    .string()
    .trim()
    .email(
      "Please provide a valid email address"
    )
    .toLowerCase(),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  password:
    passwordSchema,

  role: z
    .enum([
      "ADMIN",
      "MANAGER",
      "TL",
      "TELECALLER",
    ]),
});

// ========================================
// LOGIN VALIDATION
// ========================================

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email(
      "Please provide a valid email address"
    )
    .toLowerCase(),

  password: z
    .string()
    .min(
      1,
      "Password is required"
    ),
});

// ========================================
// REFRESH TOKEN VALIDATION
// ========================================
//
// Refresh token cookie se aata hai,
// body mein required nahi hai.
//

const refreshSchema =
  z.object({}).passthrough();

// ========================================
// LOGOUT VALIDATION
// ========================================
//
// Logout bhi refresh token cookie
// se handle hota hai.
//

const logoutSchema =
  z.object({}).passthrough();

// ========================================
// EXPORTS
// ========================================

module.exports = {
  passwordSchema,

  registerSchema,

  loginSchema,

  refreshSchema,

  logoutSchema,
};
