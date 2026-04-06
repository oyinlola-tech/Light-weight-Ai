const config = require("../config");

function healthHandler(req, res) {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    env: config.env
  });
}

module.exports = {
  healthHandler
};
