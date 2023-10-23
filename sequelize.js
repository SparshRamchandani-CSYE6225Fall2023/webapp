import dbConfigs from "./config/dbConfig.js";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isAwsRDS =
  process.env.PGHOST && process.env.PGHOST.includes(".rds.amazonaws.com");
const sequelizeConfig = {
  dialect: "postgres",
  host: process.env.PGHOST,
};

if (isAwsRDS) {
  sequelizeConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  sequelizeConfig
);

export default sequelize;
