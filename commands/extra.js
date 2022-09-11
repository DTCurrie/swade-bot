const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
} = require('discord.js');

const {DiceRoll} = require('@dice-roller/rpg-dice-roller');

const {addModifier} = require('../lib/add-modifier');
const {log, error} = require('../lib/logger');
const {createCommandName} = require('../lib/command-name');
const {createResultEmbed} = require('../embeds/result');
const {createRollEmbed, createRerollEmbed} = require('../embeds/rolls');

const commandName = createCommandName('extra');
const rerollButtonId = 'reroll';

/**
 * Handles an extra trait roll
 * @param {number} trait The trait die to roll
 * @param {string} modifier The modifier to apply to the roll
 * @returns {{ critical: boolean, result: number, output: string }}
 */
function handleExtraRoll(trait, modifier) {
	log(commandName, 'handleExtraRoll', {trait, modifier});

	const command = addModifier(`d${trait}`, modifier);
	log(commandName, 'handleExtraRoll command', command);

	const roll = new DiceRoll(command);
	log(commandName, 'handleExtraRoll roll', roll.output);

	const critical = roll.rolls[0].rolls[0].initialValue === 1;

	return {
		critical,
		result: roll.total,
		output: roll.output,
	};
}

/**
 * Makes an extra trait reroll
 * @param {number} trait the trait die to reroll
 * @param {modifier} modifier the modifiers to apply to the reroll
 * @returns {{ reroll: number, criticalReroll: boolean, rerollOutput: string}}
 */
function handleExtraReroll(trait, modifier, last) {
	const {critical, result, output} = handleExtraRoll(trait, modifier);

	const reroll = result >= last ? result : last;
	log(commandName, 'handleExtraReroll reroll', reroll);

	return {
		reroll,
		criticalReroll: critical,
		rerollOutput: output,
	};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Makes an extra roll!')
		.addIntegerOption(option =>
			option.setName('trait')
				.setDescription('The trait value to use. For example, if you want to roll for a trait with a d8 just enter "8".')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('modifier')
				.setDescription('The modifier to use. For example, you would enter "+1" for a bonus of 1, or "-2" for a penalty of 2.')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('extra')
				.setDescription('The extra\'s character name to use for the roll; if blank it will use your server nickname')
				.setRequired(false)),
	async execute(interaction) {
		const trait = interaction.options.getInteger('trait');
		const modifier = interaction.options.getString('modifier');
		const extra = interaction.options.getString('extra');
		const nickname = extra ?? interaction.member.nick;
		let rerolled = 0;

		try {
			const {critical, result, output} = handleExtraRoll(trait, modifier);

			if (critical) {
				await interaction.reply({
					embeds: [createResultEmbed(`${nickname} critically failed!`, 1)],
					components: [],
				});
				return;
			}

			let currentBest = result;
			const actionRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(rerollButtonId)
						.setLabel('Reroll')
						.setStyle(ButtonStyle.Success),
				);

			const message = await interaction.reply({
				embeds: [createRollEmbed(nickname, result, output)],
				components: [actionRow],
			});

			const filter = i => i.customId === rerollButtonId && i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({filter, time: 15000});

			collector.on('collect', async i => {
				if (i.user.id !== interaction.user.id) {
					i.reply({content: 'This isn\'t your roll!', ephemeral: true});
					return;
				}

				const {reroll, criticalReroll, rerollOutput} = handleExtraReroll(trait, modifier, currentBest);

				if (criticalReroll) {
					collector.stop('critical-failure');
					return;
				}

				await i.update({
					content: `Rerolled ${++rerolled} times!`,
					embeds: [createRerollEmbed(nickname, reroll, rerollOutput, currentBest)],
					components: [actionRow],
				});

				currentBest = reroll;
			});

			collector.on('end', async (collected, reason) => {
				log(commandName, 'collector end', {reason, collected});
				if (reason === 'critical-failure') {
					await message.interaction.editReply({
						embeds: [createResultEmbed(`${nickname} critically failed!`, 1)],
						components: [],
					});
					return;
				}

				message.interaction.editReply({
					content: `Final result (rerolled ${rerolled} times)!`,
					embeds: [createResultEmbed(`${nickname}'s roll!`, currentBest)],
					components: [],
				});
			});
		} catch (err) {
			error(commandName, 'error replying to interaction', err);
		}
	},
};
