const { PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "default_role",
  description: "Set the default role for the server",
  options: ["add", "remove", "list"],
  aliases: [],
  required_permission: PermissionsBitField.Flags.ManageChannels.toString(),
  /**
   * Execute function for handling specific commands based on arguments.
   *
   * @param {Object} message - the message object
   * @param {Array} args - array of arguments passed to the function
   * @param {Object} client - the client object
   * @return {void}
   */
  execute(message, args, client) {
    const config = require("../../config.json");
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    ) {
      message.reply("You don't have permission to use this command!");
      return;
    }

    if (args[0] == "remove") {
      const role = message.mentions.roles.first();
      if (!role) {
        message.reply("Please mention a role!");
        return;
      }
      config.users.default_roles.filter((role) => role != role.id);
      fs.writeFileSync(
        path.join(__dirname, "../../config.json"),
        JSON.stringify(config, null, 2)
      );
      message.reply("Default role removed!");
      return;
    }

    if (args[0] == "list") {
      message.reply(
        config.users.default_roles
          .map((role) => `<@&${role.id}>`)
          .join(", ")
          .toString()
      );
      return;
    }

    if (args[0] == "add") {
      const role = message.mentions.roles.first();
      if (!role) {
        message.reply("Please mention a role!");
        return;
      }

      config.users.default_roles.push({
        id: role.id,
        name: role.name,
      });

      fs.writeFileSync(
        path.join(__dirname, "../../config.json"),
        JSON.stringify(config, null, 2)
      );
      message.reply(`Default role added: <@&${role.id}>`);
      return;
    }

    message.reply("Invalid arguments!");
  },
};
