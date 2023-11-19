#!/usr/bin/env -S ts-node --esm --preferTsExts

import yargs from "yargs/yargs";
import { ParamsCommand }  from "../commands/params/base"
import { Config } from "../commands/config"

yargs(process.argv.slice(2))
.env('AXIOM')
.scriptName('axiom')
.option('config', {
    alias: 'c',
    string: true,
})
.command(new Config)
.command(new ParamsCommand)
.usage(`
Axiom - an AWS focused config cli

USAGE:
           $0 [options] <command>
       `)
        .demandCommand(1, '')
        .alias('h', 'help')
        .argv
