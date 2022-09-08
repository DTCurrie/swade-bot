const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  {
    name: "s",
    description: "Makes a wild card roll by adding an exploding d6",
  },
  {
    name: "d",
    description: "Makes a standard roll",
  },
];

const rest = new REST({ version: "10" }).setToken("token");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "s") {
    await interaction.reply("Wild card!");
  }

  if (interaction.commandName === "d") {
    await interaction.reply("Normal roll!");
  }
});

client.login("token");

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
