// Require"s and Package"s
const { MessageEmbed, VoiceChannel, GuildChannel } = require("discord.js");
require("dotenv/config");

const pkg = {
  Discord: require("discord.js"),
  Ytdl: require("ytdl-core"),
  Ytsr: require("ytsr"),
};

// Bot
const bot = {
  Client: new pkg.Discord.Client(),
  Config: process.env,
};

// Code
bot.Client.once("ready", (e) => {
  console.log("[GordFing] [INFO] Logged-in Successfully!")

  bot.Client.setInterval(() => {
    const activityNameArray = [
      "Criador: @FelipeTheFat#6869",
      "GordFing!🍪",
      `Servidores: ${bot.Client.guilds.cache.size}`,
      `Usuários: ${bot.Client.users.cache.size}`,
      `Canais: ${bot.Client.channels.cache.size}`
    ];

    const activityTypeArray = [
      "LISTENING",
      "PLAYING",
      "WATCHING"
    ]

    const R1 = Math.floor(Math.random() * activityNameArray.length);
    const R2 = Math.floor(Math.random() * activityTypeArray.length)

    bot.Client.user.setStatus("dnd");
    bot.Client.user.setAFK(false);
    bot.Client.user.setActivity({
      "name": activityNameArray[R1],
      "type": activityTypeArray[R2]
    });
  }, 4500);
});

