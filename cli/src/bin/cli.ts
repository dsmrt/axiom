#!/usr/bin/env -S ts-node --preferTsExts

import yargs, { Argv } from "yargs";

const axiom = async (yargs: Argv<{}>) => {
    yargs
        .env('AXIOM')
        .scriptName('axiom')
        .option('config', {
                alias: 'c',
                string: true,
                default: __dirname
        }).usage(`
USAGE:
  $0 [options] <command>
`)
}

axiom(yargs)
