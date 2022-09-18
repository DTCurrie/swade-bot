const {Colors} = require('discord.js');
const {calculateMeleeRollRaises} = require('../lib/rolls');

const {createBaseEmbed} = require('./base');

/**
 * Creates the final result embed with the passed result
 * @param {string} title The embed's title
 * @param {number} result The final result for the roll
 * @param {number} parry The target's parry
 * @returns {EmbedBuilder} the embed
 */
function createMeleeResultEmbed(title, result, parry) {
	const fields = [{name: 'Result', value: `${result}`}];
	const success = result >= parry;

	if (success) {
		fields.push({
			name: 'Raise?',
			value: `${calculateMeleeRollRaises(result, parry) > 0 ? 'Yes' : 'No'}`,
			inline: true,
		});
	}

	return createBaseEmbed(
		title,
		fields,
		success ? Colors.Green : Colors.Red,
	);
}

module.exports = {createMeleeResultEmbed};
