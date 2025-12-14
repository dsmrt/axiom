#!/usr/bin/env node

const fs = require("fs");

const PATHS = ["aws-sdk", "cli", "config"];

const BADGE_CONFIG = {};

PATHS.forEach((path) => {
	const summary = JSON.parse(
		fs.readFileSync(`${path}/coverage/coverage-summary.json`).toString(),
	);

	// .total.lines.pct
	console.log(`${path}:${summary.total.lines.pct}%`);
});
