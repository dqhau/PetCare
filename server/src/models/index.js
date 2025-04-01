import sequelize from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Sequelize from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};

// Load tất cả models tự động
const modelFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"));

for (const file of modelFiles) {
  const modelModule = await import(`file://${path.join(__dirname, file)}`);
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Thiết lập quan hệ giữa các models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export { sequelize };
export default db;
