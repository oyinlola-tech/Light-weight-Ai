const express = require("express");
const path = require("path");
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
const { getSwaggerSpec } = require("./docs/swagger");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"]
      }
    }
  })
);
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimiter);

app.use(express.static(path.join(process.cwd(), "public")));

const pageRoutes = {
  "/": "index.html",
  "/chat": "chat.html",
  "/summarize": "summarize.html",
  "/generate": "generate.html",
  "/models": "models.html",
  "/settings": "settings.html"
};

Object.entries(pageRoutes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", file));
  });
});

app.use("/api/health", healthRoutes);
app.use("/api", metaRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/docs.json", async (req, res, next) => {
  try {
    const spec = await getSwaggerSpec();
    res.json(spec);
  } catch (error) {
    next(error);
  }
});

app.use("/api/docs", helmet({ contentSecurityPolicy: false }));
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: {
      url: "/api/docs.json"
    }
  })
);

app.use(errorHandler);

module.exports = app;
