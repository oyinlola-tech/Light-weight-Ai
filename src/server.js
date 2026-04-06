const app = require("./app");
const config = require("./config");
const { initDb } = require("./db");

if (config.enableDb) {
  initDb();
}

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
