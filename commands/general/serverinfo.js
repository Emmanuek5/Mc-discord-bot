const { Message, Client, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "serverinfo",
  description: "Get information about the server",
  /**
   * Asynchronously executes the function.
   *
   * @param {Message} message - The message that triggered the command
   * @param {string[]} args - The arguments provided with the command
   * @param {Client} client - The Discord client
   * @return {void}
   */
  async execute(message, args, client) {
    const BoostsLevel = {
      0: "None",
      1: "Tier 1",
      2: "Tier 2",
      3: "Tier 3",
    };

    const { guild } = message;

    const botsCount = guild.members.cache.filter(
      (member) => member.user.bot
    ).size;
    const humansCount = guild.members.cache.filter(
      (member) => !member.user.bot
    ).size;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL(),
      })
      .setThumbnail(guild.iconURL())
      .addFields(
        {
          name: "Name",
          value: guild.name,
          inline: true,
        },
        {
          name: "ID",
          value: guild.id,
          inline: true,
        },
        {
          name: "Owner",
          value: `<@${guild.ownerId}>`,
          inline: true,
        },
        {
          name: "Members",
          value: guild.memberCount.toString(),
          inline: true,
        },
        {
          name: "Humans",
          value: humansCount.toString(),
          inline: true,
        },
        {
          name: "Bots",
          value: botsCount.toLocaleString(),
          inline: true,
        },
        {
          name: "Boosts",
          value: BoostsLevel[guild.premiumSubscriptionCount],
          inline: true,
        },
        {
          name: "Created",
          value: `<t:${Math.round(guild.createdTimestamp / 1000)}:f>`,
          inline: true,
        }
      )
      .setColor("Blue")
      .setFooter({
        text: `Bot created by: Cloven Bots | https://discord.gg/aJA74Vw4 | ${client.user.username}`,
        iconURL: client.user.displayAvatarURL(),
      });

    message.channel.send({ embeds: [embed] });
  },
};
