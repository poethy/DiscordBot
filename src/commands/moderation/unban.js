const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbanea a un usuario por su ID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(opt =>
      opt.setName('user_id').setDescription('ID del usuario a desbanear').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('razon').setDescription('Razón del desban').setRequired(false),
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('razon') ?? 'Sin razón especificada';

    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'No tienes permiso para desbanear usuarios.', ephemeral: true });
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'No tengo permiso para desbanear usuarios.', ephemeral: true });
    }

    const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
    if (!ban) return interaction.reply({ content: 'Ese usuario no está baneado.', ephemeral: true });

    await interaction.guild.members.unban(userId, `${interaction.user.tag}: ${reason}`);

    const embed = new EmbedBuilder()
      .setTitle('Usuario desbaneado')
      .setColor(0x57F287)
      .addFields(
        { name: 'Usuario',    value: `${ban.user.tag} (${userId})`, inline: true },
        { name: 'Moderador', value: interaction.user.tag,           inline: true },
        { name: 'Razón',     value: reason },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
