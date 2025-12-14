#!/usr/bin/env node

import yargs from "yargs";
import { Config, ParamsCommand } from "../commands";

yargs(process.argv.slice(2))
	.env("AXIOM")
	.scriptName("axiom")
	.option("config", {
		alias: "c",
		string: true,
	})
	.option("debug", {
		alias: "d",
		type: "boolean",
		description: "Enable debug output",
		default: false,
		global: true,
	})
	.middleware((argv) => {
		// If --debug is passed, set the AXIOM_DEBUG environment variable
		// so that the config package can use it
		if (argv.debug) {
			process.env.AXIOM_DEBUG = "true";
		}
	})
	.command(new Config())
	.command(new ParamsCommand())
	.strict()
	.usage(
		`
Axiom - an AWS focused config cli

USAGE:
           $0 [options] <command>
       `,
	)
	.demandCommand(1, "")
	.alias("h", "help").argv;
