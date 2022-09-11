/**
 * A module for creating embeds for the bot.
 * @module base
 */

const {EmbedBuilder} = require('discord.js');

/**
 * Creates the base embed to be used across the app
 * @param {string} title The embed title
 * @param {Array<Record<string, string>>} fields The embed fields to render
 * @param {number} [color] The embed's color
 * @returns {EmbedBuilder} the embed
 */
function createBaseEmbed(title, fields, color) {
	return new EmbedBuilder()
		.setColor(color || 0x0099FF)
		.setTitle(title)
		.setAuthor({
			name: 'SWADE Bot',
			iconURL: 'https://github.com/DTCurrie/swade-bot/blob/main/assets/swade-logo.png',
			url: 'https://github.com/DTCurrie/swade-bot',
		})
		.addFields(...fields)
		.setTimestamp();
}

module.exports = {createBaseEmbed};
