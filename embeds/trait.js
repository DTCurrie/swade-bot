/**
 * A module for creating trait roll embeds.
 * @module trait
 */

const {createBaseEmbed} = require('./base');

/**
 * Creates an embed for a rerollable trait interaction
 * @param {string} title The title to render in the embed
 * @param {number} result the result from the roll
 * @param {DiceRoll} traitRoll the trait die roll
 * @param {DiceRoll} [wildCardRoll] the wild card die roll (optional)
 * @param {number} [last] the last best roll (optional)
 * @returns {EmbedBuilder} The embed to render
 */
function createTraitEmbed(title, result, traitRoll, wildCardRoll, last) {
	const fields = [{
		name: 'Trait Roll',
		value: traitRoll.output,
		inline: true,
	}];

	// Push these individually to ensure ordering is correct
	if (wildCardRoll !== undefined) {
		fields.push({
			name: 'Wild Card Roll',
			value: wildCardRoll.output,
			inline: true,
		});
	}

	if (last !== undefined) {
		fields.push({
			name: 'Previous Best',
			value: `${last}`,
			inline: true,
		});
	}

	fields.push({
		name: 'Result',
		value: `${result}`,
	});

	return createBaseEmbed(title, fields);
}

module.exports = {createTraitEmbed};
