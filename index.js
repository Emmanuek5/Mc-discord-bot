const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
  Colors,
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
  ActivityType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Partials,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const config = require("./config.json");
const COLOURS = require("./utils/colours");
let commands = [];
let interactions = [];
let commands_folder = path.join(__dirname, "commands");
let interactions_folder = path.join(__dirname, "interactions");
const { Manager } = require("erela.js");
const Spotify = require("erela.js-spotify"); // Import the Spotify plugin
const Moderation = require("./utils/Moderation");

const db = new sqlite3.Database("database.db");
const client = new Client({
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message],
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
  ],
});

db.run(`
  CREATE TABLE IF NOT EXISTS tickets (
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    PRIMARY KEY (user_id, channel_id)
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT NOT NULL PRIMARY KEY,  
    name TEXT NOT NULL,
    strikes INTEGER NOT NULL,
    warns INTEGER NOT NULL,
    offences STRING NOT NULL,
    banned INTEGER NOT NULL
  );
`);

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(
    COLOURS.COLORS.applyColor(
      `Uncaught Exception at: ${origin}, reason: ${err}`,
      COLOURS.COLORS.RED_TEXT
    )
  );
});

const walkSync = (dir, array) => {
  let files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkSync(filePath, array);
    } else {
      // Clear the cache for the module
      delete require.cache[require.resolve(filePath)];

      // Now require the module again to load the updated version
      const module = require(filePath);

      // Push the loaded module into the array
      array.push(module);
    }
  });
};

// Add this function to your client code
client.clearCache = (folder) => {
  for (const filePath of Object.keys(require.cache)) {
    if (filePath.startsWith(folder)) {
      delete require.cache[filePath];
    }
  }
};

client.commands_folder = commands_folder;
client.interactions_folder = interactions_folder;
client.walkSync = walkSync;
const spotify = new Spotify({
  clientID: "4565f52db8734b11ab6803f45cae9f03",
  clientSecret: "af5ed8d68e1a44a290d901eb77f6623d",
});
const manager = new Manager({
  nodes: config.lavalink_nodes,
  send(id, payload) {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  },
  plugins: [spotify], // Include the Spotify plugin in the plugins array
  defaultSearchPlatform: "youtube",
  autoPlay: true,
});

client.manager = manager;
client.manager.on("nodeConnect", (node) => {
  console.log(
    COLOURS.COLORS.applyColor(
      `Node: ${node.options.identifier} has connected`,
      COLOURS.COLORS.GREEN_TEXT
    )
  );
});

client.manager.on("nodeError", (node, error) => {
  console.log(
    COLOURS.COLORS.applyColor(
      `Node: ${node.options.identifier} has errored: ${error.message}`,
      COLOURS.COLORS.RED_TEXT
    )
  );
});

client.on("error", (error) => {
  console.log(
    COLOURS.COLORS.applyColor(
      `Client has errored: ${error.message}`,
      COLOURS.COLORS.RED_TEXT
    )
  );
});

