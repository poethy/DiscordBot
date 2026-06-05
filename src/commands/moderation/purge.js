const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Elimina mensajes del canal actual (máx. 100).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('cantidad')
         .setDescription('Cantidad de mensajes a eliminar (1-100)')
         .setRequired(true)
         .setMinValue(1)
         .setMaxValue(100),
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('cantidad');

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: 'No tienes permiso para eliminar mensajes.', ephemeral: true });
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: 'No tengo permiso para eliminar mensajes.', ephemeral: true });
    }

    // bulkDelete filtra automáticamente mensajes de más de 14 días
    const deleted = await interaction.channel.bulkDelete(amount, true);

    await interaction.reply({
      content: `Se eliminaron **${deleted.size}** mensaje(s).`,
      ephemeral: true,
    });
  },
};
