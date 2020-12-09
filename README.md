# Discord NodeJS Bot

A NodeJS Discord bot that can do some stuff to make your life easier.

### Link loading

Have you ever had that you had to click an instagram or facebook links to actually see the video or photo that was posted? 
Those days are no more! 

If someone posts a link and this bot can find the corresponding image or video for it, it will send it as a file to the channel the link was posted in. 

<img src="./examples/facebook link example.gif" width="500"/>

Current supported media types are:
- Facebook videos
- Instagram images
- Instagram videos

### Role management

Let members of your Discord server manage their own roles.

## Setting up

```shell script
# Clone the project
git clone git@github.com:lucasvdh/discord-nodejs-bot.git
cd discord-nodejs-bot
```

To host your own version of this bot you first need a Discord application.

### Discord application setup

You can create a Discord application at https://discord.com/developers/applications/.

Once you've got an application you need to setup the bot for that application. 
You can do that here https://discord.com/developers/applications/{replace_with_your_application_id}/bot

On the same page, copy your bot token and paste it in the `config.json` file.

### Adding the bot to your server
Adding the bot you just created to a server is done via OAuth.

You can do this via the following link:
https://discord.com/api/oauth2/authorize?client_id={replace_with_your_client_id}&permissions=8&scope=bot

### Running the bot

```shell script
# Install node modules
npm install
# Run the bot
node bot.js
```

### Supervisord

A reliable way to run your bot is via [supervisord](http://supervisord.org/).

#### Example config file

```shell script
sudo nano /etc/supervisor/conf.d/discord-nodejs-bot.conf
```

```
[program:discord-nodejs-bot]
directory=/var/www/discord-nodejs-bot
command=node bot.js
autostart=true
autorestart=true
stderr_logfile=/var/log/discord-nodejs-bot.err.log
```