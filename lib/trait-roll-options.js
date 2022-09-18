/**
 * A module containing helper functions for common trait roll options for the bot.
 * @module trait-roll-options
 */

/**
 * Gets the common options for trait rolls: trait, modifier, and nickname.
 * @param {CommandInteraction} interaction The slash command interaction for the trait roll
 * @returns {{ trait?: number, modifier?: string, nickname?: string }} The provided options
 */
function getTraitRollOptions(interaction) {
	const trait = interaction.options.getInteger('trait');
	const modifier = interaction.options.getString('modifier');
	const nickname = interaction.options.getString('nickname') ?? interaction.member.nick;

	return {
		trait,
		modifier,
		nickname,
	};
}

/**
 * Adds a modifier option to a melee roll slash command
 * @param {SlashCommandStringOption} option The slash command interaction options
 * @returns {void}
 */
function setModifierOption(option) {
	return option.setName('modifier')
		.setDescription('The modifier to use. For example, you would enter "+1" for a bonus of 1, or "-2" for a penalty of 2.')
		.setRequired(false);
}

/**
 * Adds a nickname option to a melee roll slash command
 * @param {SlashCommandStringOption} option The slash command interaction options
 * @returns {void}
 */
function setNicknameOption(option) {
	return option.setName('nickname')
		.setDescription('The name to use for the roll; if blank it will use your server nickname')
		.setRequired(false);
}

/**
 * Adds a trait option to a melee roll slash command
 * @param {SlashCommandStringOption} option The slash command interaction options
 * @returns {void}
 */
function setTraitOption(option) {
	return option.setName('trait')
		.setDescription('The trait die type to use. For example, if you want to roll for a trait with a d8 just enter "8".')
		.setRequired(true);
}

module.exports = {
	getTraitRollOptions,
	setModifierOption,
	setNicknameOption,
	setTraitOption,
};
