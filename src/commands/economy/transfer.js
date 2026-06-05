const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { deductBalance, addBalance, getBalance } = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfiere monedas a otro usuario.')
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario destinatario').setRequired(true),
    )
    .addIntegerOption(opt =>
      opt.setName('cantidad').setDescription('Cantidad a transferir').setRequired(true).setMinValue(1),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const amount = interaction.options.getInteger('cantidad');

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: 'No puedes transferirte monedas a ti mismo.', ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ content: 'No puedes transferir monedas a un bot.', ephemeral: true });
    }

    const result = deductBalance(interaction.user.id, amount);
    if (result === false) {
      const balance = getBalance(interaction.user.id);
      return interaction.reply({
        content: `Saldo insuficiente. Tienes 🪙 **${balance.toLocaleString()}** monedas.`,
        ephemeral: true,
      });
    }

    const newTargetBal = addBalance(target.id, amount);

    const embed = new EmbedBuilder()
      .setTitle('💸 Transferencia')
      .setColor(0x5865F2)
      .addFields(
        { name: 'De',       value: interaction.user.tag,              inline: true },
        { name: 'Para',     value: target.tag,                        inline: true },
        { name: 'Cantidad', value: `🪙 ${amount.toLocaleString()}`,   inline: true },
        { name: 'Tu saldo', value: `🪙 ${result.toLocaleString()}`,   inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
