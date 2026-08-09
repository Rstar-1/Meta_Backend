import app from "./src/app.js";
import { env } from "./src/config/env.js";

// Rate limiter updated
app.listen(env.PORT, () => {
  console.log(`[GATEWAY] Running on port ${env.PORT}`);
});