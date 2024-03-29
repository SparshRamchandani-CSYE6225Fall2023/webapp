import { Router } from "express";
import _ from "lodash";
import aws from "aws-sdk";
import dotenv from 'dotenv';

import basicAuthenticator from "../middleware/basicAuthenticator.js";
import db from "../dbSetup.js";
import assignmentValidator from "../validators/assignment.validator.js";
import queryParameterValidators from "../validators/queryParameterValidators.js";
import submissionUrlValidator from "../validators/submissionUrlValidator.js";
import logger from "../configs/logger.config.js";

dotenv.config();

const assignmentRouter = Router();
const assignmentDb = db.assignments;
aws.config.update({ region: process.env.AWS_REGION });
const sns = new aws.SNS();

assignmentRouter.use("/", async (req, res, next) => {
  if (
    req.method !== "GET" &&
    req.method !== "POST" &&
    req.method !== "DELETE" &&
    req.method !== "PUT"
  ) {
    logger.warn("Method not allowed");
    return res.status(405).send();
  }
  next();
});

assignmentRouter.use("/:id/submissions", async (req, res, next) => {
  if (req.method !== "POST") {
    logger.warn("Method not allowed");
    return res.status(405).send();
  }
  next();
}
);

assignmentRouter.get(
  "/",
  basicAuthenticator,
  queryParameterValidators,
  async (req, res) => {
    // statsd.increment("endpoint.getAllAssignment");
    const assignmentList = await assignmentDb.findAll({
      attributes: { exclude: ["user_id"] },
    });
    logger.info("Assignment list is ", assignmentList);
    res.status(200).json(assignmentList);
  }
);

assignmentRouter.get(
  "/:id",
  basicAuthenticator,
  queryParameterValidators,
  async (req, res) => {
    const { id: assignmentId } = req.params;
    // statsd.increment("endpoint.getAssignmentById");
    try {
      const assignmentInfo = await db.assignments.findOne({
        attributes: { exclude: ["user_id"] },
        where: { assignment_id: assignmentId },
      });
      if (_.isEmpty(assignmentInfo)) {
        logger.error(
          "Assignment with the following id not found",
          assignmentId
        );
        return res.status(404).send();
      } else {
        logger.info("Assignment with the following id found", assignmentInfo);
        return res.status(200).json(assignmentInfo);
      }
    } catch (err) {
      logger.error("Assignment with the following id not found", assignmentId);
      res.status(404).send();
    }
  }
);

assignmentRouter.post(
  "/",
  basicAuthenticator,
  queryParameterValidators,
  async (req, res) => {
    let { name, points, num_of_attemps, deadline } = req.body;
    if(!_.isInteger(points) || !_.isInteger(num_of_attemps)){
      logger.error("Invalid request body");
      return res.status(400).json({ error : "Points and Number of Attempts should be Integer" });
    }
    const expectedKeys = ["name", "points", "num_of_attemps", "deadline"];
    // Check if there are any extra keys in the request body
    const extraKeys = Object.keys(req.body).filter(
      (key) => !expectedKeys.includes(key)
    );

    if (extraKeys.length > 0) {
      logger.error("Invalid keys in the request", extraKeys);
      return res.status(400).json({
        errorMessage: `Invalid keys in the request: ${extraKeys.join(", ")}`,
      });
    }
   

    const { isError: isNotValid, errorMessage } =
      assignmentValidator.validatePostRequest(req);
    if (isNotValid) {
      logger.error("Invalid request body", errorMessage);
      return res.status(400).json({ errorMessage });
    }

    const tempAssignment = {
      name,
      points,
      num_of_attemps,
      deadline,
      user_id: req?.authUser?.user_id,
    };
    //insert the data to data base
    const newAssignment = await assignmentDb.create(tempAssignment);
    logger.info("New assignment created", newAssignment);
    delete newAssignment.dataValues.user_id;
    res.status(201).json(newAssignment);
  }
);

