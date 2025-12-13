import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";
import Cache, { type Item } from "./cache";

vi.mock("fs");

vi.mocked(fs.unlinkSync).mockReturnValue(undefined);

describe("get", () => {
	it("cache get", async () => {
		const item: Item = {
			data: {
				hello: "worlds",
			},
		};

		/* eslint-disable */
		// @ts-expect-error
		fs.existsSync.mockReturnValue(true);
		/* eslint-disable*/
		// @ts-expect-error
		fs.readFileSync.mockReturnValue(Buffer.from(JSON.stringify(item), "utf-8"));

		const cache = new Cache();

		const value = cache.get<{ hello: string }>("some-key");

		if (value === undefined) {
			return;
		}

		expect(value.hello).toBe("worlds");
	});

	it("cache get - not expired", async () => {
		const item: Item = {
			data: {
				hello: "worlds",
			},
			expires: new Date("2050-01-01T00:00:00"),
		};

		/* eslint-disable*/
		//@ts-expect-error
		fs.existsSync.mockReturnValue(true);
		/* eslint-disable*/
		//@ts-expect-error
		fs.readFileSync.mockReturnValue(Buffer.from(JSON.stringify(item), "utf-8"));

		const cache = new Cache();

		const value = cache.get("some-key");

		expect(value).toBeDefined();
	});

	it("cache get - expired", async () => {
		const item: Item = {
			data: {
				hello: "worlds",
			},
			expires: new Date("2010-01-01T00:00:00"),
		};

		//@ts-expect-error
		fs.existsSync.mockReturnValue(true);
		//@ts-expect-error
		fs.readFileSync.mockReturnValue(Buffer.from(JSON.stringify(item), "utf-8"));

		const cache = new Cache();

		const value = cache.get("some-key");

		expect(value).toBeUndefined();
	});
});

describe("set", () => {
	it("cache set", async () => {
		const item: Item = {
			data: {
				hello: "worlds",
			},
		};

		//@ts-expect-error
		fs.existsSync.mockReturnValue(true);
		//@ts-expect-error
		fs.writeFileSync.mockReturnValue(undefined);

		const cache = new Cache();
		cache.set("some-key", item);
	});
});
