# Assignment: Building Custom Machine Images using Pulumi and Packer

## Learning Objectives

The objective of this assignment is to build custom machine images that can be utilized to create virtual machines in the cloud using Pulumi for Infrastructure as Code.

## Packer & AMIs - Building Custom Application AMI using Packer

To complete this assignment, follow the steps outlined below:

1. Use Debian 12 as your source image to create a custom AMI using Packer.
2. Ensure that all AMIs you build are private. This means that only you can deploy EC2 instances from them.
3. All AMI builds should occur in your DEV AWS account and be shared with your DEMO account.
4. Configure the AMI builds to operate in your default VPC.
5. Include everything necessary to run your application and the application binary itself in the AMI. For instance, if you are using Tomcat to run your Java web application, your AMI must have Java & Tomcat installed. Additionally, ensure that the Tomcat service will start up when an instance is launched. If you are using Python, make sure you have the correct version of Python and the necessary libraries installed in the AMI.
6. Store the Packer template in the same repository as the web application.
7. Install MySQL/MariaDB/PostgreSQL locally in the AMI specifically for this assignment.

Please ensure that your Packer template and the steps you follow adhere to the guidelines mentioned above.

Please feel free to reach out for any clarifications or assistance.

## Additional Notes

Make sure to document any challenges faced and the solutions implemented while completing this assignment. This documentation will be helpful for both your understanding and for potential future references.

### Further Assistance

If you encounter any issues or need additional guidance, please don't hesitate to ask for help. Use the resources available to you, including the Pulumi documentation, AWS documentation, and any other relevant resources you find useful.

# Packer Continuous Integration - GitHub Actions Workflow for Status Check

## Objective

The objective of this GitHub Actions workflow is to ensure that all Packer templates undergo essential checks before they are merged into the main branch. These checks will help maintain consistency and prevent potential issues from being introduced into the repository.

## Workflow Details

When a pull request is raised, this GitHub Actions workflow will perform the following actions:

1. **Run `packer fmt` Command:** This command ensures that the Packer template is formatted correctly. If the `packer fmt` command modifies the Packer template, the workflow will fail, preventing users from merging the pull request.

2. **Run `packer validate` Command:** This command validates the Packer template. If the template fails to validate, the workflow will fail, preventing users from merging the pull request.

## Setting Up the Workflow

To implement this workflow in your project, follow the steps outlined below:

1. Create a new GitHub Actions workflow YAML file in the `.github/workflows` directory in your repository.

2. Define the necessary steps in the workflow YAML file to execute the `packer fmt` and `packer validate` commands.

3. Configure the workflow to trigger upon pull request creation.

4. Ensure that the necessary dependencies and environment are set up for the commands to run successfully.

5. Test the workflow with various scenarios to verify its effectiveness in catching potential issues in the Packer templates.

## Workflow Customization

Feel free to customize this workflow according to your project's specific requirements. You can add additional steps or commands to perform other checks or validations on the Packer templates.

## Further Assistance

If you encounter any difficulties while setting up or customizing this GitHub Actions workflow, don't hesitate to seek help from the GitHub Actions documentation or the community forums.

# Packer Continuous Integration - GitHub Actions Workflow for Building Packer AMI

## Objective

The objective of this GitHub Actions workflow is to automate the building of a Packer AMI, including the integration test, application artifact creation, and setup of the application within the AMI. This workflow ensures that the AMI is only built and shared with the DEMO account upon successful merging of a pull request.

## Workflow Details

When a pull request is merged, this GitHub Actions workflow will execute the following actions:

1. **Run Integration Test:** Execute the integration test to ensure the functionality and integrity of the application.

2. **Build Application Artifact:** Build the application artifact (e.g., war, jar, zip) on the GitHub Actions runner itself, ensuring that the artifact is not built within the AMI.

3. **Build the AMI with Application Dependencies:** Create the AMI with the necessary application dependencies and set up the application by copying the application artifacts and configuration files.

4. **Share the AMI with DEMO Account:** Ensure that the built AMI is shared with the DEMO account for further testing and deployment purposes.

5. **Fail-Safe Mechanism:** If any of the jobs or steps in the workflow fail, prevent the creation of the AMI to maintain the integrity of the build process.

## Workflow Configuration

To implement this workflow in your project, follow the steps outlined below:

1. Create a new GitHub Actions workflow YAML file in the `.github/workflows` directory in your repository.

2. Define the necessary steps in the workflow YAML file to execute the integration test, build the application artifact, and build the Packer AMI.

3. Configure the workflow to trigger upon the successful merge of a pull request.

4. Ensure that the IAM user and custom policy are set up correctly in the DEV AWS account, as specified in the setup instructions.

5. Test the workflow thoroughly to confirm the successful execution of each step and the sharing of the AMI with the DEMO account.

## Workflow Customization

Feel free to customize this workflow according to your project's specific requirements. You can add additional steps or commands to perform other tasks or checks as necessary.

## Further Assistance

If you encounter any difficulties while setting up or customizing this GitHub Actions workflow, please refer to the GitHub Actions documentation or reach out to the community for support.

