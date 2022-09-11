# SWADE Bot

A quick an dirty discord dice bot for playing Savage Worlds games.

Currently supports:
- `/wild` wild card rolls with re-rolling and critical failures
- `/extra` extra rolls re-rolling and critical failures
- `/roll` standard dice rolls re-rolling

Invite the bot to your server using [this link](https://discord.com/api/oauth2/authorize?client_id=1017897656481230969&scope=applications.commands)!

## Development

Since the bot app requires client and guild credentials, the easiest way to work on the bot will to be to create your own bot, and then use it's credentials.

Once your bot is created, pull down the code and create your own branch/fork. Then create a `config.json` file in the project root and include the following:
```json
{
    "clientId": "<your bot's client ID>",
    "guildId": "<the server you want to use for guild/development commands ID>",
    "token": "<your bots token>"
}
```

Then follow these steps:
1. Install `pnpm`: https://pnpm.io/installation
2. Install dependencies with `pnpm i`
3. Start local bot (points to server you used for the `guildId`) with `npm start`, which will watch for file changes and re-deploy commands before restarting the bot
4. Interactions are logged to the terminal `console`
5. Development commands will have a `-dev` suffix in the server you used for the `guildId`