// Async onMessage() function
bot.Client.on("message", async (msg) => {
  // Ignore"s
  if (msg.author.bot) return;
  if (!msg.guild) return;

  // [MUSIC] "gof!play [URL/NAME]" command
  if (msg.cleanContent.startsWith(bot.Config.BOT_PREFIX + "play")) {
    const vChannel = msg.member.voice.channel;
    const args = msg.content.split(" ").splice(1).join(" ");
    const args2 = msg.content.trim().split(/ +/g);

    // Verify"s
    if (vChannel) {
      if (!args == "") {
        if (!pkg.Ytdl.validateURL(args2[1])) {
          msg.channel
            .send(`>>> **<@${msg.author.id}>**\n***Pesquisando...***`)
            .then(async (m) => {
              const searchF1 = await pkg.Ytsr.getFilters(String(args));
              const searchF = searchF1.get("Type").get("Video");
              const search = await pkg.Ytsr(searchF.url, {
                limit: 5,
                safeSearch: true,
              });

              m.edit(
                new MessageEmbed()
                  .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                  .setTitle("PESQUISA!")
                  .setDescription(`*Sua Pesquisa:* **"${search["originalQuery"]}"**\n**----**\n
                    *1️⃣Titulo:* **${search["items"][0]["title"]}**\n* Canal:* **${(await pkg.Ytdl.getInfo(search["items"][0]["url"])).videoDetails.author.name}**\n\n
                    *2️⃣Titulo:* **${search["items"][1]["title"]}**\n* Canal:* **${(await pkg.Ytdl.getInfo(search["items"][1]["url"])).videoDetails.author.name}**\n\n
                    *3️⃣Titulo:* **${search["items"][2]["title"]}**\n* Canal:* **${(await pkg.Ytdl.getInfo(search["items"][2]["url"])).videoDetails.author.name}**\n\n
                    *4️⃣Titulo:* **${search["items"][3]["title"]}**\n* Canal:* **${(await pkg.Ytdl.getInfo(search["items"][3]["url"])).videoDetails.author.name}**\n\n
                    *5️⃣Titulo:* **${search["items"][4]["title"]}**\n* Canal:* **${(await pkg.Ytdl.getInfo(search["items"][4]["url"])).videoDetails.author.name}**`
                  )
                  .setTimestamp()
                  .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                  .setColor("#00FF00")
              ).then((m2) => {
                m.react("1️⃣")
                  .then(() => m.react("2️⃣"))
                  .then(() => m.react("3️⃣"))
                  .then(() => m.react("4️⃣"))
                  .then(() => m.react("5️⃣"))
                  .then(() => {
                    const filter = (r, u) => {
                      return (
                        ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"].includes(r.emoji.name) &&
                        u.id === msg.author.id
                      );
                    };

                    m.awaitReactions(filter, { max: 1 }).then(async (c) => {
                      const r = c.first();
                      const connect = await vChannel.join()

                      if (r.emoji.name === "1️⃣") {
                        m.delete();

                        const songInfo = await pkg.Ytdl.getInfo(search["items"][0]["url"]);
                        const song = {
                          title: songInfo.videoDetails.title,
                          views: songInfo.videoDetails.viewCount,
                          likes: songInfo.videoDetails.likes,
                          dislikes: songInfo.videoDetails.dislikes,
                          channel: songInfo.videoDetails.author.name,
                          seconds: songInfo.videoDetails.lengthSeconds,
                          image: songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length - 1]["url"],
                          url: songInfo.videoDetails.video_url
                        };

                        const disp = connect.play(pkg.Ytdl(search["items"][0]["url"], {
                          filter: "audioonly",
                          quality: "highestaudio",
                        }));

                        disp.on("start", () => {
                          msg.delete()
                          vChannel.guild.voice.selfDeaf(true)

                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`*Titulo:* **${song.title}**\n*Visualizações:* **${song.views}**\n*Avaliações:*\n👍 **${song.likes}** | 👎 **${song.dislikes}**\n\n*Canal:* **${song.channel}**\n*Duração:* **${song.seconds} segundo(s)**\n*Link:* **${song.url}**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#00FF00")
                          )
                        });

                        disp.on("close", () => {
                          vChannel.guild.voice.selfDeaf(false)

                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`***Musica finalizada com sucesso!***\n\n*Use:* **${bot.Config.BOT_PREFIX}search [pesq]**\n*Use:* **${bot.Config.BOT_PREFIX}play [link]**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#0000FF")
                          );

                          bot.Client.setTimeout(() => {
                            vChannel.leave()
                            msg.channel.send(new MessageEmbed()
                              .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                              .setTitle("MUSICA!")
                              .setImage(song.image)
                              .setDescription(`***Eu sai do canal de voz por inatividade!***\n\n*Use:* **${bot.Config.BOT_PREFIX}search [pesq]**\n*Use:* **${bot.Config.BOT_PREFIX}play [link]**`)
                              .setTimestamp()
                              .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                              .setColor("#0000FF")
                            );
                          }, 1000 * 60 * 15);
                        });
                      } else if (r.emoji.name === "2️⃣") {
                        m.delete();

                        const songInfo = await pkg.Ytdl.getInfo(search["items"][1]["url"]);
                        const song = {
                          title: songInfo.videoDetails.title,
                          views: songInfo.videoDetails.viewCount,
                          likes: songInfo.videoDetails.likes,
                          dislikes: songInfo.videoDetails.dislikes,
                          channel: songInfo.videoDetails.author.name,
                          seconds: songInfo.videoDetails.lengthSeconds,
                          image: songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length - 1]["url"],
                          url: songInfo.videoDetails.video_url
                        };

                        const disp = connect.play(pkg.Ytdl(search["items"][1]["url"], {
                          filter: "audioonly",
                          quality: "highestaudio",
                        }));

                        disp.on("start", () => {
                          msg.delete()
                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`*Titulo:* **${song.title}**\n*Visualizações:* **${song.views}**\n*Avaliações:*\n👍 **${song.likes}** | 👎 **${song.dislikes}**\n\n*Canal:* **${song.channel}**\n*Duração:* **${song.seconds} segundo(s)**\n*Link:* **${song.url}**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#00FF00")
                          );
                        });

                        disp.on("close", () => {
                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`***Musica finalizada com sucesso!***\n\n*Use:* **${bot.Config.BOT_PREFIX}play [URL/NOME]**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#0000FF")
                          );

                          bot.Client.setTimeout(() => {
                            vChannel.leave()
                            msg.channel.send(new MessageEmbed()
                              .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                              .setTitle("MUSICA!")
                              .setImage(song.image)
                              .setDescription(`***Eu sai do canal de voz por inatividade!***\n\n*Use:* **${bot.Config.BOT_PREFIX}search [pesq]**\n*Use:* **${bot.Config.BOT_PREFIX}play [link]**`)
                              .setTimestamp()
                              .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                              .setColor("#0000FF")
                            );
                          }, 1000 * 60 * 15);
                        });
                      } else if (r.emoji.name === "3️⃣") {
                        m.delete();

                        const songInfo = await pkg.Ytdl.getInfo(search["items"][2]["url"]);
                        const song = {
                          title: songInfo.videoDetails.title,
                          views: songInfo.videoDetails.viewCount,
                          likes: songInfo.videoDetails.likes,
                          dislikes: songInfo.videoDetails.dislikes,
                          channel: songInfo.videoDetails.author.name,
                          seconds: songInfo.videoDetails.lengthSeconds,
                          image: songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length - 1]["url"],
                          url: songInfo.videoDetails.video_url
                        };

                        const disp = connect.play(pkg.Ytdl(search["items"][2]["url"], {
                          filter: "audioonly",
                          quality: "highestaudio",
                        }));

                        disp.on("start", () => {
                          msg.delete()
                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`*Titulo:* **${song.title}**\n*Visualizações:* **${song.views}**\n*Avaliações:*\n👍 **${song.likes}** | 👎 **${song.dislikes}**\n\n*Canal:* **${song.channel}**\n*Duração:* **${song.seconds} segundo(s)**\n*Link:* **${song.url}**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#00FF00")
                          );
                        });

                        disp.on("close", () => {
                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`***Musica finalizada com sucesso!***\n\n*Use:* **${bot.Config.BOT_PREFIX}play [URL/NOME]**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#0000FF")
                          );

                          bot.Client.setTimeout(() => {
                            vChannel.leave()
                            msg.channel.send(new MessageEmbed()
                              .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                              .setTitle("MUSICA!")
                              .setImage(song.image)
                              .setDescription(`***Eu sai do canal de voz por inatividade!***\n\n*Use:* **${bot.Config.BOT_PREFIX}search [pesq]**\n*Use:* **${bot.Config.BOT_PREFIX}play [link]**`)
                              .setTimestamp()
                              .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                              .setColor("#0000FF")
                            );
                          }, 1000 * 60 * 15);
                        });
                      } else if (r.emoji.name === "4️⃣") {
                        m.delete();

                        const songInfo = await pkg.Ytdl.getInfo(search["items"][3]["url"]);
                        const song = {
                          title: songInfo.videoDetails.title,
                          views: songInfo.videoDetails.viewCount,
                          likes: songInfo.videoDetails.likes,
                          dislikes: songInfo.videoDetails.dislikes,
                          channel: songInfo.videoDetails.author.name,
                          seconds: songInfo.videoDetails.lengthSeconds,
                          image: songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length - 1]["url"],
                          url: songInfo.videoDetails.video_url
                        };

                        const disp = connect.play(pkg.Ytdl(search["items"][3]["url"], {
                          filter: "audioonly",
                          quality: "highestaudio",
                        }));

                        disp.on("start", () => {
                          msg.delete()
                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`*Titulo:* **${song.title}**\n*Visualizações:* **${song.views}**\n*Avaliações:*\n👍 **${song.likes}** | 👎 **${song.dislikes}**\n\n*Canal:* **${song.channel}**\n*Duração:* **${song.seconds} segundo(s)**\n*Link:* **${song.url}**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#00FF00")
                          );
                        });

                        disp.on("close", () => {
                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`***Musica finalizada com sucesso!***\n\n*Use:* **${bot.Config.BOT_PREFIX}play [URL/NOME]**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#0000FF")
                          );

                          bot.Client.setTimeout(() => {
                            vChannel.leave()
                            msg.channel.send(new MessageEmbed()
                              .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                              .setTitle("MUSICA!")
                              .setImage(song.image)
                              .setDescription(`***Eu sai do canal de voz por inatividade!***\n\n*Use:* **${bot.Config.BOT_PREFIX}search [pesq]**\n*Use:* **${bot.Config.BOT_PREFIX}play [link]**`)
                              .setTimestamp()
                              .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                              .setColor("#0000FF")
                            );
                          }, 1000 * 60 * 15);
                        });
                      } else if (r.emoji.name === "5️⃣") {
                        m.delete();

                        const songInfo = await pkg.Ytdl.getInfo(search["items"][4]["url"]);
                        const song = {
                          title: songInfo.videoDetails.title,
                          views: songInfo.videoDetails.viewCount,
                          likes: songInfo.videoDetails.likes,
                          dislikes: songInfo.videoDetails.dislikes,
                          channel: songInfo.videoDetails.author.name,
                          seconds: songInfo.videoDetails.lengthSeconds,
                          image: songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length - 1]["url"],
                          url: songInfo.videoDetails.video_url
                        };

                        const disp = connect.play(pkg.Ytdl(search["items"][4]["url"], {
                          filter: "audioonly",
                          quality: "highestaudio",
                        }));

                        disp.on("start", () => {
                          msg.delete()
                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`*Titulo:* **${song.title}**\n*Visualizações:* **${song.views}**\n*Avaliações:*\n👍 **${song.likes}** | 👎 **${song.dislikes}**\n\n*Canal:* **${song.channel}**\n*Duração:* **${song.seconds} segundo(s)**\n*Link:* **${song.url}**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#00FF00")
                          );
                        });

                        disp.on("close", () => {
                          msg.channel.send(new MessageEmbed()
                            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                            .setTitle("MUSICA!")
                            .setImage(song.image)
                            .setDescription(`***Musica finalizada com sucesso!***\n\n*Use:* **${bot.Config.BOT_PREFIX}play [URL/NOME]**`)
                            .setTimestamp()
                            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                            .setColor("#0000FF")
                          );

                          bot.Client.setTimeout(() => {
                            vChannel.leave()
                            msg.channel.send(new MessageEmbed()
                              .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                              .setTitle("MUSICA!")
                              .setImage(song.image)
                              .setDescription(`***Eu sai do canal de voz por inatividade!***\n\n*Use:* **${bot.Config.BOT_PREFIX}search [pesq]**\n*Use:* **${bot.Config.BOT_PREFIX}play [link]**`)
                              .setTimestamp()
                              .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                              .setColor("#0000FF")
                            );
                          }, 1000 * 60 * 15);
                        });
                      };
                    });
                  });
              });
            });
        } else {
          const args = msg.content.trim().split(/ +/g);
          const connect = await vChannel.join()
          const songInfo = await pkg.Ytdl.getInfo(args[1])
          const song = {
            title: songInfo.videoDetails.title,
            views: songInfo.videoDetails.viewCount,
            likes: songInfo.videoDetails.likes,
            dislikes: songInfo.videoDetails.dislikes,
            channel: songInfo.videoDetails.author.name,
            seconds: songInfo.videoDetails.lengthSeconds,
            image: songInfo.videoDetails.thumbnails[songInfo.videoDetails.thumbnails.length-1]["url"],
            url: songInfo.videoDetails.video_url
          };

          const disp = connect.play(pkg.Ytdl(args[1], {
            filter: "audioonly",
            quality: "highestaudio",
          }));

          disp.on("start", () => {
            msg.delete()
            msg.channel.send(new MessageEmbed()
              .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
              .setTitle("MUSICA!")
              .setImage(song.image)
              .setDescription(`*Titulo:* **${song.title}**\n*Visualizações:* **${song.views}**\n*Avaliações:*\n👍 **${song.likes}** | 👎 **${song.dislikes}**\n\n*Canal:* **${song.channel}**\n*Duração:* **${song.seconds} segundo(s)**\n*Link:* **${song.url}**`)
              .setTimestamp()
              .setFooter(`Comando solicitado por: ${msg.author.tag}`)
              .setColor("#00FF00")
            );
          });

          disp.on("close", () => {
            msg.channel.send(new MessageEmbed()
              .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
              .setTitle("MUSICA!")
              .setImage(song.image)
              .setDescription(`***Musica finalizada com sucesso!***\n\n*Use:* **${bot.Config.BOT_PREFIX}search [pesq]**\n*Use:* **${bot.Config.BOT_PREFIX}play [link]**`)
              .setTimestamp()
              .setFooter(`Comando solicitado por: ${msg.author.tag}`)
              .setColor("#0000FF")
            )

            bot.Client.setTimeout(() => {
              vChannel.leave()
              msg.channel.send(new MessageEmbed()
                .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
                .setTitle("MUSICA!")
                .setDescription(`***Eu sai do canal de voz por inatividade!***\n\n*Use:* **${bot.Config.BOT_PREFIX}play [URL/NOME]**`)
                .setTimestamp()
                .setFooter(`Comando solicitado por: ${msg.author.tag}`)
                .setColor("#0000FF")
              );
            }, 1000 * 60 * 15);
          })
        }
      } else {
        msg.channel.send(
          new MessageEmbed()
            .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
            .setTitle("ERROR")
            .setDescription("***Sintaxe invalida!***\n*USO:* ***gof!play [URL/NOME]***")
            .setTimestamp()
            .setFooter(`Comando solicitado por: ${msg.author.tag}`)
            .setColor("#FF0000")
        );
      }
    } else {
      msg.channel.send(
        new MessageEmbed()
          .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
          .setTitle("ERROR")
          .setDescription("***Você não está no canal de voz!***")
          .setTimestamp()
          .setFooter(`Comando solicitado por: ${msg.author.tag}`)
          .setColor("#FF0000")
      );
    }
  } else if (msg.content == bot.Config.BOT_PREFIX + "join") {
    const vChannel = msg.member.voice.channel;

    if (vChannel) {
      await vChannel.join();

      msg.channel.send(new MessageEmbed()
        .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
        .setTitle("MUSICA!")
        .setDescription("***Conectado ao canal de voz com sucesso!***")
        .setTimestamp()
        .setFooter(`Comando solicitado por: ${msg.author.tag}`)
        .setColor("#00FF00")
      );

    } else {
      msg.channel.send(new MessageEmbed()
        .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
        .setTitle("ERROR")
        .setDescription("***Você não está no canal de voz!***")
        .setTimestamp()
        .setFooter(`Comando solicitado por: ${msg.author.tag}`)
        .setColor("#FF0000")
      );
    };

    // [MUSIC] "gof!stop" command
  } else if (msg.content == bot.Config.BOT_PREFIX + "stop" || msg.content == bot.Config.BOT_PREFIX + "leave") {
    const vChannel = msg.member.voice.channel;
    vChannel.leave();

    // [MUSIC] "gof!search" command
  } else if (msg.content.startsWith(bot.Config.BOT_PREFIX + "search")) {
    const args = msg.content.split(" ").splice(1).join(" ")

    if (!args == "") {
      msg.channel.send(`>>> <@${msg.author.id}>\n***Pesquisando...***`).then(async (m) => {
        const searchF1 = await pkg.Ytsr.getFilters(String(args));
        const searchF = searchF1.get("Type").get("Video");
        const search = await pkg.Ytsr(searchF.url, {
          limit: 5,
        });

        m.edit(new MessageEmbed()
          .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
          .setTitle("PESQUISA!")
          .setDescription(`*Sua Pesquisa:* **"${search["originalQuery"]}"**\n**----**\n*Titulo:* **${search["items"][0]["title"]}**\n*Canal:* **${(await pkg.Ytdl.getInfo(search["items"][0]["url"])).videoDetails.author.name}**\n*URL:* **${search["items"][0]["url"]}**\n\n
            *Titulo:* **${search["items"][1]["title"]}**\n*Canal:* **${(await pkg.Ytdl.getInfo(search["items"][1]["url"])).videoDetails.author.name}**\n*URL:* **${search["items"][1]["url"]}**\n\n
            *Titulo:* **${search["items"][2]["title"]}**\n*Canal:* **${(await pkg.Ytdl.getInfo(search["items"][2]["url"])).videoDetails.author.name}**\n*URL:* **${search["items"][2]["url"]}**\n\n
            *Titulo:* **${search["items"][3]["title"]}**\n*Canal:* **${(await pkg.Ytdl.getInfo(search["items"][3]["url"])).videoDetails.author.name}**\n*URL:* **${search["items"][3]["url"]}**\n\n
            *Titulo:* **${search["items"][4]["title"]}**\n*Canal:* **${(await pkg.Ytdl.getInfo(search["items"][4]["url"])).videoDetails.author.name}**\n*URL:* **${search["items"][4]["url"]}**`)
          .setTimestamp()
          .setFooter(`Comando solicitado por: ${msg.author.tag}`)
          .setColor("#00FF00")
        );
      })
    } else {
      msg.channel.send(new MessageEmbed()
        .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
        .setTitle("ERROR")
        .setDescription("***Você está pesquisando alguma coisa?***")
        .setTimestamp()
        .setFooter(`Comando solicitado por: ${msg.author.tag}`)
        .setColor("#FF0000")
      );
    };
  };

  // [UTILS] "gof!ping" command
  if (msg.content == bot.Config.BOT_PREFIX + "ping") {
    msg.channel.send(`>>> **<@${msg.author.id}>**\n***Pingando...***`)
      .then((m) => {
        m.edit(new MessageEmbed()
          .setAuthor("GordFing", bot.Client.user.avatarURL({ dynamic: true }), "https://discord.com/api/oauth2/authorize?client_id=764227613001908275&permissions=8&scope=bot")
          .setTitle("Ping! 💡 Pong! 🏓")
          .setDescription(`*Gateway Ping:* **${m.createdTimestamp - msg.createdTimestamp}ms**\n*API Ping:* **${Math.round(bot.Client.ws.ping)}ms**`)
          .setTimestamp()
          .setFooter(`Comando solicitado por: ${msg.author.tag}`)
          .setColor("#00FF00")
        );
      });
  };
});

// Login and Other"s
console.clear();
bot.Client.login(bot.Config.BOT_TOKEN);
