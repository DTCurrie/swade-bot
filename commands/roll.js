/**
 * A module for creating the `/roll` command for the bot.
 * @module roll
 */

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
} = require('discord.js');

const {DiceRoll} = require('@dice-roller/rpg-dice-roller');

const {log, error} = require('../lib/logger');
const {createCommandName} = require('../lib/command-name');
const {createRollEmbed, createRerollEmbed} = require('../embeds/rolls');
const {createBaseEmbed} = require('../embeds/base');

const commandName = createCommandName('roll');
const rerollButtonId = 'reroll';

/**
 * Handles a standard roll
 * @param {string} dice The dice roll notation to use
 * @returns {{ result: number, output: string }}
 */
function handleRoll(dice) {
	log(commandName, 'handleRoll', dice);

	const roll = new DiceRoll(dice);
	log(commandName, 'handleRoll roll', roll.output);

	return {
		result: roll.total,
		output: roll.output,
	};
}

/**
 * Makes an extra trait reroll
 * @param {string} dice The dice roll notation to use for the reroll
 * @param {number} last The last best roll
 * @returns {{ reroll: number, rerollOutput: string}}
 */
function handleReroll(dice, last) {
	const {result, output} = handleRoll(dice);

	const reroll = result >= last ? result : last;
	log(commandName, 'handleReroll reroll', reroll);

	return {
		reroll,
		rerollOutput: output,
	};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Makes a standard dice roll using Dice Notation!')
		.addStringOption(option =>
			option.setName('dice')
				.setDescription('The dice notation to roll, including all modifiers.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('nickname')
				.setDescription('The name to use for the roll; if blank it will use your server nickname')
				.setRequired(false)),
	async execute(interaction) {
		const dice = interaction.options.getString('dice');
		const nick = interaction.options.getString('nickname');
		const nickname = nick ?? interaction.member.nick;
		let rerolled = 0;

		try {
			const {result, output} = handleRoll(dice);
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

				const {reroll, criticalReroll, rerollOutput} = handleReroll(dice, currentBest);

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

				message.interaction.editReply({
					content: `Final result (rerolled ${rerolled} times)!`,
					embeds: [createBaseEmbed(`${nickname}'s  roll!`, [{name: 'Result', value: `${currentBest}`}])],
					components: [],
				});
			});
		} catch (err) {
			error(commandName, 'error replying to interaction', err);
		}
	},
};