# Infrastructure as Code with Pulumi

## Assignment Objective

In this assignment, the aim is to update the Pulumi IaC code to include the following resources:

### Application Security Group

Create an EC2 security group that will be utilized for hosting web applications on your EC2 instances. This security group will be referred to as the application security group. The following configurations should be applied to this security group:

- **Ingress Rule Setup:** Allow TCP traffic on the following ports:
    - Port 22 (SSH)
    - Port 80 (HTTP)
    - Port 443 (HTTPS)
    - The specific port on which your application runs
- **Access Permissions:** Allow this traffic from anywhere in the world.

## Steps to Implement

To complete this assignment, follow the steps outlined below:

1. Update your existing Pulumi infrastructure code to incorporate the creation of the application security group.

2. Configure the security group to allow inbound traffic on the specified ports as mentioned above.

3. Ensure that the security group is appropriately associated with your EC2 instances hosting the web applications.

4. Test the infrastructure deployment to verify that the security group is correctly configured and effectively restricting the traffic to the specified ports.

## Best Practices

Consider the following best practices while implementing the changes:

- **Security Best Practices:** Implement security best practices when configuring the application security group to ensure that the EC2 instances are secure and protected from unauthorized access.

- **Documentation:** Document the changes made in the Pulumi code for future reference and maintain a clear understanding of the implemented configurations.

- **Error Handling:** Implement proper error handling and logging mechanisms to identify any issues that might arise during the deployment process.

## Further Assistance

If you encounter any issues or require further guidance while updating the Pulumi IaC code, refer to the Pulumi documentation or seek assistance from the Pulumi community and support channels.

# EC2 Instance Deployment with Pulumi

## Assignment Objective

In this assignment, you are tasked with creating an EC2 instance based on the following specifications. The EC2 instance must be launched within the VPC previously created by your Pulumi Infrastructure as Code (IaC) configuration. Note that the instance should not be launched in the default VPC.

### EC2 Instance Specifications

- **Instance Type:** Choose an appropriate instance type based on your application requirements.
- **Security Group:** Attach the application security group, as specified in the previous assignment, to this EC2 instance.
- **EBS Volumes:** Configure the EBS volumes to be terminated when the EC2 instance is terminated.

## Steps to Implement

To complete this assignment, follow the steps outlined below:

1. Update your existing Pulumi infrastructure code to include the creation of the EC2 instance with the provided specifications.

2. Ensure that the EC2 instance is correctly associated with the VPC created by your Pulumi IaC code and not the default VPC.

3. Attach the previously created application security group to the EC2 instance.

4. Configure the EBS volumes to be terminated when the EC2 instance is terminated.

5. Test the infrastructure deployment to verify that the EC2 instance is functioning correctly and that the specified configurations are in place.

## Best Practices

Consider the following best practices while implementing the EC2 instance deployment:

- **Instance Management:** Implement proper instance management practices to ensure efficient usage and cost optimization.

- **Security Compliance:** Ensure that the EC2 instance adheres to necessary security compliance standards, considering the sensitive nature of the application.

- **Monitoring and Logging:** Set up appropriate monitoring and logging mechanisms to track the performance and activities of the EC2 instance.

## Further Assistance

If you encounter any issues or require further guidance during the implementation process, refer to the Pulumi documentation or seek assistance from the Pulumi community and support channels.

# Assignment 6

This document serves as a comprehensive guide for setting up and configuring the web application. Please adhere to the following instructions to ensure a smooth deployment and effective implementation of the application.

## Prerequisites

Before starting the setup process, ensure you have the following prerequisites in place:

1. An AWS account with sufficient permissions to create EC2 instances, RDS instances, and other required resources.
2. Pulumi CLI installed and configured with appropriate credentials.
3. Familiarity with Systemd or an alternative tool for configuring autorun.
4. Understanding of managing cloud-init processes and userdata scripts on AWS.

## Setup Process

### 1. Launching the EC2 Instance and RDS

Execute the Pulumi codebase to launch the EC2 instance and RDS. Verify that the web application's database is associated with the created RDS instance. Properly configure security groups and network settings for seamless communication between the EC2 instance and RDS.

### 2. Configuring Autorun with Systemd

Utilize Systemd or an alternative tool of your choice for configuring autorun. Ensure the service begins after the completion of cloud-init execution. Set it to be required or wanted by cloud-init instead of the standard multi-user. Refer to [this resource](https://serverfault.com/a/937723) for additional guidance on the process.

### 3. Integration Tests Setup

For integration tests in GitHub Actions, set up a local database on the EC2 instance for testing purposes. Configure the necessary scripts and environments within your GitHub Actions workflow to facilitate seamless integration testing.

## Additional Recommendations

- Regularly monitor application logs and AWS resources to ensure optimal functionality and performance.
- Document any modifications made to the setup or configuration for future reference.
- Adhere to security best practices and ensure secure storage and access of sensitive information.

By following these instructions, you can successfully set up and manage the web application along with the necessary configurations for autorun and integration testing.

test



