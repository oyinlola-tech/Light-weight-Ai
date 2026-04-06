const swaggerJsdocImport = require("swagger-jsdoc");
const swaggerJsdoc =
  typeof swaggerJsdocImport === "function"
    ? swaggerJsdocImport
    : swaggerJsdocImport.default;
const config = require("../config");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Simple AI Integration API",
      version: "1.0.0",
      description: "REST API for interacting with a lightweight open-source AI model."
    },
    servers: [
      {
        url: `http://localhost:${config.port}`
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key"
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);
