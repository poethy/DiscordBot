const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addBalance, workCooldownRemaining, setLastWork, formatMs } = require('../../utils/economy');

const MIN_REWARD = 50;
const MAX_REWARD = 250;

const JOBS = [
  'Trabajaste de repartidor',
  'Hiciste turnos extra en la tienda',
  'Completaste un freelance',
  'Vendiste artesanías en el mercado',
  'Diste clases particulares',
  'Ayudaste a un vecino con mudanza',
  'Terminaste un proyecto de diseño',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Trabaja para ganar monedas (cooldown: 30 minutos).'),

  async execute(interaction) {
    const userId    = interaction.user.id;
    const remaining = workCooldownRemaining(userId);

    if (remaining > 0) {
      return interaction.reply({
        content: `⏳ Ya trabajaste recientemente. Vuelve en **${formatMs(remaining)}**.`,
        ephemeral: true,
      });
    }

    const reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;
    const newBal = addBalance(userId, reward);
    setLastWork(userId);

    const job   = JOBS[Math.floor(Math.random() * JOBS.length)];

    const embed = new EmbedBuilder()
      .setTitle('💼 Trabajo')
      .setDescription(`${job} y ganaste 🪙 **${reward}** monedas.`)
      .setColor(0x57F287)
      .addFields({ name: 'Saldo actual', value: `🪙 ${newBal.toLocaleString()}`, inline: true })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
