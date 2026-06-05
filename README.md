# PaisaBet — Discord Bot

Un bot de Discord con comandos generales, herramientas de moderación y juegos de cartas interactivos.

---

## Comandos

### General
| Comando | Descripción |
|---|---|
| `/ping` | Muestra la latencia del bot |
| `/help` | Lista todos los comandos disponibles |
| `/serverinfo` | Información del servidor |
| `/userinfo [usuario]` | Información de un usuario |

### Moderación
| Comando | Descripción |
|---|---|
| `/ban <usuario> [razón]` | Banea a un usuario |
| `/unban <user_id> [razón]` | Desbanea a un usuario por ID |
| `/kick <usuario> [razón]` | Expulsa a un usuario |
| `/timeout <usuario> <duración> [razón]` | Silencia a un usuario (1m, 5m, 10m, 1h, 1d, 1w) |
| `/untimeout <usuario>` | Quita el silencio a un usuario |
| `/purge <cantidad>` | Elimina hasta 100 mensajes del canal |
| `/warn <usuario> <razón>` | Registra una advertencia para un usuario |
| `/warnings <usuario>` | Lista las advertencias de un usuario |

### Juegos
| Comando | Descripción |
|---|---|
| `/blackjack` | Juega Blackjack contra el dealer |
| `/higherorlower` | Adivina si la siguiente carta es más alta, baja o igual |

---

## Juegos

### Blackjack
Juego clásico de casino contra el dealer. Se reparten dos cartas a cada uno y puedes elegir entre **Hit** (pedir carta), **Stand** (plantarte) o **Double Down** (doblar la apuesta y recibir una carta). El dealer juega automáticamente hasta alcanzar 17 o más.

### Higher or Lower
Se muestra una carta y debes adivinar si la siguiente es **más alta**, **más baja** o **igual**. Cada acierto suma puntos (adivinar "igual" vale 3 puntos). El juego termina al fallar.

---

## Instalación

### Requisitos
- Node.js 18+
- Una aplicación de Discord ([discord.com/developers](https://discord.com/developers/applications))

### Pasos

1. Clona el repositorio e instala dependencias:
   ```bash
   git clone https://github.com/poethy/DiscordBot.git
   cd DiscordBot
   npm install
   ```

2. Crea un archivo `.env` en la raíz:
   ```
   DISCORD_TOKEN=tu_token_aqui
   CLIENT_ID=tu_application_id
   GUILD_ID=id_de_tu_servidor
   ```

3. En el [portal de desarrolladores](https://discord.com/developers/applications), activa **Server Members Intent** en la sección **Bot → Privileged Gateway Intents**.

4. Registra los slash commands:
   ```bash
   npm run deploy
   ```

5. Arranca el bot:
   ```bash
   npm start
   ```

---

## Stack

- [discord.js v14](https://discord.js.org/)
- [dotenv](https://github.com/motdotla/dotenv)

---

## Apoya el proyecto

Si te gusta el bot puedes invitarme un café ☕

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/poethy)
