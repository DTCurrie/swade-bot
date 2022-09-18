/**
 * A module for creating roll result embeds. Intended for rolls that can be raised.
 * @module result
 */

const {Colors} = require('discord.js');
const {calculateTraitRollRaises} = require('../lib/rolls');
const {createBaseEmbed} = require('./base');

/**
 * Creates a trait roll result embed color-coded based on success
 * @param {string} title The embed's title
 * @param {number} result The final result for the roll
 * @returns {EmbedBuilder} the embed
 */
function createTraitResultEmbed(title, result) {
	const fields = [{name: 'Result', value: `${result}`}];
	const success = result >= 4;

	if (success) {
		fields.push({name: 'Raises', value: `${calculateTraitRollRaises(result)}`, inline: true});
	}

	return createBaseEmbed(
		title,
		fields,
		success ? Colors.Green : Colors.Red,
	);
}

module.exports = {createTraitResultEmbed};
