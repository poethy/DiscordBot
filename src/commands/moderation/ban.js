const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario del servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario a banear').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('razon').setDescription('Razón del ban').setRequired(false),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') ?? 'Sin razón especificada';

    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'No tienes permiso para banear usuarios.', ephemeral: true });
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'No tengo permiso para banear usuarios.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'No se encontró ese usuario en el servidor.', ephemeral: true });
    if (!member.bannable) return interaction.reply({ content: 'No puedo banear a ese usuario.', ephemeral: true });

    await member.ban({ reason: `${interaction.user.tag}: ${reason}` });

    const embed = new EmbedBuilder()
      .setTitle('Usuario baneado')
      .setColor(0xED4245)
      .addFields(
        { name: 'Usuario',    value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Moderador', value: interaction.user.tag,            inline: true },
        { name: 'Razón',     value: reason },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
