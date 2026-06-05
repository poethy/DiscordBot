require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs   = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.activeGames = new Map();
client.warnings    = new Map();

// ── Command loader ────────────────────────────────────────────────────────────
client.commands = new Collection();

const commandFolders = fs.readdirSync(path.join(__dirname, 'src', 'commands'));
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, 'src', 'commands', folder))
    .filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./src/commands/${folder}/${file}`);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }
}

// ── Event loader ──────────────────────────────────────────────────────────────
const eventFiles = fs
  .readdirSync(path.join(__dirname, 'src', 'events'))
  .filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.DISCORD_TOKEN);
