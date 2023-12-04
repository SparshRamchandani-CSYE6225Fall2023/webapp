# Cloud Native Web Application

## Overview

Welcome to the Cloud Native Web Application API for the Fall 2023 semester (Assignment 9). This API is designed to support the management of assignments and submissions within the context of a cloud-native web application. The API is documented using the OpenAPI Specification (OAS) 3.0 and is hosted on SwaggerHub for easy access and interaction.

## Authentication

Some operations in this API are restricted to authenticated users. To access these authenticated endpoints, users must provide appropriate credentials. If you are using the SwaggerHub API Auto Mocking feature, authentication is simulated for testing purposes.

## Authenticated Endpoints

### GET /v1/assignments
- **Description:** Retrieve a list of all assignments.
- **Authentication Required:** Yes

### POST /v1/assignments
- **Description:** Create a new assignment.
- **Authentication Required:** Yes

### GET /v1/assignments/{id}
- **Description:** Get details for a specific assignment.
- **Authentication Required:** Yes

### DELETE /v1/assignments/{id}
- **Description:** Delete a specific assignment.
- **Authentication Required:** Yes

### PUT /v1/assignments/{id}
- **Description:** Update details for a specific assignment.
- **Authentication Required:** Yes

### POST /v1/assignments/{id}/submission
- **Description:** Submit an assignment.
- **Authentication Required:** Yes

## Public Endpoints

### GET /healthz
- **Description:** Health Check API for system status.
- **Authentication Required:** No

## Schemas

The API utilizes the following data schemas:

- **Account:** Represents user account information.
- **Assignment:** Describes the details of an assignment.
- **Submission:** Contains information about assignment submissions.

## Usage

Please refer to the OpenAPI documentation for detailed information on request and response formats for each endpoint. The API follows the principles of RESTful design, with clear and intuitive paths for managing assignments and submissions.

## License

This Cloud Native Web Application API is licensed under the Apache 2.0 License. For more details, please refer to the [LICENSE](link_to_license_file) file.

# Build AMI after PR Merge Workflow

This GitHub Actions workflow automates the process of building an Amazon Machine Image (AMI) after a pull request is opened or synchronized with the main branch. Additionally, it triggers the AMI build on each push to the main branch.

## Workflow Details

### Events Triggering Workflow

- **Pull Request Events:**
  - Triggered on pull request opening or synchronization.
  - Restricted to the 'main' branch.

- **Push Events:**
  - Triggered on each push to the 'main' branch.

### Workflow Jobs

#### `build-ami`

This job performs the following steps:

1. **Checkout Repository:**
   - Uses the `actions/checkout@v2` action to fetch the repository content.

2. **Setup Environment Variables:**
   - Creates a `.env` file with environment variables required for the application.
   - Variables include `ENVIRONMENT`, `PGHOST`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD`.

3. **Create Application Artifact:**
   - Creates a zip file (`webapp.zip`) containing the application artifacts, excluding Git-related files.

4. **Install Packer:**
   - Downloads and installs Packer, a tool for creating machine and container images.
   - Specifies the desired Packer version.

5. **Initialize Packer:**
   - Initializes Packer using the `debian12.pkr.hcl` configuration file.

6. **Build Custom AMI:**
   - Builds a custom Amazon Machine Image using Packer.
   - Requires AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`) stored as secrets.

7. **Configure AWS Credentials:**
   - Uses the `aws-actions/configure-aws-credentials@v1-node16` action to configure AWS credentials.
   - Uses credentials from the `AWS_DEMO_ACCESS_KEY`, `AWS_DEMO_SECRET_KEY`, and `AWS_REGION` secrets.

8. **Instance Refresh Automation / Continuous Delivery:**
   - Installs `jq` for JSON parsing.
   - Retrieves the latest AMI ID from the Packer build manifest.
   - Updates the launch template with the new AMI version and triggers an instance refresh on the Auto Scaling Group.

9. **Print manifest.json:**
   - Outputs the contents of the Packer build manifest (`manifest.json`).

## Usage

1. Ensure that the required secrets (`ENVIRONMENT`, `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_DEMO_ACCESS_KEY`, `AWS_DEMO_SECRET_KEY`, `AutoScalingGroupNAME`, `LaunchTemplateName`) are set in the repository settings.

