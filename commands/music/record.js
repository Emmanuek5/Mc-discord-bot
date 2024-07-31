const {
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} = require("@discordjs/voice");
const {
  PermissionsBitField,
  GuildMember,
  EmbedBuilder,
  AttachmentBuilder,
  Colors,
} = require("discord.js");
const { createListeningStream } = require("../../utils/createListeningStream");
const fs = require("fs");
const { sleep } = require("../../utils/functions");
const path = require("path");
module.exports = {
  name: "record",
  description: "Record your voice channel",
  aliases: ["rec"],
  usage: "record ",
  required_permission: PermissionsBitField.Flags.Administrator.toString(),
  async execute(message, args, client) {
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    let connection = getVoiceConnection(message.guild.id);

    if (!connection) {
      if (
        message.member instanceof GuildMember &&
        message.member.voice.channel
      ) {
        const channel = message.member.voice.channel;
        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          selfDeaf: false,
          selfMute: false,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        let resource = createAudioResource(
          "https://cdn.discordapp.com/attachments/1071848731911147651/1206705691948224642/recording.mp3?ex=65dcfb40&is=65ca8640&hm=ac305a5279608b43e5ee1065b6cf8c8ce2c6e665a2f39c09198abc73d86184af&",
          {
            inlineVolume: true,
          }
        );
        resource.volume.setVolume(2);
        player.play(resource);
        connection.subscribe(player);
      } else {
        await message.reply("Join a voice channel and then try that again!");
        return;
      }
    }

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
      const receiver = connection.receiver;
      embed.setTitle("Recording Started");
      embed.setColor(Colors.Blue);
      embed.setDescription(
        `If u stop speaking for 5 seconds, the recording will end.`
      );
      let m = await message.reply({ embeds: [embed] });
      const filename = await createListeningStream(receiver, message).then(
        async (filename) => {
          embed.setTitle("Recording Complete");
          embed.setColor(Colors.Green);
          embed.setDescription(`Recording complete`);
          attachment.setFile(filename);
          attachment.setName("recording_" + message.channel.id + ".ogg");
          m.edit({ embeds: [embed] });
          m.channel.send({ files: [attachment] });
          await sleep(4000);
          fs.unlinkSync(filename);
          connection.destroy();
        }
      );
    } catch (error) {
      console.warn(error);
      await message.reply("Failed to record, please try again later!");
      return;
    }
  },
};
