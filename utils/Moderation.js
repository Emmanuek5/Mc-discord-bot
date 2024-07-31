const { Client, Message, PermissionsBitField } = require("discord.js");
const Swearwords = require("./swearwords");
const { EmbedBuilder } = require("@discordjs/builders");
const { Database } = require("sqlite3");
const embed = new EmbedBuilder();

class Moderation {
  constructor(filepath, client, db) {
    this.isEnabled = true;
    this.swearwords = new Swearwords(filepath);
    this.db = db;
    this.client = client;
    this.timeoutDurations = [
      5 * 60 * 1000,
      10 * 60 * 1000,
      30 * 60 * 1000,
      60 * 60 * 1000,
    ]; // Timeout durations in milliseconds
    if (this.isEnabled) {
      client.on("messageCreate", (message) => this.handle(message));
    }
  }

  async handle(message) {
    if (!this.isEnabled || message.author.bot) return;

    const db = this.db;
    const user = await this.getUser(message.author.id);

    if (!user) {
      await this.insertUser(message.author.id, message.author.username);
      return;
    }

    const words = message.content.split(" ");
    const userWarnings = user.warns || 0;

    words.forEach(async (word) => {
      if (this.swearwords.isSwear(word.toLowerCase())) {
        if (user.strikes < 5) {
          db.run("UPDATE users SET strikes = strikes + 1 WHERE user_id = ?", [
            message.author.id,
          ]);
          message.reply(
            "Please refrain from using inappropriate language. If you think this is an error, please contact a moderator."
          );
        } else {
          if (userWarnings < 5) {
            db.run(
              "UPDATE users SET strikes = 0, warns = warns + 1 WHERE user_id = ?",
              [message.author.id]
            );
            const timeoutDuration = this.timeoutDurations[userWarnings];
            await this.timeoutUser(message, timeoutDuration);
            this.sendTimeoutMessage(message, userWarnings);
          } else {
            await this.banUser(message);
            this.sendBanMessage(message, userWarnings);
          }
        }
      }
    });
  }

  async getUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM users WHERE user_id = ?",
        userId,
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async insertUser(userId, username) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)",
        [userId, username, 0, 0, "", 0],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async timeoutUser(message, duration) {
    const member = await message.guild.members.fetch(message.author.id);
    member.timeout(duration);
  }

  async banUser(message) {
    const member = await message.guild.members.fetch(message.author.id);
    await member.ban();
    this.db.run(
      "UPDATE users SET strikes = 0, warns = 0 ,banned = 1 WHERE user_id = ?",
      [message.author.id]
    );
  }

  sendTimeoutMessage(message, warns) {
    const embed = new EmbedBuilder()
      .setTitle("You Have Been Warned!")
      .setDescription(
        "You have been warned for using inappropriate language. If you have 5 warnings, you will be banned."
      )
      .setColor(Colors.Orange)
      .addFields([
        {
          name: "Reason",
          value: "You have been warned for using inappropriate language.",
        },
        {
          name: "Strikes",
          value: `${warns + 1}/5`,
        },
      ]);
    message.author.send({ embeds: [embed] }).catch(console.error);
  }

  sendBanMessage(message, warns) {
    const embed = new EmbedBuilder()
      .setTitle("You Have Been Banned!")
      .setColor(Colors.Red)
      .setDescription(
        "The Automod has banned you for using inappropriate language. Please contact an admin if you think this is a mistake."
      )
      .addFields([
        {
          name: "Reason",
          value: "You have been banned for using inappropriate language.",
        },
        {
          name: "Strikes",
          value: `${warns + 1}/5`,
        },
      ]);
    message.author.send({ embeds: [embed] }).catch(console.error);
  }

  isEnabled() {
    return this.isEnabled;
  }

  setEnabled(isEnabled) {
    this.isEnabled = isEnabled;
  }
}

module.exports = Moderation;

module.exports = Moderation;
