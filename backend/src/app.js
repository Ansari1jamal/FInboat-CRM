const express = require("express");
const hpp = require("hpp");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// ========================================
// MONITORING MIDDLEWARE
// ========================================

const requestId =
  require("./middleware/requestId.middleware");

const requestLogger =
  require("./middleware/requestLogger.middleware");

// ========================================
// HEALTH ROUTES
// ========================================

const healthRoutes =
  require("./modules/health/health.routes");

// ========================================
// ROUTES
// ========================================

const authRoutes =
  require("./modules/auth/auth.routes");

const userRoutes =
  require("./modules/users/user.routes");

const teamRoutes =
  require("./modules/teams/team.routes");

const leadRoutes =
  require("./modules/leads/lead.routes");

const callRoutes =
  require("./modules/calls/call.routes");

const followupRoutes =
  require("./modules/followups/followup.routes");

const documentRoutes =
  require("./modules/documents/document.routes");

const reportRoutes =
  require("./modules/reports/report.routes");

const targetRoutes =
  require("./modules/targets/target.routes");

const notificationRoutes =
  require("./modules/notifications/notification.routes");

const auditRoutes =
  require("./modules/audit/audit.routes");

const dashboardRoutes =
  require("./modules/dashboard/dashboard.routes");

const applicationRoutes =
  require("./modules/applications/application.routes");

const lenderRoutes =
  require("./modules/lenders/lender.routes");

const loanRoutes =
  require("./modules/loans/loan.routes");

const repaymentRoutes =
  require("./modules/repayments/repayment.routes");

const collectionRoutes =
  require("./modules/collections/collection.routes");

const masterDataRoutes =
  require("./modules/master-data/master-data.routes");

const searchRoutes =
  require("./modules/search/search.routes");

// ========================================
// ERROR MIDDLEWARE
// ========================================

const notFound =
  require("./middleware/not-Found.middleware");

const errorHandler =
  require("./middleware/error.middleware");

// ========================================
// RATE LIMITER
// ========================================

const {
  apiLimiter,
} =
  require("./middleware/rate-limit.middleware");

// ========================================
// SWAGGER
// ========================================

const {
  swaggerUi,
  swaggerDocument,
} =
  require("./config/swagger");

// ========================================
// APP
// ========================================

const app = express();

// ========================================
// TRUST PROXY
// ========================================
//
// Production mein Nginx / Load Balancer
// ke peeche application hone par
// forwarded information trust karenge.
//

if (
  process.env.NODE_ENV ===
  "production"
) {
  app.set(
    "trust proxy",
    1
  );
}

// ========================================
// REQUEST ID
// ========================================
//
// Har request ko unique ID milegi.
//

app.use(
  requestId
);

// ========================================
// REQUEST LOGGER
// ========================================
//
// Request ka method,
// URL,
// status,
// duration,
// requestId
// etc. log karega.
//

app.use(
  requestLogger
);

// ========================================
// SECURITY
// ========================================

// Express information hide karo
app.disable(
  "x-powered-by"
);

// Security headers
app.use(
  helmet()
);

// ========================================
// CORS
// ========================================

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",

    credentials: true,
  })
);

// ========================================
// COOKIE PARSER
// ========================================
//
// CSRF / refresh-token cookies
// ke liye required.
//

app.use(
  cookieParser()
);

// ========================================
// REQUEST BODY
// ========================================

// JSON body limit
app.use(
  express.json({
    limit: "1mb",
  })
);

// URL encoded body limit
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// ========================================
// HTTP PARAMETER POLLUTION
// ========================================

app.use(
  hpp()
);

// ========================================
// GLOBAL API RATE LIMIT
// ========================================

app.use(
  "/api",
  apiLimiter
);

// ========================================
// SWAGGER API DOCUMENTATION
// ========================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerDocument
  )
);

// ========================================
// HEALTH ROUTES
// ========================================

app.use(
  "/api",
  healthRoutes
);

// ========================================
// AUTH ROUTES
// ========================================

app.use(
  "/api/auth",
  authRoutes
);

// ========================================
// USER ROUTES
// ========================================

app.use(
  "/api/users",
  userRoutes
);

// ========================================
// TEAM ROUTES
// ========================================

app.use(
  "/api/teams",
  teamRoutes
);

// ========================================
// LEAD ROUTES
// ========================================

app.use(
  "/api/leads",
  leadRoutes
);

// ========================================
// CALL ROUTES
// ========================================

app.use(
  "/api/calls",
  callRoutes
);

// ========================================
// FOLLOW-UP ROUTES
// ========================================

app.use(
  "/api/followups",
  followupRoutes
);

// ========================================
// DOCUMENT ROUTES
// ========================================

app.use(
  "/api/documents",
  documentRoutes
);

// ========================================
// REPORT ROUTES
// ========================================

app.use(
  "/api/reports",
  reportRoutes
);

// ========================================
// TARGET ROUTES
// ========================================

app.use(
  "/api/targets",
  targetRoutes
);

// ========================================
// NOTIFICATION ROUTES
// ========================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// ========================================
// AUDIT ROUTES
// ========================================

app.use(
  "/api/audit-logs",
  auditRoutes
);

// ========================================
// DASHBOARD ROUTES
// ========================================

app.use(
  "/api/dashboard",
  dashboardRoutes
);

// ========================================
// APPLICATION ROUTES
// ========================================

app.use(
  "/api/applications",
  applicationRoutes
);

// ========================================
// LENDER ROUTES
// ========================================

app.use(
  "/api/lenders",
  lenderRoutes
);

// ========================================
// LOAN ROUTES
// ========================================

app.use(
  "/api/loans",
  loanRoutes
);

// ========================================
// REPAYMENT ROUTES
// ========================================

app.use(
  "/api",
  repaymentRoutes
);

// ========================================
// COLLECTION ROUTES
// ========================================

app.use(
  "/api",
  collectionRoutes
);

// ========================================
// MASTER DATA ROUTES
// ========================================

app.use(
  "/api/master-data",
  masterDataRoutes
);

// ========================================
// SEARCH ROUTES
// ========================================

app.use(
  "/api/search",
  searchRoutes
);

// ========================================
// 404 NOT FOUND
// ========================================
//
// IMPORTANT:
// Ye saare routes ke BAAD hona chahiye.
//

app.use(
  notFound
);

// ========================================
// GLOBAL ERROR HANDLER
// ========================================
//
// IMPORTANT:
// Ye application ka LAST middleware
// hona chahiye.
//

app.use(
  errorHandler
);

// ========================================
// EXPORT
// ========================================

module.exports = app;