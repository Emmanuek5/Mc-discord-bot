module.exports = {
  name: "pause",
  description: "Pause the music",
  aliases: ["resume"],
  async execute(message, args, client) {
    const { member } = message;
    try {
      const player = client.manager.players.get(message.guild.id);
      if (!player) {
        return message.channel.send("No music is playing");
      }
      if (!member.voice.channel) {
        return message.channel.send(
          "❌ You need to be in a voice channel to use this command."
        );
      }

      if (player.paused) {
        player.pause(false);
        return message.channel.send("Music has been resumed");
      } else {
        player.pause(true);
        return message.channel.send("Music has been paused");
      }
    } catch (error) {
      console.log(error);
    }
  },
};
