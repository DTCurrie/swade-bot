const fs = require('node:fs');
const path = require('node:path');

const {Client, Collection, GatewayIntentBits} = require('discord.js');

const {token} = require('./config.json');

const client = new Client({intents: [GatewayIntentBits.Guilds]});
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
}

client.on('ready', () => {
	console.log('\x1b[32m%s\x1b[0m', `Logged in as ${client.user.tag} in ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} mode!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error('\x1b[31m%s\x1b[0m', error);
		await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
	}
});

client.login(token);

