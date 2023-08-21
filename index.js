#!/usr/bin/env node

const fs = require('fs');
const exec = require('util').promisify(require('child_process').exec);
const path = require('path');
const {Spinner} = require('./src/Spinner');

const buildProject = async () => {
    const spinner = new Spinner();

    if (process.argv.length < 3) {
        console.log("You have to provide a name to your app.");
        console.log("For example :");
        console.log("    npx create-hc-server my-app");
        process.exit(1);
    }

    try {
        await exec("yarn -v");
    } catch (error) {
        console.log("yarn is not installed, please install it and try again.");
        process.exit(1);
    }

    try {
        await exec("nvm -v");
    } catch (error) {
        console.log("nvm is not installed, please install it and run the following command");
        console.log("Command: nvm install 18.17.1");
        process.exit(1);
    }

    const projectName = process.argv[2];
    const currentPath = process.cwd();
    const projectPath = path.join(currentPath, projectName);
    const git_repo = "https://github.com/hypercolor/backend-template.git";

    if (fs.existsSync(projectPath)) {
        console.log(`The file ${projectName} already exist in the current directory, please give it another name.`);
        process.exit(1);
    }

    fs.mkdirSync(projectPath);

    try {
        spinner.spin("Downloading files...");
        await exec(`git clone --depth 1 ${git_repo} ${projectPath} --quiet`); // clone the repo into the project folder -> creates the new boilerplate
        spinner.stop();

        spinner.spin('Removing setup files and packages...');
        // remove git history
        fs.rm(path.join(projectPath, ".git"), {recursive: true, force: true}, (err) => {
            if (err) {
                console.log("Error removing git history");
                console.log(err);
                process.exit(1);
            }
        });
        // remove the installation file
        fs.rm(path.join(projectPath, "index.js"), {recursive: true, force: true}, (err) => {
            if (err) {
                console.log("Error removing bin file");
                console.log(err);
                process.exit(1);
            }
        });

        process.chdir(projectPath);
        await exec("npm uninstall ora cli-spinners"); // remove the packages needed for cli
        spinner.stop();

        spinner.spin("Installing project dependencies...");
        await exec("nvm use && yarn");

        console.log("Project initialized with yarn, creating .env file...");
        const vars = [
            '# Localhost variables',
            '# You can change these to your liking, but make sure to change them in the util/config.ts file as well',
            '# Do not commit this file to git, it is ignored by default',
            `APP_NAME=${projectName}`,
            `DATABASE_URL=postgres://localhost:5432/${projectName}`,
            "ENVIRONMENT_NAME=dev",
            `MONGODB_DATABASE_NAME=${projectName}`,
            "MONGODB_URL=mongodb://localhost:27017",
            "REDIS_URL=redis://localhost:6379",
            "SERVER_DOMAIN=localhost",
            "SQS_URL_ASYNC_WORKER=stub",
        ];
        await fs.writeFileSync('.env', vars.join('\n'));
        spinner.stop();

        console.log("The installation is done!");
        console.log(`NOTE: Before running your server, you are required to fill your .env file with the following key/value pairs, or remove them from /src/utils/config.ts: `, {
            DATABASE_URL: "postgres://<username>:<password>@<host>:<port>/<database>",
            MONGODB_DATABASE_NAME: projectName,
            MONGODB_URL: "mongodb://<username>:<password>@<host>:<port>/<database>",
            SQS_URL_ASYNC_WORKER: "https://sqs.<region>.amazonaws.com/<account_id>/<queue_name>",
            REDIS_URL: "redis://<host>:<port>",
        });

    } catch (error) {
        // clean up in case of error, so the user does not have to do it manually
        fs.rmSync(projectPath, {recursive: true, force: true});
        console.log(error);
    }
}

buildProject().then(() => {
    process.exit(0);
})
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
