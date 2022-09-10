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

const commandName = createCommandName('roll');

/**
 * Creates the roll command embed with the passed die and modifier
 *
 * @param {BaseCommandInteraction} interaction The command interaction
 * @param {number} die The die to roll
 * @param {string} modifier The modifier to apply to the roll
 * @returns {EmbedBuilder}
 */
function createEmbed(interaction, die, modifier) {
	log(commandName, 'inputs', {die, modifier});

	const command = addModifier(`d${die}`, modifier);
	log(commandName, 'command', command);

	const roll = new DiceRoll(command);
	log(commandName, 'roll', roll.output);

	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`${interaction.member.nick}'s roll!`)
		.setAuthor({
			name: 'SWADE Bot',
			iconURL: 'https://cdn-cmhfa.nitrocdn.com/sILXXMmoPZtGHchENBdSFUfGNBQKBJVN/assets/static/optimized/rev-5f0e4a3/wp-content/uploads/2021/03/swade-88x60-1.png',
			url: 'https://github.com/DTCurrie/savager-bot',
		})
		.addFields(
			{
				name: 'Result',
				value: `${roll.output}`,
			},
		)
		.setTimestamp();
}

/**
 * Replies to the slash command with an embed and button
 *
 * @param {BaseCommandInteraction} interaction The command interaction
 * @param {number} die The die to roll
 * @param {string} modifier The modifier to apply to the roll
 * @returns {Promise<void>}
 */
async function reply(interaction, die, modifier) {
	let rerolled = 0;
	const actionRow = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('reroll')
				.setLabel('Reroll')
				.setStyle(ButtonStyle.Success),
		);

	const message = await interaction.reply({
		embeds: [createEmbed(interaction, die, modifier)],
		components: [actionRow],
	});

	const collector = message.createMessageComponentCollector({time: 15000});

	collector.on('collect', async i => {
		await i.update({
			content: `Rerolled ${++rerolled} times!`,
			embeds: [createEmbed(interaction, die, modifier)],
			components: [actionRow],
		});
	});

	collector.on('end', collected => log(commandName, 'collected items', collected.size));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Makes a standard dice roll!')
		.addIntegerOption(option =>
			option.setName('die')
				.setDescription('The die to use. For example, if you want to roll a d8 just enter "8".')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('modifier')
				.setDescription('The modifier to use. For example, you would enter "+1" for a bonus of 1, or "-2" for a penalty of 2.')
				.setRequired(false)),
	async execute(interaction) {
		const die = interaction.options.getInteger('die');
		const modifier = interaction.options.getString('modifier');

		log(commandName, 'inputs', {die, modifier});

		const command = addModifier(`d${die}`, modifier);
		log(commandName, 'command', command);

		const roll = new DiceRoll(command);
		log(commandName, 'roll', roll.output);

		try {
			await reply(interaction, die, modifier);
		} catch (err) {
			error(commandName, 'error replying to interaction', err);
		}
	},
};
