const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandBuilder,
} = require('discord.js');

const {DiceRoll} = require('@dice-roller/rpg-dice-roller');

const {addModifier} = require('../lib/add-modifier');
const {log, error} = require('../lib/logger');
const {createCommandName} = require('../lib/command-name');

const commandName = createCommandName('wild');

/**
 * Creates the roll command embed with the passed trait die and modifier
 *
 * @param {BaseCommandInteraction} interaction The command interaction
 * @param {number} trait The trait die to roll
 * @param {string} modifier The modifier to apply to the roll
 * @returns {EmbedBuilder}
 */
function createEmbed(interaction, trait, modifier) {
	log(commandName, 'inputs', {trait, modifier});

	const traitCommand = addModifier(`d${trait}!!`, modifier);
	const wildCardCommand = addModifier('d6!!', modifier);
	log(commandName, 'commands', {traitCommand, wildCardCommand});

	const traitRoll = new DiceRoll(traitCommand);
	const wildCardRoll = new DiceRoll(wildCardCommand);
	log(commandName, 'rolls', {traitRoll: traitRoll.output, wildCardRoll: wildCardRoll.output});

	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`${interaction.member.nick}'s wild card roll!`)
		.setAuthor({
			name: 'SWADE Bot',
			iconURL: 'https://cdn-cmhfa.nitrocdn.com/sILXXMmoPZtGHchENBdSFUfGNBQKBJVN/assets/static/optimized/rev-5f0e4a3/wp-content/uploads/2021/03/swade-88x60-1.png',
			url: 'https://github.com/DTCurrie/savager-bot',
		})
		.addFields(
			{name: 'Trait Roll', value: traitRoll.output, inline: true},
			{name: 'Wild Card Roll', value: wildCardRoll.output, inline: true},
			{
				name: 'Result',
				value: `${traitRoll.total >= wildCardRoll.total ? traitRoll.total : wildCardRoll.total}`,
			},
		)
		.setTimestamp();
}

/**
 * Replies to the slash command with an embed and button
 *
 * @param {BaseCommandInteraction} interaction The command interaction
 * @param {number} trait The trait die to roll
 * @param {string} modifier The modifier to apply to the roll
 * @returns {Promise<void>}
 */
async function reply(interaction, trait, modifier) {
	let rerolled = 0;
	const actionRow = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('reroll')
				.setLabel('Reroll')
				.setStyle(ButtonStyle.Success),
		);

	const message = await interaction.reply({
		embeds: [createEmbed(interaction, trait, modifier)],
		components: [actionRow],
	});

	const collector = message.createMessageComponentCollector({time: 15000});

	collector.on('collect', async i => {
		await i.update({
			content: `Rerolled ${++rerolled} times!`,
			embeds: [createEmbed(interaction, trait, modifier)],
			components: [actionRow],
		});
	});

	collector.on('end', collected => log(commandName, 'collected items', collected.size));
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
				.setRequired(false)),
	async execute(interaction) {
		const trait = interaction.options.getInteger('trait');
		const modifier = interaction.options.getString('modifier');

		try {
			await reply(interaction, trait, modifier);
		} catch (err) {
			error(commandName, 'error replying to interaction', err);
		}
	},
};