assignmentRouter.post(
  "/:id/submissions",
  basicAuthenticator,
  queryParameterValidators,
  async (req, res) => {
    const expectedKeys = ["submission_url"];
    // Check if there are any extra keys in the request body
    const extraKeys = Object.keys(req.body).filter(
      (key) => !expectedKeys.includes(key)
    );

    if (extraKeys.length > 0) {
      logger.error("Invalid keys in the request", extraKeys);
      return res.status(400).json({
        errorMessage: `Invalid keys in the request: ${extraKeys.join(", ")}`,
      });
    }
    const { id: assignmentId } = req.params;
    const { isError: isNotValid, errorMessage } =
      assignmentValidator.validateAssignmentPostRequest(req);
    if (isNotValid) {
      logger.error("Invalid request body", errorMessage);
      return res.status(400).json({ errorMessage });
    }
    const { submission_url } = req.body;
    if (!submissionUrlValidator(submission_url)) {
      logger.error("Invalid Submission URL");
      return res.status(400).json({ errorMessage: "Invalid Submission URL" });
    }
    try {
      const assignmentInfo = await db.assignments.findOne({
        where: { assignment_id: assignmentId },
      });
      const count = await db.submissions.count({
        where: {
          assignment_id: assignmentId,
          user_id: req?.authUser?.user_id,
         }, 
      });

      if (_.isEmpty(assignmentInfo)) {
        logger.error("Assignment with the follwing id not found", assignmentId);
        return res.status(404).send();
      } 
      // else if (assignmentInfo.user_id !== req?.authUser?.user_id) {
      //   logger.warn("Your are not authorized user");
      //   return res.status(403).json({ error: "Your are not authorized user" });  
      // }
      else if(assignmentInfo.deadline < new Date()){
        logger.warn("Assignment deadline is over");
        return res.status(400).json({ error: "Assignment deadline is over" });
      }else if(count >= assignmentInfo.num_of_attemps){
        logger.warn("You have reached the maximum number of attempts");
        return res.status(400).json({ error: "You have reached the maximum number of attempts" });
      }

      const tempSubmission = {
        submission_url,
        assignment_id: assignmentId,
        user_id: req?.authUser?.user_id,
      };
      //insert the data to data base
      const newSubmission = await db.submissions.create(tempSubmission);
      logger.info("New submission created", newSubmission);
       // Post the URL to the SNS topic along with user info
       const snsTopicArn = process.env.SNSTopicARN; // Replace with your actual SNS topic ARN
       const snsMessage = {
         submission_url: newSubmission.submission_url,
         user_email: req?.authUser?.email,
         assignment_id: newSubmission.assignment_id,
         user_id: req?.authUser?.user_id,
       };
 
       const snsParams = {
         TopicArn: snsTopicArn,
         Message: JSON.stringify(snsMessage),
       };
 
       sns.publish(snsParams, (snsError, snsData) => {
         if (snsError) {
           logger.error("Error publishing to SNS:", snsError);
         } else {
           logger.info("Message published to SNS:", snsData);
         }
       });
      delete newSubmission.dataValues.user_id;
      res.status(201).json(newSubmission);
    } catch (err) {
      logger.error("Assignment with the following id not found", err);
      console.log(err);
      res.status(404).send();
    }
  }
)
  

assignmentRouter.delete(
  "/:id",
  basicAuthenticator,
  queryParameterValidators,
  async (req, res) => {
    const length = req.headers["content-length"];
    if ((req.method === "DELETE" && length > 0)) {
      logger.error("Bad Request on health check, Query parameters not allowed");
      return res.status(400).send();
    }
    const { id: assignmentId } = req.params;
    try {
      const assignmentInfo = await db.assignments.findOne({
        where: { assignment_id: assignmentId },
      });

      if (_.isEmpty(assignmentInfo)) {
        logger.error("Assignment with the follwing id not found", assignmentId);
        return res.status(404).send();
      } else if (assignmentInfo.user_id !== req?.authUser?.user_id) {
        logger.warn("Your are not authorized user");
        return res.status(403).json({ error: "Your are not authorized user" });
      }

      await db.assignments.destroy({ where: { assignment_id: assignmentId } });
      logger.info("Assignment deleted with the following id", assignmentId);
      return res.status(204).json();
    } catch (err) {
      logger.error("Assignment with the follwing id not found", assignmentId);
      res.status(404).send();
    }
  }
);

assignmentRouter.put("/:id", basicAuthenticator, async (req, res) => {
  let {  points, num_of_attemps } = req.body;
    if(!_.isInteger(points) || !_.isInteger(num_of_attemps)){
      logger.error("Invalid request body");
      return res.status(400).json({ error : "Points and Number of Attempts should be Integer" });
    }
  const { id: assignmentId } = req.params;
  const { isError: isNotValid, errorMessage } =
    assignmentValidator.validateUpdateRequest(req);
  // statsd.increment("endpoint.updateAssignment");
  if (isNotValid) {
    logger.error("Invalid request body", errorMessage);
    return res.status(400).json({ errorMessage });
  }
  try {
    const assignmentInfo = await db.assignments.findOne({
      where: { assignment_id: assignmentId },
    });

    if (_.isEmpty(assignmentInfo)) {
      logger.error("Assignment with the follwing id not found", assignmentId);
      return res.status(404).send();
    } else if (assignmentInfo.user_id !== req?.authUser?.user_id) {
      logger.warn("Your are not authorized user");
      return res.status(403).json({ error: "Your are not authorized user" });
    }

    const expectedKeys = ["name", "points", "num_of_attemps", "deadline"];

    // Check if there are any extra keys in the request body
    const extraKeys = Object.keys(req.body).filter(
      (key) => !expectedKeys.includes(key)
    );

    if (extraKeys.length > 0) {
      logger.error("Invalid keys in the request", extraKeys);
      return res.status(400).json({
        errorMessage: `Invalid keys in the request: ${extraKeys.join(", ")}`,
      });
    }

    const { name, points, num_of_attemps, deadline } = req.body;

    let updatedAssignment = {};
    updatedAssignment = appendDataToObject(updatedAssignment, "name", name);
    updatedAssignment = appendDataToObject(updatedAssignment, "points", points);
    updatedAssignment = appendDataToObject(
      updatedAssignment,
      "num_of_attemps",
      num_of_attemps
    );
    updatedAssignment = appendDataToObject(
      updatedAssignment,
      "deadline",
      deadline
    );

    await db.assignments.update(updatedAssignment, {
      where: { assignment_id: assignmentId },
    });
    logger.info("Assignment updated with the following id", assignmentId);
    return res.status(204).end(); //add success messgae
  } catch (err) {
    logger.error("Assignment with the following id not found", assignmentId);
    res.status(404).send();
  }

  // check Validation if the user is not entering the id itself
});

function appendDataToObject(object, field, value) {
  if (!_.isNil(value)) {
    object[field] = value;
  }
  return object;
}

export default assignmentRouter;
