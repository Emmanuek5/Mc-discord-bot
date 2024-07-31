const {
  PermissionsBitField,
  EmbedBuilder,
  Colors,
  ChannelType,
} = require("discord.js");

module.exports = {
  name: "help",
  description: "Get help with commands",
  aliases: ["h"],
  async execute(message, args, client) {
    const commands = client.commands;
    const config = client.config;
    if (message.channel.type == ChannelType.DM) {
      return message.channel.send("This command can only be used in a server!");
    }
    if (args.length > 0) {
      const command = args[0].trim();
      const commandObj = commands.find(
        (c) => c.name === command || (c.aliases && c.aliases.includes(command))
      );

      if (!commandObj) {
        return message.channel.send(
          `There is no command with name or alias \`${command}\`!`
        );
      }

      const embed = new EmbedBuilder().setAuthor({
        name: commandObj.name,
        iconURL: client.user.displayAvatarURL(),
      });
      if (commandObj.description) {
        embed.setDescription(commandObj.description);
      }

      if (commandObj.options && commandObj.options.length > 0) {
        embed.addFields({
          name: "Options",
          value: commandObj.options.map((option) => `\`${option}\``).join(", "),
        });
      }
      if (commandObj.aliases && commandObj.aliases.length > 0) {
        embed.addFields({
          name: "Aliases",
          value: commandObj.aliases.join(", "),
        });
      }

      if (commandObj.usage) {
        embed.addFields({
          name: "Usage",
          value: `\`${config.prefix} ${commandObj.usage}\``,
        });
      }
      embed.setColor("Blue");
      return message.channel.send({ embeds: [embed] });
    }

    let commandstosend = [];

    //check if the user has the required permissions
    for (const command of commands) {
      if (command.required_permission) {
        if (
          !message.member.permissions.has(
            PermissionsBitField.resolve(command.required_permission)
          )
        ) {
          continue;
        }
      }
      commandstosend.push(command);
    }

    let commands_string = "";

    for (const command of commandstosend) {
      commands_string += `**${config.prefix} ${command.name}** - ${command.description}\n`;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Help",
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(commands_string);

    message.channel.send({ embeds: [embed] });
  },
};
