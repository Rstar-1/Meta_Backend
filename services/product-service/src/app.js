import express from "express"
import { middleware, utils } from "../../../shared/index.js"

import path from "path"
import { fileURLToPath } from "url"
import mainRoutes from "./routes/index.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ================= GLOBAL MIDDLEWARE =================
utils.configureApp(app)

// ================= FILE STORAGE =================
const uploadDir = path.join(__dirname, "../uploads")
utils.ensureDir(uploadDir)

app.use("/uploads", express.static(uploadDir))

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "product-service",
    message: "Product Service is running 🚀"
  })
})

// ================= ROUTES =================
app.use("/api", mainRoutes)

// ================= GLOBAL ERROR HANDLER =================
app.use(middleware.errorMiddleware)

export default app
