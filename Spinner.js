const fs = require("fs")
const rdl = require("readline")
const std = process.stdout
const config = JSON.parse(fs.readFileSync('./config.json').toString())


class Spinner {
    constructor() {
        this.timer = null;
        this.frames = config.frames;
        this.interval = config.interval;
        this.title = '';
    }
    spin(title) {
        this.title = title;
        std.write("\x1b[?25l")
        const {interval, frames} = config;

        let i = 0;
        this.timer = setInterval(() => {
            let now = frames[i];
            if (now === undefined) {
                i = 0;
                now = frames[i];
            }
            std.write(now + ' ' + this.title + ' ' + now);
            rdl.cursorTo(std, 0, 0);
            i = i >= frames.length ? 0 : i + 1;
        }, interval);
    }

    stop() {
        this.title = '';
        clearInterval(this.timer);
        std.write("\x1b[?25h");
    }
}

export default Spinner;
