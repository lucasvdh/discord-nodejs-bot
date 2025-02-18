const Discord = require("discord.js");
const instagramPostData = require('./instagram-post-data');
const facebookPostData = require('./facebook-post-data');

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});


client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    if (config.instagram_link_enabled) {
        let instagramURLMatches = message.content.match(/(http[s]?:\/\/(?:www.)?instagram\.com\/p\/\w{11}\/)/);

        if (instagramURLMatches !== null) {
            console.log(instagramURLMatches[0]);
            instagramPostData(instagramURLMatches[0]).then(post => {
                if (post.file === 'video') {
                    message.channel.send(post.title, {
                        files: [
                            post.link.video
                        ]
                    }).catch(error => {
                        if (typeof error.httpStatus !== "undefined" && error.httpStatus === 413) {
                            message.channel.send('Found the video but it\'s too large to post :man_shrugging: but here\'s the direct link anyway:\n' + post.link.video);
                        } else {
                            message.channel.send('Something went wrong sending the file :man_shrugging: but here\'s the direct link anyway:\n' + post.link.video);
                        }
                    });;
                } else if (post.file === 'instapp:photo') {
                    message.channel.send(post.title, {
                        files: [
                            post.link.image,
                        ]
                    }).catch(error => {
                        if (typeof error.httpStatus !== "undefined" && error.httpStatus === 413) {
                            message.channel.send('Found the video but it\'s too large to post :man_shrugging: but here\'s the direct link anyway:\n' + post.link.image);
                        } else {
                            message.channel.send('Something went wrong sending the file :man_shrugging: but here\'s the direct link anyway:\n' + post.link.image);
                        }
                    });;
                }
            });
        }
    }

    if (config.facebook_link_enabled) {
        let facebookURLMatches = message.content.match(/(http[s]?:\/\/(?:www.)?facebook\.(?:com|nl)\/.+)/);

        if (facebookURLMatches !== null) {
            facebookPostData(facebookURLMatches[0]).then(videoUrl => {
                message.channel.send('Found the video', {
                    files: [
                        videoUrl
                    ]
                }).catch(error => {
                    if (typeof error.httpStatus !== "undefined" && error.httpStatus === 413) {
                        message.channel.send('Found the video but it\'s too large to post :man_shrugging: but here\'s the direct link anyway:\n' + videoUrl);
                    } else {
                        message.channel.send('Something went wrong sending the file :man_shrugging: but here\'s the direct link anyway:\n' + videoUrl);
                    }
                });
            }).catch(error => {
                if (error === 'post_not_found') {
                    message.channel.send('Couldn\'t the find video, is there a more direct to the post?');
                }
                if (error === 'invalid_url') {
                    console.log('Not a valid url', facebookURLMatches[0]);
                }
                if (error === 'video_not_found') {
                    message.channel.send('Couldn\'t the find video.');
                }
                console.log('facebookPostData', error);
            });
        }
    }

    if (config.roles_enabled) {
        let roleMatch = message.content.match(/^-role (.+)$/);

        if (/^-role/.test(message.content) && roleMatch !== null && /role-assignment/.test(message.channel.name)) {
            let role = message.guild.roles.cache.find(r => r.name === roleMatch[1])

            if (typeof role !== "undefined") {
                if (message.member.roles.cache.has(role.id)) {
                    message.member.roles.remove(role).then(() => {
                        message.channel.send('Took away your role!')
                    });
                } else {
                    message.member.roles.add(role).then(() => {
                        message.channel.send('Gave you the role!');
                    });
                }
            } else {
                message.channel.send('Role not found');
            }
        } else if (/^-role$/.test(message.content) && /role-assignment/.test(message.channel.name)) {
            let rolesOverview = "Here is a list of available roles:\n```"

            config.roles.sort().forEach(role => {
                if (typeof config.abbreviations[role] !== "undefined") {
                    config.abbreviations[role].forEach(abbreviation => {
                        rolesOverview += abbreviation + '/ '
                    })
                }
                rolesOverview += role + '\n';
            });

            rolesOverview += '```';

            message.channel.send(rolesOverview);
        }
    }

    // // Also good practice to ignore any message that does not start with our prefix,
    // // which is set in the configuration file.
    // if(!message.content.startsWith(config.prefix)) return;
    //
    // // Here we separate our "command" name, and our "arguments" for the command.
    // // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // // command = say
    // // args = ["Is", "this", "the", "real", "life?"]
    // const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    // const command = args.shift().toLowerCase();
    //
    // // Let's go with a few common example commands! Feel free to delete or change those.
    //
    // if(command === "ping") {
    //     // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    //     // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    //     const m = await message.channel.send("Ping?");
    //     m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
    // }
    //
    // if(command === "say") {
    //     // makes the bot say something and delete the message. As an example, it's open to anyone to use.
    //     // To get the "message" itself we join the `args` back into a string with spaces:
    //     const sayMessage = args.join(" ");
    //     // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    //     message.delete().catch(O_o=>{});
    //     // And we get the bot to say the thing:
    //     message.channel.send(sayMessage);
    // }
    //
    // if(command === "kick") {
    //     // This command must be limited to mods and admins. In this example we just hardcode the role names.
    //     // Please read on Array.some() to understand this bit:
    //     // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    //     if(!message.member.roles.cache.some(r=>["Administrator", "Moderator"].includes(r.name)))
    //         return message.reply("Sorry, you don't have permissions to use this!");
    //
    //     // Let's first check if we have a member and if we can kick them!
    //     // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    //     // We can also support getting the member by ID, which would be args[0]
    //     let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    //     if(!member)
    //         return message.reply("Please mention a valid member of this server");
    //     if(!member.kickable)
    //         return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    //
    //     // slice(1) removes the first part, which here should be the user mention or ID
    //     // join(' ') takes all the various parts to make it a single string.
    //     let reason = args.slice(1).join(' ');
    //     if(!reason) reason = "No reason provided";
    //
    //     // Now, time for a swift kick in the nuts!
    //     await member.kick(reason)
    //         .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    //     message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
    //
    // }
    //
    // if(command === "ban") {
    //     // Most of this command is identical to kick, except that here we'll only let admins do it.
    //     // In the real world mods could ban too, but this is just an example, right? ;)
    //     if(!message.member.roles.cache.some(r=>["Administrator"].includes(r.name)))
    //         return message.reply("Sorry, you don't have permissions to use this!");
    //
    //     let member = message.mentions.members.first();
    //     if(!member)
    //         return message.reply("Please mention a valid member of this server");
    //     if(!member.bannable)
    //         return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");
    //
    //     let reason = args.slice(1).join(' ');
    //     if(!reason) reason = "No reason provided";
    //
    //     await member.ban(reason)
    //         .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    //     message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
    // }
    //
    // if(command === "purge") {
    //     // This command removes all messages from all users in the channel, up to 100.
    //
    //     // get the delete count, as an actual number.
    //     const deleteCount = parseInt(args[0], 10);
    //
    //     // Ooooh nice, combined conditions. <3
    //     if(!deleteCount || deleteCount < 2 || deleteCount > 100)
    //         return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    //
    //     // So we get our messages, and delete them. Simple enough, right?
    //     const fetched = await message.channel.messages.fetch({limit: deleteCount});
    //     message.channel.bulkDelete(fetched)
    //         .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
    // }
});

client.login(config.token);