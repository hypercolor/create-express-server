#!/usr/bin/env node

import * as fs from "fs";
import cp from "child_process";
const exec = promisify(cp.exec);
import {promisify} from "util";
import path from "path";
import rdl from "readline";
const std = process.stdout

class Spinner {
    constructor() {
        this.timer = null;
        this.frames = [
            "⢀⠀",
            "⡀⠀",
            "⠄⠀",
            "⢂⠀",
            "⡂⠀",
            "⠅⠀",
            "⢃⠀",
            "⡃⠀",
            "⠍⠀",
            "⢋⠀",
            "⡋⠀",
            "⠍⠁",
            "⢋⠁",
            "⡋⠁",
            "⠍⠉",
            "⠋⠉",
            "⠋⠉",
            "⠉⠙",
            "⠉⠙",
            "⠉⠩",
            "⠈⢙",
            "⠈⡙",
            "⢈⠩",
            "⡀⢙",
            "⠄⡙",
            "⢂⠩",
            "⡂⢘",
            "⠅⡘",
            "⢃⠨",
            "⡃⢐",
            "⠍⡐",
            "⢋⠠",
            "⡋⢀",
            "⠍⡁",
            "⢋⠁",
            "⡋⠁",
            "⠍⠉",
            "⠋⠉",
            "⠋⠉",
            "⠉⠙",
            "⠉⠙",
            "⠉⠩",
            "⠈⢙",
            "⠈⡙",
            "⠈⠩",
            "⠀⢙",
            "⠀⡙",
            "⠀⠩",
            "⠀⢘",
            "⠀⡘",
            "⠀⠨",
            "⠀⢐",
            "⠀⡐",
            "⠀⠠",
            "⠀⢀",
            "⠀⡀"
        ];
        this.interval = 80;
        this.title = '';
    }

    spin(title) {
        this.title = title;
        std.write("\x1b[?25l");
        const {interval, frames} = this;

        let i = 0;
        this.timer = setInterval(() => {
            let now = frames[i];
            if (now === undefined) {
                i = 0;
                now = frames[i];
            }
            std.write(now + ' ' + this.title + " " + now);
            rdl.cursorTo(std, 0);
            i = i >= frames.length ? 0 : i + 1;
        }, interval);
    }

    stop() {
        this.title = '';
        clearInterval(this.timer);
    }
}



const buildProject = async () => {
    const spinner = new Spinner();

    if (process.argv.length < 3) {
        console.log("You have to provide a name to your app.");
        console.log("For example :");
        console.log("    npx create-hc-server my-app");
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
        spinner.stop();

        spinner.spin("Installing project dependencies...");
        await exec("yarn");

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
