const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const config = require("./config");
const rateLimiter = require("./middleware/rateLimit");
const errorHandler = require("./middleware/errorHandler");
const aiRoutes = require("./routes/aiRoutes");
const healthRoutes = require("./routes/healthRoutes");
const metaRoutes = require("./routes/metaRoutes");
const swaggerSpec = require("./docs/swagger");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimiter);

app.use("/api/health", healthRoutes);
app.use("/api", metaRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;
