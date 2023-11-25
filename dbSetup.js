import userModel from './models/users.js';
import assignmentsModel from "./models/assignments.js";
import submissionModel from './models/submissions.js';

import sequelize from "./sequelize.js";
import { Sequelize, DataTypes } from "sequelize";
import insertDataFromCSV from "./csv-parser.js";
import logger from "./configs/logger.config.js";


sequelize.authenticate().then(()=>{
    console.log("Connected to the database")
}).catch(err=>{
    console.error("Error while connecting to the db", err)
    logger.error("Error while connecting to the db", err)
})

const db={};
db.Sequelize= Sequelize
db.sequelize=sequelize;
db.users= userModel(sequelize,DataTypes)
db.assignments = assignmentsModel(sequelize,DataTypes)
db.submissions = submissionModel(sequelize,DataTypes)

db.users.hasMany(db.assignments,{foreignKey:{name :"user_id"},onDelete:"CASCADE",field:"user_id",allowNull:false})
// db.users.hasMany(db.submissions,{foreignKey:{name :"user_id"},onDelete:"CASCADE",field:"user_id",allowNull:false})
db.assignments.hasMany(db.submissions,{foreignKey:{name :"assignment_id"},onDelete:"CASCADE",field:"assignment_id",allowNull:false})

db.sequelize.sync({force:true}).then(()=>{
    console.log("yes re-sync done!")
    logger.info("yes re-sync done!")
    insertDataFromCSV()
});


export default db;


