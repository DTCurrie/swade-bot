/**
 * A module for creating the `/wild` command for the bot.
 * @module wild
 */

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
const {createBaseEmbed} = require('../embeds/base');

const commandName = createCommandName('wild');
const rerollButtonId = 'reroll';

/**
 * Makes a wild card trait roll
 * @param {number} trait The trait die to roll
 * @param {string} modifier The modifier to apply to the roll
 * @returns {{ result: number, critical: boolean, traitRoll: DiceRoll, wildCardRoll: DiceRoll}}
 */
function handleWilCardRoll(trait, modifier) {
	log(commandName, 'handleWilCardRoll', {trait, modifier});

	const traitCommand = addModifier(`d${trait}!!`, modifier);
	const wildCardCommand = addModifier('d6!!', modifier);
	log(commandName, 'handleWilCardRoll commands', {traitCommand, wildCardCommand});

	const traitRoll = new DiceRoll(traitCommand);
	const wildCardRoll = new DiceRoll(wildCardCommand);
	log(commandName, 'handleWilCardRoll rolls', {traitRoll: traitRoll.output, wildCardRoll: wildCardRoll.output});

	const critical = traitRoll.rolls[0].rolls[0].initialValue === 1 && wildCardRoll.rolls[0].rolls[0].initialValue === 1;
	const result = traitRoll.total >= wildCardRoll.total ? traitRoll.total : wildCardRoll.total;
	log(commandName, 'handleWilCardRoll result', result);

	return {
		result,
		critical,
		traitRoll,
		wildCardRoll,
	};
}

/**
 * Makes a wild card trait reroll
 * @param {number} trait the trait die to reroll
 * @param {modifier} modifier the modifiers to apply to the reroll
 * @returns {{ reroll: number, criticalReroll: boolean, traitReroll: DiceRoll, wildCardReroll: DiceRoll}}
 */
function handleWilCardReroll(trait, modifier, last) {
	const {critical, traitRoll, wildCardRoll} = handleWilCardRoll(trait, modifier);

	const rollTotal = traitRoll.total >= wildCardRoll.total ? traitRoll.total : wildCardRoll.total;
	const reroll = rollTotal >= last ? rollTotal : last;
	log(commandName, 'handleWilCardReroll reroll', reroll);

	return {
		reroll,
		criticalReroll: critical,
		traitReroll: traitRoll,
		wildCardReroll: wildCardRoll,
	};
}

/**
 * Creates the initial wild card embed
 * @param {string} nickname The name to render in the embed
 * @param {number} result the result from the roll
 * @param {DiceRoll} traitRoll the trait die roll
 * @param {DiceRoll} wildCardRoll the wild card die roll
 * @returns {EmbedBuilder}
 */
function createWildCardRollEmbed(nickname, result, traitRoll, wildCardRoll) {
	return createBaseEmbed(`${nickname}'s wild card roll!`, [
		{name: 'Trait Roll', value: traitRoll.output, inline: true},
		{name: 'Wild Card Roll', value: wildCardRoll.output, inline: true},
		{name: 'Result', value: `${result}`},
	]);
}

/**
 * Creates a wild card reroll embed
 * @param {string} nickname The name to render in the embed
 * @param {number} result the result from the reroll
 * @param {DiceRoll} traitRoll the trait die reroll
 * @param {DiceRoll} wildCardRoll the wild card die reroll
 * @param {number} last the last best roll
 * @returns {EmbedBuilder}
 */
function createWildCardRerollEmbed(nickname, result, traitRoll, wildCardRoll, last) {
	return createBaseEmbed(`${nickname}'s wild card roll!`, [
		{name: 'Trait Roll', value: traitRoll.output, inline: true},
		{name: 'Wild Card Roll', value: wildCardRoll.output, inline: true},
		{name: 'Previous Best', value: `${last}`, inline: true},
		{name: 'Result', value: `${result}`},
	]);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Makes a wild card roll by adding an exploding d6!')
		.addIntegerOption(option =>
			option.setName('trait')
				.setDescription('The trait value to use. For example, if you want to roll for a trait with a d8 just enter "8".')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('modifier')
				.setDescription('The modifier to use. For example, you would enter "+1" for a bonus of 1, or "-2" for a penalty of 2.')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('nickname')
				.setDescription('The wild card\'s character name to use for the roll; if blank it will use your server nickname')
				.setRequired(false)),
	async execute(interaction) {
		const trait = interaction.options.getInteger('trait');
		const modifier = interaction.options.getString('modifier');
		const nick = interaction.options.getString('nickname');
		const nickname = nick ?? interaction.member.nick;
		let rerolled = 0;

		try {
			const {result, critical, traitRoll, wildCardRoll} = handleWilCardRoll(trait, modifier);

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
				embeds: [createWildCardRollEmbed(nickname, currentBest, traitRoll, wildCardRoll)],
				components: [actionRow],
			});

			const filter = i => i.customId === rerollButtonId && i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({filter, time: 15000});

			collector.on('collect', async i => {
				if (i.user.id !== interaction.user.id) {
					i.reply({content: 'This isn\'t your roll!', ephemeral: true});
					return;
				}

				const {reroll, criticalReroll, traitReroll, wildCardReroll} = handleWilCardReroll(trait, modifier, currentBest);

				if (criticalReroll) {
					collector.stop('critical-failure');
					return;
				}

				await i.update({
					content: `Rerolled ${++rerolled} times!`,
					embeds: [createWildCardRerollEmbed(nickname, reroll, traitReroll, wildCardReroll, currentBest)],
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
					embeds: [createResultEmbed(`${nickname}'s wild card roll!`, currentBest)],
					components: [],
				});
			});
		} catch (err) {
			error(commandName, 'error replying to interaction', err);
		}
	},
};
