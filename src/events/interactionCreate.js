module.exports = {
  name: 'interactionCreate',
  once: false,

  async execute(interaction) {
    // ── Slash commands ────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        const reply = { content: 'Hubo un error ejecutando ese comando.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    // ── Botones ───────────────────────────────────────────────────
    if (interaction.isButton()) {
      const [prefix] = interaction.customId.split(':');

      if (prefix === 'bj') {
        const { handleButton } = require('../commands/games/blackjack');
        await handleButton(interaction);
        return;
      }

      if (prefix === 'hol') {
        const { handleButton } = require('../commands/games/higherorlower');
        await handleButton(interaction);
        return;
      }
    }
  },
};
