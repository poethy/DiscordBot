const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario del servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario a expulsar').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('razon').setDescription('Razón del kick').setRequired(false),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') ?? 'Sin razón especificada';

    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'No tienes permiso para expulsar usuarios.', ephemeral: true });
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'No tengo permiso para expulsar usuarios.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'No se encontró ese usuario en el servidor.', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: 'No puedo expulsar a ese usuario.', ephemeral: true });

    await member.kick(`${interaction.user.tag}: ${reason}`);

    const embed = new EmbedBuilder()
      .setTitle('Usuario expulsado')
      .setColor(0xFEE75C)
      .addFields(
        { name: 'Usuario',    value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Moderador', value: interaction.user.tag,            inline: true },
        { name: 'Razón',     value: reason },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
