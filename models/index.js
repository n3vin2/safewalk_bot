import { readdirSync } from "fs";
import { basename as _basename, dirname, join } from "path";
import { Sequelize, DataTypes } from "sequelize";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import configFile from "../config/config.json" with { type: "json" };

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basename = _basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configFile[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const modelFiles = readdirSync(__dirname).filter(
  file => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
);

for (const file of modelFiles) {
  const model = (await import(join(__dirname, file))).default(sequelize, DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;