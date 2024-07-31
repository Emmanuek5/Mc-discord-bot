const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
  name: "play",
  description: "Play a song",
  aliases: ["p", "music"],
  async execute(message, args, client) {
    if (args.length < 1) {
      return message.channel.send("Please provide a song name");
    }

    const { member } = message;
    const embed = new EmbedBuilder();
    const song = args.join(" ");
    const guildId = message.guild.id;
    let player = client.manager.players.get(guildId);

    if (!member.voice.channel) {
      return message.channel.send(
        "❌ You need to be in a voice channel to use this command."
      );
    }

    if (!player) {
      player = client.manager.create({
        guild: guildId,
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
      });
    }

    const songs = await client.manager.search(song);

    if (songs.length === 0) {
      return message.channel.send("❌ No results found");
    }

    const topResults = songs.tracks.slice(0, 5); // Take the top 5 results

    // Create a list of songs to display
    const songList = topResults
      .map((result, index) => `${index} - ${result.title}`)
      .join("\n");

    // Send the list of songs and prompt the user to pick a number
    message.channel.send(
      "🎵 Select a song to play:\n```" + `${songList} \n` + "```"
    );

    // Create a filter for the user's response
    const filter = (response) => {
      return (
        response.author.id === message.author.id &&
        !isNaN(response.content) &&
        response.content >= 0 &&
        response.content < topResults.length
      );
    };

    // Wait for the user's response
    message.channel
      .awaitMessages({ filter, max: 1, time: 20000, errors: ["time"] })
      .then((collected) => {
        const selectedResultIndex = parseInt(collected.first().content);
        const selectedResult = topResults[selectedResultIndex];

        // Add the selected result to the queue
        player.connect();
        player.queue.add(selectedResult);
        if (!player.playing) {
          player.play();
        }
        const { title, uri, author, thumbnail, duration } = selectedResult;

        // Format the duration using the forMatDuration function
        const dur = forMatDuration(duration);

        embed
          .setTitle("🎶 Song Added to Queue")
          .setDescription(`[${title}](${uri})`)
          .addFields(
            { name: "Author", value: author, inline: true },
            { name: "Duration", value: dur, inline: true }
          )
          .setColor(Colors.Green)
          .setThumbnail(thumbnail);
        message.channel.send({ embeds: [embed] });
      })
      .catch(() => {
        message.channel.send("⌛ Time's up! Please try the command again.");
      });
  },
};

function forMatDuration(duration) {
  const minutes = Math.floor(duration / 60000);
  const seconds = ((duration % 60000) / 1000).toFixed(0);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
