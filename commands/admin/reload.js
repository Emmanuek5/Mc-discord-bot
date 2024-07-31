const { PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "reload",
  aliases: ["r"],
  required_permission: PermissionsBitField.Flags.ManageChannels.toString(),
  description: "Reloads commands and interactions",
  async execute(message, args, client) {
    try {
      let start = Date.now();

      // Reload commands
      commands = [];
      client.walkSync(client.commands_folder, commands);
      client.commands = commands;
      client.clearCache(client.commands_folder);

      // Reload interactions
      interactions = [];
      client.walkSync(client.interactions_folder, interactions);
      client.interactions = interactions;
      client.clearCache(client.interactions_folder);

      // Update JSON files
      fs.writeFileSync(
        path.join(__dirname, "../../commands.json"),
        JSON.stringify(client.commands, null, 2)
      );

      fs.writeFileSync(
        path.join(__dirname, "../../interactions.json"),
        JSON.stringify(client.interactions, null, 2)
      );

      let timetaken = Date.now() - start;
      message.channel.send(
        "Reloaded commands and interactions in " + timetaken + "ms"
      );
    } catch (error) {
      message.channel.send("There was an error trying to reload");
      console.error(error);
    }
  },
};
