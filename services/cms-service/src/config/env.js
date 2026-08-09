import { utils } from "../../../../shared/index.js";
const { loadEnv } = utils;

loadEnv();

export const ENV = {
  PORT: process.env.CMS_PORT || 5011,
  DATABASE: process.env.DATABASE,
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret",
  NODE_ENV: process.env.NODE_ENV || "development",
  SERVICE_NAME: "cms-service",
};
