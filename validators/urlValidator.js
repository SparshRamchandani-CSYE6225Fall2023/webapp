import logger from '../configs/logger.config.js';

const urlValidator = (req, res, next) => {
    if (!req.params || Object.keys(req.params).length > 0) {
        res.setHeader("Cache-Control", "no-store");
        logger.error("Query parameters are not allowed");
        return res.status(400).json({ message: "Assignmnet ID cannot be null" });
    }
    // Call the next middleware or route handler
    next();
}

export default urlValidator;
