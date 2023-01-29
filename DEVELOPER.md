# Developer Setup

Broadly there are three main areas that require developer input before being able to run the app locally and in production; global environment variables in the `.env` file, creation of production resources with [Terraform](https://www.terraform.io/), and automated deployment with [GitHub workflows](https://docs.github.com/en/actions/using-workflows).

To get started locally first, only the `.env` file is needed. 

## Environment Variables

Strapi requires a number of [environment variables](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations.html) to be set in order to do basic things like connect to the database, as well as power some of the installed plugins. To get started make a new `.env` file and copy the contents from the `.env.example` file at the root of the project. `.env` files ares excluded from version control using the `.gitignore` file.

### Server
Strapi itself can be customised to serve in different ways depending on the local or production setup you'd like. Refer to the full Strapi documentation for full details.

#### HOST
The hostname or IP that the server is running on. Usually set to `0.0.0.0`.

#### PORT
The port that the server is listening on. Usually set to `8080`.

#### URL
The URL that the server is listening on. Usually set to `http://localhost`.

#### PUBLIC_URL
The full URL if the port is not set to `80` or `443`. By default this is a combination of previous variables in the style `http://${URL}:${PORT}`.

#### PUBLIC_ADMIN_URL
The customizable URL of the admin panel. By default this is a combination of previous variables in the style `http://${URL}:${PORT}/dashboard`.

### Database
This template installation of Strapi is configured to connect to a MySQL server. Where this server is running is up to the developer, but it is recommended to connect to a local instance for development and then change the variables in production. It is **HIGHLY** recommended not to use the root database user. Instead create a new user with restricted access using a `mysql` shell or a GUI like [MySQL Workbench](https://dev.mysql.com/downloads/workbench/).

#### DATABASE_HOST
The hostname or IP of the MySQL server.

#### DATABASE_PORT
The port the MySQL server is listening on.

#### DATABASE_SSL
Does the MySQL server require secure connections? Value can be `true` or `false`. In production this should **ALWAYS** be `true`.

#### DATABASE_NAME
The name of the database schema to be used by Strapi. The schema should be empty the first time you start up the app because Strapi instantiates all the tables and views it needs.

#### DATABASE_USERNAME
The username of the MySQL server user.

#### DATABASE_PASSWORD
The password of the MySQL server user.

### API Security
To secure API tokens generated by users creating sessions with the Strapi the follwoing variables are required.

#### APP_KEYS
App keys are random strings used to generate unique session IDs. It is recommended to have 4 comma seperated values, for example `key1,key2,key3,key4`. Use a random string generator to create app keys.

#### API_TOKEN_SALT
New API tokens are generated using a salt. Changing the salt invalidates all the existing API tokens.

#### ADMIN_JWT_SECRET
A random string used to encode JWT tokens. Use a random string generator to create one.

### File Storage
By defaulty Strapi stores uploaded files in the local file directory. This is a problem when running Strapi in Docker because storage is ephemeral and will be lost with each restart of the container. You will see this situation if you have file metadata in the database that reference file paths that no longer resolve. To get around this problem the [strapi-provider-upload-azure-storage](https://github.com/jakeFeldman/strapi-provider-upload-azure-storage) is included so that any uploaded files are backed up there.

#### STORAGE_ACCOUNT
The name of the Azure storage account being used.

#### STORAGE_ACCOUNT_KEY
The name of the Azure storage account key, get this from the security settings in Azure.

#### STORAGE_URL
This is optional, it is useful when connecting to Azure Storage API compatible services, like the official emulator Azurite. STORAGE_URL would then look like http://localhost:10000/your-storage-account-key. 

When STORAGE_URL is not provided, it defaults to https://${STORAGE_ACCOUNT}.blob.core.windows.net will be used.

#### STORAGE_CONTAINER_NAME
The name of the Azure storage container being used.

#### STORAGE_CDN_URL
This is optional, it is useful when using CDN in front of your storage account. Images will be returned with the CDN URL instead of the storage account URL.

#### STORAGE_PATH
The path within the container to store images. Left blank this will store them at the root of the container.

#### STORAGE_MAX_CONCURRENT
Used for setting this maximum number of concurrent connections ot Azure when uploading multiple files.

### Sentry
The [Sentry Strapi plugin](https://github.com/strapi/strapi/tree/master/packages/plugins/sentry) is included in this installation for tracking uncaught errors. The plugin GitHub readme has the full documentation if required.

#### SENTRY_DSN
The only required variable is the [Data Source Name](https://docs.sentry.io/product/sentry-basics/dsn-explainer/), which can be found in the project settings in Sentry. In development it is recommended to set this variable as an empty string so that no errors are sent. In production it is **HIGHLY** recommended to setup Sentry to aid debugging.

## Terraform

[Terraform](https://www.terraform.io/) files are included to create all of the resources nessecary to run Strapi in Azure. This includes a [Container Registry](https://learn.microsoft.com/en-us/azure/container-registry/) for storing container images, a [Storage Account](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) for persisting uploaded media and an [App Service](https://learn.microsoft.com/en-us/azure/app-service/overview) for running an instance of the container image.

This guide assumes the developer is already familiar with Terraform, so the commands to create and destroy resources are not covered here. The main file that needs developer input is `/terraform/variables.tf`. The `main.tf` file is parameterised in such a way that it shouldn't need editing unless making significant changes to the resources. Instead, the variables file prompts the user to enter all of the values required. A large portion of these are the same as required to run the app localled, and are outlined in the `Environment Variables` section. Variables not covered there are described here.

#### subscription_id
The subscription ID in the billing account, this is the level at which billing happens. Each project should request it's own subscription via NU Service and provide a cost center to charge.

#### resource_group_name
The name of the Azure resource group in which to create all the resources.

#### resource_group_location
The Azure geolocation of the data center to run the resources in.

#### project_name
The name of the project.

#### project_pi
The Principle Investigator or Project Lead

#### project_contributors
A list of names of people contributing to the project.

#### image_name
The name of the image from the registry to run in the app service. This must match value in the GitHub workflow used to crate the image.

## GitHub Workflows

There are two workflow files that come setup for build and deploy actions. These are stored in the `./github/workflows` directory. 

### Build

The build step produces a Docker image with your Strapi instance packaged up and ready to deploy. A build is triggered on any push to `main` or a tagged release. For push based triggers the Docker images is tagged with a label of `latest`. For tagged releases the image is labeled with a matching semantic version, for example `1.2.3`. These images are then pushed to a container registry, the intention being the one created by Terraform but it could be to a third party registry like DockerHub.

If the included terraform files are used, you can find the value for all of these properties in the settings page of the Azure registry that gets created.

#### REGISTRY (Workflow Variable)
The URL for the container registery to push images to.

#### IMAGE_NAME (Workflow Variable)
The image name you want to use, for example `strapi-api`, this then gets labled in the form `strpai-api:latest`.

#### REGISTRY_USERNAME (Secret)
The username used for authenticating with the container registry.

#### REGISTRY_PASSWORD (Secret)
The password used for authenticating with the container registry.

### Deploy

The deploy step assumes a build has just run successful that has ended with a semantically tagged version pushed to the registry.

#### APP_NAME (Workflow Variable)
The name of the Azure Web App that runs the container, this is the one created via Terraform.

#### PUBLISH_PROFILE (Secret)
Azure uses publish profiles to allow CI/CD pipelines to interact with Azure App Services. A publish profile is a small XML string that needs to be stored as a repository secret. Follow [these steps](https://learn.microsoft.com/en-us/visualstudio/azure/how-to-get-publish-profile-from-azure-app-service?view=vs-2022) for obtaining a publish profile for your app.