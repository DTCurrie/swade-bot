/**
 * A module for creating roll embeds.
 * @module rolls
 */

const {createBaseEmbed} = require('./base');

/**
 * Creates the initial roll embed
 * @param {string} nickname The name to render in the embed
 * @param {number} result The result from the roll
 * @param {string} output The output from the roll
 * @returns {EmbedBuilder} the embed
 */
function createRollEmbed(nickname, result, output) {
	return createBaseEmbed(`${nickname}'s roll!`, [
		{name: 'Result', value: `${result}`, inline: true},
		{name: 'Output', value: `${output}`},
	]);
}

/**
 * Creates a reroll embed
 * @param {string} nickname The name to render in the embed
 * @param {number} result The result from the reroll
 * @param {string} output The output from the reroll
 * @param {number} last The result of the last roll
 * @returns {EmbedBuilder} the embed
 */
function createRerollEmbed(nickname, result, output, last) {
	return createBaseEmbed(`${nickname}'s roll!`, [
		{name: 'Result', value: `${result}`, inline: true},
		{name: 'Previous Best', value: `${last}`, inline: true},
		{name: 'Output', value: `${output}`},
	]);
}

module.exports = {createRollEmbed, createRerollEmbed};
