const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const swaggerDocument =
  typeof __FINBOAT_SWAGGER_DOCUMENT__ === "undefined"
    ? YAML.load(
        path.join(__dirname, "../docs/swagger.yaml")
      )
    : __FINBOAT_SWAGGER_DOCUMENT__;

module.exports = {
  swaggerUi,
  swaggerDocument,
};