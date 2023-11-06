import express from 'express';
import appRoute from './routes/app.route.js';
import assignmentRoute from './routes/assignment.route.js';
import logger from './configs/logger.config.js';
import StatsD from 'node-statsd';

const statsd = new StatsD({ host: 'localhost', port: 8125 }); // Adjust the host and port as needed

const app=express();
const PORT= process.env.PORT || 3000;
app.use(express.json());
app.use("/healthz",appRoute);
app.use("/v1/assignments", assignmentRoute);
// app.use("/",(req,res)=>res.status(503).send())
app.listen(PORT,(err)=>{
    logger.info("logs from app.js");
    if(err){
        console.log("Failed to start the application")
    }else{
        console.log("Application running on port number ",PORT);
    }
})

// default route 
app.get('/', function(req, res){
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
  });

statsd.increment('app.start');
