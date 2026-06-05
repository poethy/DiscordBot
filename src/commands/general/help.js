const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lista todos los comandos disponibles.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Comandos disponibles')
      .setColor(0x5865F2)
      .setTimestamp();

    for (const [name, command] of interaction.client.commands) {
      embed.addFields({ name: `/${name}`, value: command.data.description });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
