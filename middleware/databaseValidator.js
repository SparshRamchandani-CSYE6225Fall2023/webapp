import db from "../dbSetup.js";
import logger from "../configs/logger.config.js";

export default async (req,res,next)=>{
    try{
        await db.sequelize.authenticate();
        next();
    }catch(err){
        console.log(err);
        logger.fatal("Health check failed",err);
        return res.status(503).send();
    }
}