/**
 * Returns the command name with a `-dev` suffix when in development mode
 * @param {string} command
 * @returns string
 */
function createCommandName(command) {
	const suffix = process.env.NODE_ENV === 'production' ? '' : '-dev';
	return `${command}${suffix}`;
}

module.exports = {createCommandName};
