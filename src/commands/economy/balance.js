const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance } = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Muestra tu saldo o el de otro usuario.')
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario a consultar').setRequired(false),
    ),

  async execute(interaction) {
    const target  = interaction.options.getUser('usuario') ?? interaction.user;
    const balance = getBalance(target.id);
    const self    = target.id === interaction.user.id;

    const embed = new EmbedBuilder()
      .setTitle(self ? 'Tu saldo' : `Saldo de ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription(`🪙 **${balance.toLocaleString()}** monedas`)
      .setColor(0xF1C40F)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
