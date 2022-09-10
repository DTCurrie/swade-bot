const {EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const {DiceRoll} = require('@dice-roller/rpg-dice-roller');

const {addModifier} = require('../lib/add-modifier');
const {log, error} = require('../lib/logger');

const commandName = 'roll';

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

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Roll!')
			.setAuthor({
				name: 'SWADE Bot',
				iconURL: 'https://cdn-cmhfa.nitrocdn.com/sILXXMmoPZtGHchENBdSFUfGNBQKBJVN/assets/static/optimized/rev-5f0e4a3/wp-content/uploads/2021/03/swade-88x60-1.png',
				url: 'https://github.com/DTCurrie/savager-bot',
			})
			.addFields(
				{name: 'Roll', value: roll.output},
				{
					name: 'Result',
					value: `${roll.total}`,
				},
			)
			.setTimestamp();

		try {
			await interaction.reply({embeds: [embed]});
		} catch (err) {
			error(commandName, 'error replying to interaction', err);
		}
	},
};
