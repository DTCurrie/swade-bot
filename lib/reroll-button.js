/**
 * A module for creating reroll buttons for roll embeds.
 * @module reroll-button
 */

const {ButtonBuilder, ButtonStyle} = require('discord.js');

/**
 * The ID for identifying reroll button interactions
 */
const REROLL_BUTTON_ID = 'reroll';

/**
 * The reroll button with a custom id of {rerollButtonId}
 * @returns {ButtonBuilder}
 */
function createRerollButton() {
	return new ButtonBuilder()
		.setCustomId(REROLL_BUTTON_ID)
		.setLabel('Reroll')
		.setStyle(ButtonStyle.Primary);
}

module.exports = {
	REROLL_BUTTON_ID,
	createRerollButton,
};
