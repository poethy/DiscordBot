require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');

const commands = [];
const commandFolders = fs.readdirSync(path.join(__dirname, 'src', 'commands'));

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, 'src', 'commands', folder))
    .filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./src/commands/${folder}/${file}`);
    if ('data' in command) commands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Registrando ${commands.length} slash commands...`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log(`Se registraron ${data.length} comandos exitosamente.`);
  } catch (err) {
    console.error(err);
  }
})();