2. Make sure that Packer and AWS credentials are correctly configured.

3. Trigger the workflow by opening a pull request, synchronizing a pull request, or pushing to the main branch.

4. Monitor the workflow progress and review the output, including the AMI ID in the `manifest.json` file.

## Additional Notes

- This workflow assumes the existence of a Packer configuration file named `debian12.pkr.hcl`.

- The `jq` tool is used for parsing JSON in the workflow.

- The instance refresh strategy is set to "Rolling" for the Auto Scaling Group.




# Build CI Workflow

This GitHub Actions workflow automates the build and testing process for your application. The workflow is triggered when a pull request is opened or synchronized with the main branch. Additionally, it runs on each push to the main branch.

## Workflow Details

### Events Triggering Workflow

- **Pull Request Events:**
  - Triggered on pull request opening or synchronization.
  - Restricted to the 'main' branch.

- **Push Events:**
  - Triggered on each push to the 'main' branch.

### Workflow Jobs

#### `build-and-test`

This job performs the following steps:

1. **Checkout Code:**
   - Uses the `actions/checkout@v2` action to fetch the repository content.

2. **Setup PostgreSQL Service:**
   - Uses a PostgreSQL service with the specified environment variables for database configuration.
   - Exposes PostgreSQL on port 5432.
   - Includes health checks to ensure PostgreSQL is ready.

3. **Create Environment File:**
   - Creates a `.env` file with environment variables required for the application.
   - Variables include `ENVIRONMENT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGPORT`, and `PGHOST`.

4. **Set up Node.js:**
   - Uses the `actions/setup-node@v2` action to set up Node.js version 16.x.

5. **Install Dependencies:**
   - Runs `npm install` to install project dependencies.

6. **Run Integration Tests:**
   - Executes `npm run test` to run integration tests for the application.

## Usage

1. Ensure that the required secrets (`ENVIRONMENT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGPORT`, `PGHOST`) are set in the repository settings.

2. Trigger the workflow by opening a pull request, synchronizing a pull request, or pushing to the main branch.

3. Monitor the workflow progress and review the test results.

## Additional Notes

- The PostgreSQL service is used as a temporary database during the testing process.

- The workflow assumes the existence of a Node.js project and defines a test script using `npm run test`.

- The `.env` file is created to provide environment variables for the application.


# Packer Validation and Formatting Check Workflow

This GitHub Actions workflow automates the validation and formatting checks for your Packer template. The workflow is triggered when a pull request is opened or synchronized with the main branch.

## Workflow Details

### Events Triggering Workflow

- **Pull Request Events:**
  - Triggered on pull request opening or synchronization.
  - Restricted to the 'main' branch.

### Workflow Job

#### `packer-check`

This job performs the following steps:

1. **Checkout Code:**
   - Uses the `actions/checkout@v2` action to fetch the repository content.

2. **Create Application Artifact:**
   - Creates a zip file (`webapp.zip`) containing the application artifacts.

3. **Install Packer:**
   - Downloads and installs Packer, a tool for creating machine and container images.
   - Specifies the desired Packer version.

4. **Initialize Packer:**
   - Initializes Packer using the `debian12.pkr.hcl` configuration file.

5. **Validate Packer Template:**
   - Runs `packer validate` to check the syntax and validity of the Packer template (`debian12.pkr.hcl`).

6. **Check Packer Template Formatting:**
   - Uses `packer fmt -check` to verify the formatting of the Packer template.
   - If the formatting is incorrect, the workflow fails, and a message prompts the user to format the template using `packer fmt`.

## Usage

1. Ensure that the required Packer configuration file (`debian12.pkr.hcl`) is present in the repository.

2. Trigger the workflow by opening a pull request or synchronizing a pull request with the main branch.

3. Monitor the workflow progress, and review any validation or formatting issues reported in the workflow logs.

## Additional Notes

- The workflow assumes that the Packer template is located at `debian12.pkr.hcl`.

- The `packer fmt -check` command is used to ensure consistent formatting of the Packer template.

- If the Packer template fails the formatting check, the workflow exits with an error, indicating the need to format the template before pushing changes.

