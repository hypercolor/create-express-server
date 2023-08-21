# Hypercolor Create Express Server

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [License](LICENSE)
- [More Information](#more-information)
    - [Toolchain](#toolchain)
    - [Project Repository](#project-repository)
    - [Organization Repository](#organization-repository)

## Introduction

This tool is used by the team at Hypercolor Digital to quickly spin up a new backend server using our standard infrastructure practices. This tool uses TypeScript, Express, Postgres, AWS SQS and MongoDB. 

## Installation

Install this package using your package manager of choice.

- NPM
    - `npm i -g @hypercolor/create-hc-server`
- Yarn
    - `yarn global add @hypercolor/create-hc-server`

## Usage
### Step 1: Create Your New App

After installing the package, you can run the following command to create a new project.
```terminal
npx create-hc-server my-server-name
```

### Step 2: Finalize your configuration

Now that the package has been initialized, we need to either connect our datasbases and workers, or remove them from the package. 

- If you are not using an AWS SQS worker instance, delete the `/src/worker` directory and remove the `SQS_URL_ASYNC_WORKER` declaration in `/src/util/config.ts`.
  - open the `.env` file at the root of the project, and add the URL strings for your MongoDB and Postgres databases.
    - NOTE: The keys in the `.env` file need to exactly match the declarations in `/src/util/config.ts`.

### Step 3: Add an API Endpoint
Visit `/src/routes/api/v1/hello/get.ts` to see an example of how to add a new API endpoint controller class. The pattern for this server architecture is that requests pass through a controller, into a service file to do some work, and then return back out of the same controller it was entered through.

Example:
```typescript
import { Controller } from "../../../classes/controller";
import { UserService } from "../../../services/user-service";
import { Mapper } from "../../../util/mapper";

export class GetUsersController extends Controller {
  public async handleRequest() {
    const users = await UserService.getUsers();
    return Mapper.mapOutput(users, UserDto);
  }
}
```

### Step 4: Run your server

Build your server:
```terminal
nvm use && yarn build
```

Run your server:
```terminal
yarn start
```

## Misc Info

### Toolchain

- TypeScript
- MongoDB
- Postgres
- AWS SQS
- Express

#### [Project Repository](https://github.com/hypercolor/create-express-server)

#### [Organization Repository](https://github.com/hypercolor/)
