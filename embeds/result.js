const {Colors} = require('discord.js');
const {createBaseEmbed} = require('./base');

/**
 * Creates the final result embed with the passed result
 *
 * @param {string} title The embed's title
 * @param {number} result The final result for the roll
 * @returns {EmbedBuilder}
 */
function createResultEmbed(title, result) {
	return createBaseEmbed(
		title,
		[{
			name: 'Result',
			value: `${result}`,
		}],
		result >= 4 ? Colors.Green : Colors.Red);
}

module.exports = {createResultEmbed};
