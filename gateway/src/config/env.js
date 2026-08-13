import { utils } from "../../../shared/index.js";
const { loadEnv } = utils;

// Load centralized environment variables
loadEnv();

export const env = {
  PORT: Number(process.env.GATEWAY_PORT) || Number(process.env.PORT) || 3000,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://localhost:8080",
  USER_SERVICE_URL: process.env.USER_SERVICE_URL || "http://localhost:8082",
  PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL || "http://localhost:8083",
  CART_SERVICE_URL: process.env.CART_SERVICE_URL || "http://localhost:5004",
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL || "http://localhost:5005",
  PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL || "http://localhost:5006",
  ROLE_SERVICE_URL: process.env.ROLE_SERVICE_URL || "http://localhost:5007",
  SEO_SERVICE_URL: process.env.SEO_SERVICE_URL || "http://localhost:5008",
  LEAD_SERVICE_URL: process.env.LEAD_SERVICE_URL || "http://localhost:5009",
  BLOG_SERVICE_URL: process.env.BLOG_SERVICE_URL || "http://localhost:5010",
  CMS_SERVICE_URL: process.env.CMS_SERVICE_URL || "http://localhost:5011",
  DASHBOARD_SERVICE_URL: process.env.DASHBOARD_SERVICE_URL || "http://127.0.0.1:5012",
  ANALYTIC_SERVICE_URL: process.env.ANALYTIC_SERVICE_URL || "http://127.0.0.1:5013",
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,

  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100
};