import type { Config } from "@dsmrt/axiom-config";

export const buildPath = (config: Config, path?: string) => {
	if (path === undefined) {
		return config.aws?.baseParameterPath;
	}

	// if it starts with a `/` use the absolute
	if (/^\//.test(path)) {
		return path;
	}
	// if it doens't, build off of the base path
	return `${config.aws?.baseParameterPath.replace(/\/$/, "")}/${path}`;
};
