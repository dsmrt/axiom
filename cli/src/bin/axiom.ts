#!/usr/bin/env node

import yargs from "yargs";
import { ParamsCommand, Config } from "../commands";

yargs(process.argv.slice(2))
  .env("AXIOM")
  .scriptName("axiom")
  .option("config", {
    alias: "c",
    string: true,
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
