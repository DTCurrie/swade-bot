/**
 * A module containing helper functions for common melee roll options for the bot.
 * @module melee-roll-options
 */

/**
 * Gets the parry option for melee rolls
 * @param {CommandInteraction} interaction The slash command interaction for the melee roll
 * @returns {number} The provided parry value
 */
function getParryOption(interaction) {
	return interaction.options.getInteger('parry') || 2;
}

/**
 * Adds a parry option to a melee roll slash command
 * @param {SlashCommandStringOption} option The slash command interaction options
 * @returns {void}
 */
function setParryOption(option) {
	return option
		.setName('parry')
		.setDescription('The parry value for your target (2 plus half their Fighting die type.) Defaults to 2.');
}

module.exports = {getParryOption, setParryOption};
