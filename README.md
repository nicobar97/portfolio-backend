# Backend - Node.js with TypeScript

The backend component of this project serves as the server-side code for the portfolio application. It handles data storage, retrieval, and business logic, providing the necessary functionality for the frontend to interact with the database and other services.

## Main Technologies Used

- **Fastify**: Fastify is a fast and efficient web framework for Node.js. It allows the backend to handle incoming HTTP requests efficiently and respond with minimal overhead.

- **Awilix**: Awilix is a dependency injection container for Node.js applications. It helps manage dependencies and facilitates the organization of the application's components.

- **Axios**: Axios is a popular HTTP client used for making API requests. The backend uses Axios to interact with external APIs and services.

- **Mongoose**: Mongoose is an elegant MongoDB object modeling tool. It simplifies interactions with the MongoDB database and provides schema validation and mapping.

- **OpenAI**: The backend uses the OpenAI library to interact with the OpenAI GPT-3 API. This enables the application to utilize AI capabilities for various tasks.

- **Purify-ts**: Purify-ts is a functional programming library for TypeScript. It allows the backend to adopt functional programming principles, making the code more robust and maintainable.

## Setup

To set up the backend, ensure you have Node.js installed, preferably version 19.4.0. Next, navigate to the backend directory and install the required dependencies using the following command:

```bash
cd [backend-directory]
yarn install
```

## Starting the Backend

After installing the dependencies, create a .env file in this format, on the project root:
```
PORT=3000
ENVIRONMENT=development
GOOGLE_BARD_COOKIES=
OPENAI_API_KEY=
OPENAI_API_ORGANIZATION=
DATABASE_CONNECTION_STRING=
```

After this, you can start the backend server using the following command:

```bash
yarn dev
```

The backend server will be running and accessible at the specified port. It will handle incoming requests from the frontend and interact with the database and external APIs as needed.

## API Endpoints

The backend exposes various API endpoints that the frontend interacts with. These endpoints allow the frontend to retrieve data, submit forms, and perform various actions. The API endpoints are well-documented and follow RESTful design principles.

## Database

The backend utilizes a MongoDB database to store and manage data related to the portfolio application. The database schema and models are defined using Mongoose, ensuring data consistency and integrity.

## Deployment

The backend is hosted on Heroku, a popular cloud platform that provides infrastructure for deploying, managing, and scaling applications. The hosting on Heroku ensures that the backend is easily accessible and available for the frontend to communicate with.
