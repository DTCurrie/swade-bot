/**
 * A module for creating the `/roll` command for the bot.
 * @module roll
 */

const {
	ActionRowBuilder,
	SlashCommandBuilder,
} = require('discord.js');

const {DiceRoll} = require('@dice-roller/rpg-dice-roller');

const {log, error} = require('../lib/logger');
const {createCommandName} = require('../lib/command-name');
const {createBaseEmbed} = require('../embeds/base');
const {setNicknameOption} = require('../lib/trait-roll-options');
const {createRerollButton, REROLL_BUTTON_ID} = require('../lib/reroll-button');
const {ACCEPT_BUTTON_ID, createAcceptButton} = require('../lib/accept-button');

const commandName = createCommandName('roll');

/**
 * Creates the roll embed
 * @param {string} title The title to render in the embed
 * @param {number} result The result from the roll
 * @param {string} output The output from the roll
 * @param {number} [last] The result of the last roll (optional)
 * @returns {EmbedBuilder} the embed
 */
function createRollEmbed(title, result, output, last) {
	const fields = [{
		name: 'Result',
		value: `${result}`,
		inline: true,
	}];

	// Push these separately to ensure order
	if (last !== undefined) {
		fields.push({
			name: 'Previous Best',
			value: `${last}`,
			inline: true,
		});
	}

	fields.push({
		name: 'Output',
		value: `${output}`,
	});

	return createBaseEmbed(title, fields);
}

/**
 * Handles a standard roll
 * @param {string} dice The dice roll notation to use
 * @returns {{ result: number, output: string }}
 */
function roll(dice) {
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
 * @returns {{ rerollResult: number, rerollOutput: string}}
 */
function reroll(dice, last) {
	const {result, output} = roll(dice);

	const rerollResult = result >= last ? result : last;
	log(commandName, 'handleReroll rerollResult', rerollResult);

	return {
		rerollResult,
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
		.addStringOption(setNicknameOption),
	async execute(interaction) {
		const dice = interaction.options.getString('dice');
		const nick = interaction.options.getString('nickname');
		const nickname = nick ?? interaction.member.nick;
		const title = `${nickname}'s roll!`;
		let rerolled = 0;

		try {
			const {result, output} = roll(dice);
			let currentBest = result;

			const actionRow = new ActionRowBuilder().addComponents(
				createRerollButton(),
				createAcceptButton(),
			);

			const message = await interaction.reply({
				embeds: [createRollEmbed(title, result, output)],
				components: [actionRow],
			});

			const collector = message.createMessageComponentCollector({time: 15000});

			collector.on('collect', async i => {
				if (i.user.id !== interaction.user.id) {
					i.reply({content: 'This isn\'t your roll!', ephemeral: true});
					return;
				}

				if (i.customId === ACCEPT_BUTTON_ID) {
					collector.stop('accept');
					return;
				}

				if (i.customId === REROLL_BUTTON_ID) {
					const {rerollResult, criticalReroll, rerollOutput} = reroll(dice, currentBest);

					if (criticalReroll) {
						collector.stop('critical-failure');
						return;
					}

					try {
						await i.update({
							content: `Rerolled ${++rerolled} times!`,
							embeds: [
								createRollEmbed(
									title,
									rerollResult,
									rerollOutput,
									currentBest,
								),
							],
							components: [actionRow],
						});

						currentBest = rerollResult;
					} catch (err) {
						error(commandName, 'Error updating interaction', err);
						collector.stop('error');
					}
				}
			});

			collector.on('end', async (collected, reason) => {
				log(commandName, 'collector end', {reason, collected});

				message.interaction.editReply({
					content: `Final result (rerolled ${rerolled} times)!`,
					embeds: [
						createBaseEmbed(
							`${nickname}'s  roll!`,
							[{
								name: 'Result',
								value: `${currentBest}`,
							}],
						),
					],
					components: [],
				});
			});
		} catch (err) {
			error(commandName, 'error replying to interaction', err);
		}
	},
};
