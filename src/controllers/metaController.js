const pkg = require("../../package.json");

function metaHandler(req, res) {
  res.json({
    name: pkg.name,
    version: pkg.version,
    description: pkg.description
  });
}

module.exports = {
  metaHandler
};
