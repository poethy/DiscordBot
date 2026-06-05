const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Muestra el top 10 de usuarios con más monedas.'),

  async execute(interaction) {
    await interaction.deferReply();

    const top   = getLeaderboard();
    const MEDALS = ['🥇', '🥈', '🥉'];

    const lines = await Promise.all(
      top.map(async (entry, i) => {
        const user  = await interaction.client.users.fetch(entry.userId).catch(() => null);
        const name  = user ? user.username : `ID: ${entry.userId}`;
        const medal = MEDALS[i] ?? `**${i + 1}.**`;
        return `${medal} **${name}** — 🪙 ${entry.balance.toLocaleString()}`;
      }),
    );

    const embed = new EmbedBuilder()
      .setTitle('🏆 Leaderboard')
      .setDescription(lines.length ? lines.join('\n') : 'No hay datos todavía.')
      .setColor(0xF1C40F)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
