import { utils } from "../../../../shared/index.js";
const { loadEnv } = utils;

// Load centralized environment variables
loadEnv();

const requiredEnv = ["DATABASE"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
});

export const ENV = {
  PORT: process.env.GITHUB_PORT || process.env.PORT || 5008,
  DATABASE: process.env.DATABASE,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
  GITHUB_USERNAME: process.env.GITHUB_USERNAME || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  SERVICE_NAME: process.env.SERVICE_NAME || "github-service",
};
