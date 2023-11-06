import sequelize from "../sequelize.js";
import logger from "../configs/logger.config.js";
import StatsD from 'node-statsd';

const statsd = new StatsD({ host: 'localhost', port: 8125 }); // Adjust the host and port as needed

const checkHealth = async (req, res) => {
  if (req.method !== 'GET'){
    logger.warn('Method not allowed');
    return res.status(405).send();
  }
  const length = req.headers['content-length'];
  if ((req.method === 'GET' && length > 0) || req.url.includes('?')) {
    logger.error('Bad Request on health check');
    res.status(400).send();
  }
   else {
    try {
      await sequelize.authenticate();
      logger.info('Health check successful');
      statsd.increment('endpoint.health')
      res.set('Cache-control', 'no-cache');
      res.status(200).send();
    } catch (error) {
      logger.fatal('Health check failed', error);
      res.status(503).send();
    }
  }
};

export default checkHealth;
