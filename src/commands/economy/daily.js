const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addBalance, dailyCooldownRemaining, setLastDaily, formatMs } = require('../../utils/economy');

const MIN_REWARD = 300;
const MAX_REWARD = 700;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reclama tu recompensa diaria (cooldown: 24 horas).'),

  async execute(interaction) {
    const userId    = interaction.user.id;
    const remaining = dailyCooldownRemaining(userId);

    if (remaining > 0) {
      return interaction.reply({
        content: `⏳ Ya reclamaste tu daily. Vuelve en **${formatMs(remaining)}**.`,
        ephemeral: true,
      });
    }

    const reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;
    const newBal = addBalance(userId, reward);
    setLastDaily(userId);

    const embed = new EmbedBuilder()
      .setTitle('🎁 Recompensa diaria')
      .setDescription(`Recibiste 🪙 **${reward}** monedas.`)
      .setColor(0xEB459E)
      .addFields({ name: 'Saldo actual', value: `🪙 ${newBal.toLocaleString()}`, inline: true })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
