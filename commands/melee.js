/**
 * A module for creating the `/melee` command for the bot.
 * @module melee
 */

const {
	ActionRowBuilder,
	SlashCommandBuilder,
} = require('discord.js');

const {log, error} = require('../lib/logger');
const {createCommandName} = require('../lib/command-name');
const {createTraitResultEmbed} = require('../embeds/trait-result');
const {setTraitOption, setModifierOption, setNicknameOption, getTraitRollOptions} = require('../lib/trait-roll-options');
const {wildCardTraitRoll, wildCardTraitReroll} = require('../lib/rolls');
const {createTraitEmbed} = require('../embeds/trait');
const {createMeleeResultEmbed} = require('../embeds/melee-result');
const {createRerollButton, REROLL_BUTTON_ID} = require('../lib/reroll-button');
const {setParryOption, getParryOption} = require('../lib/melee-roll-options');
const {createAcceptButton, ACCEPT_BUTTON_ID} = require('../lib/accept-button');

const commandName = createCommandName('melee');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Makes a wild card melee roll by adding an exploding d6!')
		.addIntegerOption(setTraitOption)
		.addStringOption(setModifierOption)
		.addIntegerOption(setParryOption)
		.addStringOption(setNicknameOption),
	async execute(interaction) {
		const {trait, modifier, nickname} = getTraitRollOptions(interaction);
		const parry = getParryOption(interaction);
		const title = `${nickname}'s wild card melee roll`;
		let rerolled = 0;

		try {
			const {
				result,
				critical,
				roll,
				wildRoll,
			} = wildCardTraitRoll(commandName, trait, modifier);

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
				embeds: [createTraitEmbed(title, currentBest, roll, wildRoll)],
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
						wildReroll,
					} = wildCardTraitReroll(commandName, trait, modifier, currentBest);

					if (criticalReroll) {
						collector.stop('critical-failure');
						return;
					}

					try {
						await i.update({
							content: `Rerolled ${++rerolled} times!`,
							embeds: [
								createTraitEmbed(
									title,
									rerollResult,
									reroll,
									wildReroll,
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

				if (reason === 'critical-failure') {
					await message.interaction.editReply({
						embeds: [createTraitResultEmbed(`${nickname} critically failed!`, 1)],
						components: [],
					});

					return;
				}

				message.interaction.editReply({
					content: `Final result (rerolled ${rerolled} times)!`,
					embeds: [
						createMeleeResultEmbed(
							`${nickname}'s wild card melee roll!`,
							currentBest,
							parry,
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
