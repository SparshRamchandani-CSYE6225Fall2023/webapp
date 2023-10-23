import dbConfigs from "./config/dbConfig.js";
import { Sequelize } from "sequelize";

const isAwsRDS = process.env.PGHOST && process.env.PGHOST.includes('.rds.amazonaws.com');
const sequelizeConfig = {
    dialect: 'postgres', 
    host: process.env.DB_HOST,
  };

  if (isAwsRDS) {
    sequelizeConfig.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
  }

const sequelize= new Sequelize(
    dbConfigs.DB,
    dbConfigs.USER, 
    dbConfigs.PASSWORD,
    sequelizeConfig
);

export default sequelize;