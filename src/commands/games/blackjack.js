const {
  SlashCommandBuilder, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { startGame, checkNaturals, playerHit, playerStand, playerDoubleDown } = require('../../utils/blackjackLogic');
const { formatHand } = require('../../utils/deck');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeButtons(userId, canDouble, disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`bj:hit:${userId}`)
      .setLabel('Hit')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`bj:stand:${userId}`)
      .setLabel('Stand')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`bj:double:${userId}`)
      .setLabel('Double Down')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled || !canDouble),
  );
}

const RESULT_COLOR = {
  player_win: 0x57F287,
  blackjack:  0xFEE75C,
  dealer_win: 0xED4245,
  push:       0x95A5A6,
};

const RESULT_TEXT = {
  player_win: '🎉 ¡Ganaste!',
  blackjack:  '🃏 ¡Blackjack! ¡Ganaste!',
  dealer_win: '💀 El dealer gana.',
  push:       '🤝 Empate.',
};

function buildEmbed(state, gameOver = false) {
  const color = gameOver && state.result ? RESULT_COLOR[state.result] : 0x5865F2;

  const embed = new EmbedBuilder()
    .setTitle('♠ Blackjack')
    .setColor(color)
    .addFields(
      { name: 'Tu mano',          value: formatHand(state.playerHand),                      inline: false },
      { name: 'Mano del dealer',  value: formatHand(state.dealerHand, !gameOver),            inline: false },
    );

  if (state.doubled) embed.setFooter({ text: 'Double Down' });
  if (gameOver && state.result) embed.setDescription(RESULT_TEXT[state.result] ?? 'Fin del juego.');

  return embed;
}

// ── Slash command ─────────────────────────────────────────────────────────────

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Juega una partida de Blackjack contra el dealer.'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const games  = interaction.client.activeGames;

    if (games.has(`bj:${userId}`)) {
      return interaction.reply({ content: 'Ya tienes una partida de Blackjack activa. ¡Termínala primero!', ephemeral: true });
    }

    const state   = startGame();
    const natural = checkNaturals(state);

    if (natural) {
      return interaction.reply({ embeds: [buildEmbed(state, true)] });
    }

    games.set(`bj:${userId}`, state);
    await interaction.reply({
      embeds:     [buildEmbed(state, false)],
      components: [makeButtons(userId, true)],
    });
  },

  // ── Button handler (called from interactionCreate) ────────────────────────
  async handleButton(interaction) {
    const [, action, ownerId] = interaction.customId.split(':');
    const userId = interaction.user.id;

    if (userId !== ownerId) {
      return interaction.reply({ content: '¡Este no es tu juego!', ephemeral: true });
    }

    const games = interaction.client.activeGames;
    const state = games.get(`bj:${userId}`);

    if (!state) {
      return interaction.reply({ content: 'No tienes una partida activa. Usa /blackjack para empezar.', ephemeral: true });
    }
    if (state.status === 'finished') {
      games.delete(`bj:${userId}`);
      return interaction.reply({ content: 'Esa partida ya terminó.', ephemeral: true });
    }

    if (action === 'hit')    playerHit(state);
    if (action === 'stand')  playerStand(state);
    if (action === 'double') playerDoubleDown(state);

    const gameOver  = state.status === 'finished';
    const canDouble = !gameOver && state.playerHand.length === 2;
    const embed     = buildEmbed(state, gameOver);
    const row       = makeButtons(userId, canDouble, gameOver);

    if (gameOver) games.delete(`bj:${userId}`);

    await interaction.update({ embeds: [embed], components: [row] });
  },
};
