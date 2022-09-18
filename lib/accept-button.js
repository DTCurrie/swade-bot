/**
 * A module for creating accept buttons for roll embeds.
 * @module accept-button
 */

const {ButtonBuilder, ButtonStyle} = require('discord.js');

/**
 * The ID for identifying reroll button interactions
 */
const ACCEPT_BUTTON_ID = 'accept';

/**
 * The reroll button with a custom id of {rerollButtonId}
 * @returns {Button Builder}
 */
function createAcceptButton() {
	return new ButtonBuilder()
		.setCustomId(ACCEPT_BUTTON_ID)
		.setLabel('Accept')
		.setStyle(ButtonStyle.Success);
}

module.exports = {
	ACCEPT_BUTTON_ID,
	createAcceptButton,
};
