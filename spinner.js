import rdl from "readline";
const std = process.stdout;

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

const run = () => {
    const spinner = new Spinner();
    spinner.spin("Downloading files...");
    setTimeout(() => {
        spinner.stop();
    }, 10000);

    setTimeout(() => {
        spinner.spin("Removing setup files and packages...");
        setTimeout(() => {
            spinner.stop();
        }, 10000);
    }, 11000)
}

run();
