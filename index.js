const lookaymyscore = require("lookatmyscore")
const osu = require('node-osu');
const apikey = require("./config.json").apikey
const token = require("./config.json").token
const Discord = require("discord.js")

const client = new Discord.Client();
client.login(token);

let commandprefix = "ripple!"

const osuApi = new osu.Api(apikey, {
    baseUrl: "http://ripple.moe/api/",
    notFoundAsError: false, // Throw an error on not found instead of returning nothing. (default: true)
    completeScores: false, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
    parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (!message.content.startsWith(commandprefix) || message.author.bot) return;
    const args = message.content.slice(commandprefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const user = message.content.slice(commandprefix.length + command.length + 1);

    switch (command) {
        case("profile"):
            osuApi.apiCall('/get_user', { u: user }).then(user => {
                message.channel.startTyping()
                if (!user[0]) return message.reply("this username does not exist!").then(() => {message.channel.stopTyping()})
                
                //variables
                const userid = user[0].user_id
                const username = user[0].username
                const rank = user[0].pp_rank
                const pp = user[0].pp_raw
                const accuracy = user[0].accuracy
                const lvl = user[0].level
                const playcount = user[0].playcount
                const country = user[0].country
                const countryrank = user[0].pp_country_rank

                var userimage = `http://a.ripple.moe/${userid}`

                //send the embed
                const embed = {
                    embed: {
                    color: "#ff66aa",
                    author: {
                        name: `Ripple! Standard profile for ${username}`,
                        icon_url: `https://osu.ppy.sh/images/flags/${country}.png`,
                        url: `http://ripple.moe/u/${userid}`,
                    },
                    description: `▸ **Official Rank:** ${rank} (${country}#${countryrank}) \n
                                    ▸ **Total PP:** ${parseFloat(pp).toFixed()} \n
                                    ▸ **Level:** ${parseFloat(lvl).toFixed()} (Playcount: ${playcount}) \n
                                    ▸ **Hit Accuracy:** ${parseFloat(accuracy).toFixed(2)}%`,
                    thumbnail: {
                        url: userimage,
                    },
                    timestamp: new Date(),
                    footer: {
                        icon_url: message.author.displayAvatarURL(),
                        text: message.author.tag
                    }
                    }
                }

                message.channel.send(embed).then(() => {
                    message.channel.stopTyping()
                })
                
            });
            break
        case("topplay"):
            osuApi.getUserBest({ u: user }).then(async (score) => {
                message.channel.startTyping()
                if (!score[0]) return message.reply("this username does not exist!").then(() => {message.channel.stopTyping()})
                const json = {
                    "mode": 0,
                    "beatmap_id": score[0].beatmapId,
                    "score": {
                      "username": user,
                          "date": score[0].raw_date,
                          "enabled_mods": score[0].raw_mods,
                          "score": score[0].score,
                          "maxcombo": score[0].maxCombo,
                          "rank": score[0].rank,
                          "count50": score[0].counts['50'],
                          "count100": score[0].counts['100'],
                          "count300": score[0].counts['300'],
                          "countmiss": score[0].counts.miss,
                          "countkatu": score[0].counts.katu,
                          "countgeki": score[0].counts.geki,
                          "pp": score[0].pp
                    }
                }
                const res = await lookaymyscore(json);
                message.channel.send(res.image.url).then(() => {
                    message.channel.stopTyping()
                })
            });
            break
        case ("help"):
            message.channel.send({
                embed: {
                    color: "#ff66aa",
                    title: "osu! commands!",
                    thumbnail: {
                        url: client.user.displayAvatarURL(),
                    },
                    fields: [{
                        name: "**Profile:**",
                        value: "Shows a users playercard",
                        },
                        {
                        name: "**Topplay:**",
                        value: "Shows a users top play",
                        },
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: message.author.displayAvatarURL(),
                        text:  message.author.tag
                    }        
                }
            })
            break   
    }
});