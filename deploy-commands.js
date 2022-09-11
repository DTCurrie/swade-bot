const fs = require('node:fs');
const path = require('node:path');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord.js');
const {clientId, guildId, token} = require('./config.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({version: '10'}).setToken(token);

(async () => {
	try {
		if (process.env.NODE_ENV === 'production') {
			// Uncomment this to delete commands, leaving the `body` array empty deletes all of them
			// await rest.put(Routes.applicationCommands(clientId), {body: []});

			const data = await rest.put(Routes.applicationCommands(clientId), {body: commands});
			console.log(`Successfully registered ${data.length} global application commands.`);
			return;
		}

		// Uncomment this to delete commands, leaving the `body` array empty deletes all of them
		// await rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: []});

		const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands});
		console.log(`Successfully registered ${data.length} guild application commands.`);
	} catch (err) {
		console.error(err);
	}
})();
