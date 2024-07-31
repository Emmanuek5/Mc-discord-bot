const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "chatmod",
  description: "Enable or Disable chatmod",
  aliases: ["cm"],
  usage: "chatmod <on/off> || cm toggle",
  required_permission: PermissionsBitField.Flags.ModerateMembers.toString(),
  async execute(message, args, client) {
    if (args[0] === "on" || args[0] === "off") {
      if (args[0] === "on") {
        client.moderation.setEnabled(true);
        return message.channel.send("Enabled chatmod");
      } else if (args[0] === "off") {
        client.moderation.setEnabled(false);

        return message.channel.send("Disabled chatmod");
      }
    } else if (args[0] === "toggle") {
      if (client.moderation.isEnabled === true) {
        client.moderation.setEnabled(false);
        return message.channel.send("Disabled chatmod");
      } else if (client.moderation.isEnabled === false) {
        client.moderation.setEnabled(true);
        return message.channel.send("Enabled chatmod");
      }
    }

    return message.channel.send("Invalid arguments for " + this.name);
  },
};
