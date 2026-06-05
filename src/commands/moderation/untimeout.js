const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Quita el silencio a un usuario.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario a dessilenciar').setRequired(true),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tienes permiso para dessilenciar usuarios.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'No se encontró ese usuario en el servidor.', ephemeral: true });
    if (!member.communicationDisabledUntil) {
      return interaction.reply({ content: 'Ese usuario no está silenciado.', ephemeral: true });
    }

    await member.timeout(null);

    const embed = new EmbedBuilder()
      .setTitle('Silencio removido')
      .setColor(0x57F287)
      .addFields(
        { name: 'Usuario',    value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Moderador', value: interaction.user.tag,            inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
