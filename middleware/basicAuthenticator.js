
import _ from 'lodash';
import db from "../dbSetup.js";
import bcrypt from "bcryptjs";
import logger from "../configs/logger.config.js";

export default async (req,res,next)=>{
    
    const authHeader= req.headers.authorization;
    
    if(_.isEmpty(authHeader)){
        //Authentication header is missing
        res.setHeader('WWW-Authenticate', 'Basic');
        logger.warn("You are not authorized user");
        return res.status(403).json({error:"You are not authorized user"});
    }   
    const [username,password]= new Buffer.from(authHeader.split(' ')[1],
    'base64').toString().split(':');


    if(!_.isEmpty(username) && !_.isEmpty(password)){
        try{
            let authUser=await db.users.findOne({ where:{
                email:username,
            }});
             const isMatch= await bcrypt.compare(password,authUser?.password);
            if(!isMatch){
                res.setHeader('WWW-Authenticate', 'Basic');
                logger.warn("You are not authorized user");
                return res.status(401).json({error:"You are not authorized user"});
            }
            req.authUser=authUser.dataValues;
            delete req.authUser?.password;
        }catch(err){
            logger.warn("You are not authorized user");
            return res.status(401).json({error:"You are not authorized user"});
        }      
    }else{
         //Authentication header is missing
         res.setHeader('WWW-Authenticate', 'Basic');
         logger.warn("You are not authorized user");
         return res.status(403).json({error:"You are not authorized user"});
    }
    next();
}