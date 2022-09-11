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
			iconURL: 'https://cdn-cmhfa.nitrocdn.com/sILXXMmoPZtGHchENBdSFUfGNBQKBJVN/assets/static/optimized/rev-5f0e4a3/wp-content/uploads/2021/03/swade-88x60-1.png',
			url: 'https://github.com/DTCurrie/savager-bot',
		})
		.addFields(...fields)
		.setTimestamp();
}

module.exports = {createBaseEmbed};
