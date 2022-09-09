const {EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const {DiceRoll} = require('@dice-roller/rpg-dice-roller');

const {addModifier} = require('../lib/add-modifier');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wild')
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

		console.log('[wild] inputs:', {trait, modifier});

		const traitCommand = addModifier(`d${trait}!!`, modifier);
		const wildCardCommand = addModifier('d6!!', modifier);

		console.log('[wild] commands:', {traitCommand, wildCardCommand});

		const traitRoll = new DiceRoll(traitCommand);
		const wildCardRoll = new DiceRoll(wildCardCommand);

		console.log('[wild] rolls:', {traitRoll, wildCardRoll});

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Wild Card Roll!')
			.setAuthor({
				name: 'SWADE Bot',
				iconURL: 'https://cdn-cmhfa.nitrocdn.com/sILXXMmoPZtGHchENBdSFUfGNBQKBJVN/assets/static/optimized/rev-5f0e4a3/wp-content/uploads/2021/03/swade-88x60-1.png',
				url: 'https://github.com/DTCurrie/savager-bot',
			})
			.addFields(
				{name: 'Trait Roll', value: traitRoll.output},
				{name: 'Wild Card Roll', value: wildCardRoll.output},
				{
					name: 'Result',
					value: `${traitRoll.total >= wildCardRoll.total ? traitRoll.total : wildCardRoll.total}`,
				},
			)
			.setTimestamp();

		await interaction.reply({embeds: [embed]});
	},
};
