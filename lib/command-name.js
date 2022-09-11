/**
 * A module for creating command names.
 * @module command-name
 */

/**
 * Returns the command name with a `-dev` suffix when in development mode
 * @param {string} command the command name
 * @returns {string} the command with a `-dev` suffix when not in production
 */
function createCommandName(command) {
	const suffix = process.env.NODE_ENV === 'production' ? '' : '-dev';
	return `${command}${suffix}`;
}

module.exports = {createCommandName};