client.on("guildMemberAdd", async (member) => {
  const default_roles = config.users.default_roles;
  default_roles.forEach((role) => {
    member.roles.add(member.guild.roles.cache.get(role.id));
  });

  if (
    config.users.welcome_channel &&
    member.guild.channels.cache.get(config.users.welcome_channel)
  ) {
    const channel = member.guild.channels.cache.get(
      config.users.welcome_channel
    );
    const placeholders = ["{username}", "{server}", "{user_id}", "{usercount}"];
    const values = [
      member,
      member.guild.name,
      member.user.id,
      member.guild.memberCount,
    ];
    const welcomeMessage = config.users.welcome_message;
    console.log(welcomeMessage);
    if (welcomeMessage) {
      const emebed = new EmbedBuilder()
        .setAuthor({
          name: member.user.username,
          iconURL: member.user.displayAvatarURL(),
        })
        .setColor("Green")
        .setDescription(
          welcomeMessage.replace(/{.*?}/g, (x) => {
            return placeholders.includes(x)
              ? values[placeholders.indexOf(x)]
              : x;
          })
        )
        .setThumbnail(member.user.displayAvatarURL());
      channel.send({ embeds: [emebed] });
    } else {
      console.log("Welcome message is not configured.");
    }
  }
  //check if the user has been banned before adding them to the database
  let user = db.get("SELECT * FROM users WHERE user_id = ?", [member.user.id]);
  if (user == null) {
    db.run("INSERT INTO users VALUES (?, ?, ?, ?, ?)", [
      member.user.id,
      member.user.username,
      0,
      0,
      "",
      0,
    ]);
  }
  if (user.banned == 1) {
    db.run("UPDATE users SET banned = 0 WHERE user_id = ?", [member.user.id]);
    member.send("You have been unbanned. Lucky you!");
  }
});
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const cmd = commands.find(
    (c) => c.name === command || (c.aliases && c.aliases.includes(command))
  );
  if (!cmd) {
    // Look for a command with the closest name

    let closestCommand = findClosestCommand(command);
    if (closestCommand) {
      message.reply(`Did you mean \`${closestCommand.name}\`?`);
    } else {
      message.reply("Command not found.");
    }
    return;
  }
  if (!message.channel.type == ChannelType.DM && cmd.required_permission) {
    if (
      !message.member.permissions.has(
        PermissionsBitField.resolve(cmd.required_permission)
      )
    ) {
      message.reply(
        `You don't have the required permissions to execute this command.`
      );
      return;
    }
  }
  cmd.execute(message, args, client);
});

client.config = config;
let moderation = new Moderation(
  path.join(__dirname, "./data/swearwords.txt"),
  client,
  db
);

client.on("ready", () => {
  manager.init(client.user.id);
  client.manager = manager;
  client.moderation = moderation;
  const invite_link = client.generateInvite({
    scopes: ["bot", "applications.commands"],
    permissions: [
      PermissionsBitField.Flags.Administrator,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.Connect,
      PermissionsBitField.Flags.Speak,
      PermissionsBitField.Flags.ManageChannels,
      PermissionsBitField.Flags.EmbedLinks,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.MentionEveryone,
      PermissionsBitField.Flags.ManageRoles,
      PermissionsBitField.Flags.ModerateMembers,
      PermissionsBitField.Flags.ManageMessages,
    ],
  });
  let messsage = "------------------------";
  messsage += "\n";
  messsage += `Invite Link: ${invite_link}`;
  messsage += "\n";
  messsage += `Bot Name: ${client.user.username}`;
  messsage += "\n";
  messsage += `Bot ID: ${client.user.id}`;
  messsage += "\n";
  messsage += `Bot Prefix: ${config.prefix}`;
  messsage += "\n";
  messsage += `Made by: Cloven Bots : https://discord.gg/aJA74Vw4`;
  messsage += "\n";

  messsage += "------------------------";
  console.log(COLOURS.COLORS.applyColor(messsage, COLOURS.COLORS.GREEN_TEXT));
  let presence = {
    activities: [
      {
        name: "!m help",
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  };

  client.user.setPresence(presence);
  commands = [];
  interactions = [];
  walkSync(interactions_folder, interactions);
  walkSync(commands_folder, commands);
  commands.reload = () => {
    commands = [];
    walkSync(commands_folder);
  };
  client.commands = commands;
  client.interactions = interactions;

  fs.writeFileSync(
    path.join(__dirname, "commands.json"),
    JSON.stringify(client.commands, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, "interactions.json"),
    JSON.stringify(client.interactions, null, 2)
  );
});

function findClosestCommand(typedCommand) {
  let minDistance = Infinity;
  let closestCommand = null;
  for (const cmd of commands) {
    let distance = levenshteinDistance(typedCommand, cmd.name);
    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        let aliasDistance = levenshteinDistance(typedCommand, alias);
        if (aliasDistance < distance) {
          distance = aliasDistance;
        }
      }
    }
    if (distance < minDistance) {
      minDistance = distance;
      closestCommand = cmd;
    }
  }
  return closestCommand;
}

// Function to calculate Levenshtein distance
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  let dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0) {
        dp[i][j] = j;
      } else if (j === 0) {
        dp[i][j] = i;
      } else if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

client.on("raw", (d) => manager.updateVoiceState(d));

client.login(config.token);
