import * as fs from "fs";
import * as path from "path";
import * as commander from "commander";
import { ConsoleLogger } from "@akashic/akashic-cli-commons";
import { promiseScanAsset, promiseScanNodeModules } from "./scan";

var ver = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8")).version;

commander
	.description("Update various properties of game.json")
	.version(ver);

commander
	.command("asset [target]")
	.description("Update 'assets' property of game.json")
	.option("-C, --cwd <dir>", "The directory incluedes game.json")
	.option("-q, --quiet", "Suppress output")
	.action((target: string, opts: any = {}) => {
		var logger = new ConsoleLogger({ quiet: opts.quiet });
		promiseScanAsset({ target: target, cwd: opts.cwd, logger: logger })
			.catch((err: any) => {
				logger.error(err);
				process.exit(1);
			});
	})
	.on("--help", () => {
		console.log("  Target:");
		console.log("");
		console.log("    image");
		console.log("    audio");
		console.log("    script");
		console.log("    text");
		console.log("    all");
		console.log("");
	});

commander
	.command("globalScripts")
	.description("Update 'globalScripts' property of game.json")
	.option("-C, --cwd <dir>", "The directory incluedes game.json")
	.option("-q, --quiet", "Suppress output")
	.action((opts: any = {}) => {
		var logger = new ConsoleLogger({ quiet: opts.quiet });
		promiseScanNodeModules({ cwd: opts.cwd, logger: logger })
			.catch((err: any) => {
				logger.error(err);
				process.exit(1);
			});
	});

export function run(argv: string[]): void {
	commander.parse(argv);

	if (process.argv.length < 3
		|| !process.argv[2].match(/^(asset|globalScripts).*/)) {
		commander.help();
	}

}
