/**
 * A module for creating the `/extra` command for the bot.
 * @module extra
 */

const {
	ActionRowBuilder,
	SlashCommandBuilder,
} = require('discord.js');

const {log, error} = require('../lib/logger');
const {createCommandName} = require('../lib/command-name');
const {createTraitResultEmbed} = require('../embeds/trait-result');
const {setTraitOption, setModifierOption, setNicknameOption, getTraitRollOptions} = require('../lib/trait-roll-options');
const {extraTraitRoll, extraTraitReroll} = require('../lib/rolls');
const {createTraitEmbed} = require('../embeds/trait');
const {createRerollButton, REROLL_BUTTON_ID} = require('../lib/reroll-button');
const {createAcceptButton, ACCEPT_BUTTON_ID} = require('../lib/accept-button');

const commandName = createCommandName('extra');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Makes an extra trait roll!')
		.addIntegerOption(setTraitOption)
		.addStringOption(setModifierOption)
		.addStringOption(setNicknameOption),
	async execute(interaction) {
		const {trait, modifier, nickname} = getTraitRollOptions(interaction);
		const title = `${nickname}'s extra roll`;
		let rerolled = 0;

		try {
			const {result, critical, roll} = extraTraitRoll(commandName, trait, modifier);

			if (critical) {
				await interaction.reply({
					embeds: [createTraitResultEmbed(`${nickname} critically failed!`, 1)],
					components: [],
				});
				return;
			}

			let currentBest = result;

			const actionRow = new ActionRowBuilder().addComponents(
				createRerollButton(),
				createAcceptButton(),
			);

			const message = await interaction.reply({
				embeds: [createTraitEmbed(title, result, roll)],
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
					const {
						rerollResult,
						criticalReroll,
						reroll,
					} = extraTraitReroll(commandName, trait, modifier, currentBest);

					if (criticalReroll) {
						collector.stop('critical-failure');
						return;
					}

					try {
						await i.update({
							content: `Rerolled ${++rerolled} times!`,
							embeds: [createTraitEmbed(title, rerollResult, reroll, undefined, currentBest)],
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
				if (reason === 'critical-failure') {
					await message.interaction.editReply({
						embeds: [createTraitResultEmbed(`${nickname} critically failed!`, 1)],
						components: [],
					});
					return;
				}

				message.interaction.editReply({
					content: `Final result (rerolled ${rerolled} times)!`,
					embeds: [createTraitResultEmbed(`${nickname}'s roll!`, currentBest)],
					components: [],
				});
			});
		} catch (err) {
			error(commandName, 'error replying to interaction', err);
		}
	},
};
