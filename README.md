# SWADE Bot

![Docs](https://github.com/DTCurrie/swade-bot/actions/workflows/deploy-docs.yaml/badge.svg)
![Code Quality](https://github.com/DTCurrie/swade-bot/actions/workflows/codeql.yaml/badge.svg)

<p align="center">
  <img title="SWADE" alt="Savage Worlds Adventure Edition Logo" src="https://github.com/DTCurrie/swade-bot/blob/main/assets/swade-logo.png">
</p>

A quick, dirty, and unofficial discord dice bot for playing Savage Worlds Adventure Edition games. [Click here](https://peginc.com/savage-settings/savage-worlds/) to learn more about Savage Worlds, and to order your rule book from the fine folk at Pinnacle Entertainment Group. Or, check out their [free test drive rules](https://peginc.com/store/deadlands-the-weird-west-blood-on-the-range-savage-worlds-test-drive-swade/)!

Currently supports:
- `/wild` wild card rolls with re-rolling and critical failures
- `/extra` extra rolls with re-rolling and critical failures
- `/roll` standard dice rolls with re-rolling

Invite the bot to your server using [this link](https://discord.com/api/oauth2/authorize?client_id=1017897656481230969&scope=applications.commands)!

## Development

Since the bot app requires client and guild credentials, the easiest way to work on the bot will to be to create your own bot, and then use its credentials.

Once your bot is created, pull down the code and create your own branch/fork. Then create a `config.json` file in the project root (it will be ignored by `git`) and include the following:
```json
{
    "clientId": "<your bot's client ID>",
    "guildId": "<the server you want to use for guild/development commands ID>",
    "token": "<your bots token>"
}
```

Then follow these steps:
1. Install `pnpm`: https://pnpm.io/installation
2. Install the dependencies with `pnpm i`
3. Start your local bot with `npm start`, which will watch for file changes and re-deploy commands before restarting the bot
4. Development commands will have a `-dev` suffix and will be deployed to the server you used for the `guildId` in `config.json`
5. Log messages are outputted to the terminal `console`
6. Commands will not become global until the next release

It is recommended you use vscode, project settings are committed in the `.vscode` directory to assist with development.