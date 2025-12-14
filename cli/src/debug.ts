// Debug utility for CLI commands
export const isDebugEnabled = (): boolean =>
	process.env.AXIOM_DEBUG === "true" || process.env.AXIOM_DEBUG === "1";

export const debug = (message: string, ...args: unknown[]): void => {
	if (isDebugEnabled()) {
		console.error(`[axiom:cli] ${message}`, ...args);
	}
};
