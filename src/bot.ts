
import * as fs from "fs"
import * as path from "path"

import { GatewayIntentBits, Client, Partials, Interaction, CommandInteraction } from "discord.js"

import logger from "./utils/logger"
import { vcNotifySettingManager } from "./models/vcNotifySettingManager"
import { EventSetting } from "./models/eventSetting"

//Botで使うGatewayIntents、partials
const bot = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel],
})

const featuresDir = path.join(__dirname, "features")

const command_list = Array()
fs.readdirSync(featuresDir).forEach(feature => {
    loadEvents(featuresDir, feature)

    loadCommands(featuresDir, feature)
})

const notifyChannelMap = new Map<string, vcNotifySettingManager>()

//Botがきちんと起動したか確認
const botReadyPromise = new Promise<Client>((resolve, reject) => {
    bot.once("ready", () => {
        logger.info("Ready!")
        if (bot.user) {
            logger.info(bot.user.tag)
        }

        // 接続ギルド毎の処理
        bot.guilds.cache.forEach(guild => {
            const guildId = guild.id
            notifyChannelMap.set(guildId, new vcNotifySettingManager(guildId))
            bot.application?.commands.set(command_list, guildId)
        })
    })
})

export { bot, botReadyPromise, notifyChannelMap }

function loadEvents(featuresDir: string, dirName: string) {
    const eventsPath = path.join(featuresDir, dirName, "events")

    // eventsディレクトリ内のすべてのファイルを自動的に登録
    logger.info("load events")
    if (!fs.existsSync(eventsPath))
        return

    fs.readdirSync(eventsPath).forEach(file => {
        if (!isTargetFile(file)) return

        const event = require(path.join(eventsPath, file)) // モジュールを読み込む
        logger.info(file)

        const eventSetting = event.eventSetting as EventSetting

        bot[eventSetting.listenerType](eventSetting.eventName, async (...args) => {
            if (!event.handler)
                return

            try {
                event.handler(...args)
            } catch (error) {
                logger.error(`Event: ${eventSetting.eventName} error occurred`, error)
            }
        }
        )
    })
}

function loadCommands(featuresDir: string, dirName: string) {
    const commandsPath = path.join(featuresDir, dirName, "commands")

    // commandsディレクトリ内のファイルを自動的に登録
    if (!fs.existsSync(commandsPath))
        return

    logger.info("load slash commands")
    fs.readdirSync(commandsPath).forEach(file => {
        if (!isTargetFile(file)) return

        const command = require(path.join(commandsPath, file))
        logger.info(file)

        if (!command.command)
            return

        logger.debug(command.command)
        command_list.push(command.command)

        bot.on("interactionCreate", async (interaction: Interaction) => {
            if (!interaction.isCommand()) {
                logger.warn(`$interaction: {interaction} はスラッシュコマンドではありません`)
                return
            }
            logger.info(interaction.commandName)
            if (interaction.commandName !== command.command["name"])
                return

            if (!command.handler)
                return

            try {
                command.handler(interaction)
            } catch (error) {
                logger.error(`Event: ${interaction.commandName} error occurred`, error)
            }
        })
    })
}

function isTargetFile(fileName: string) {
    // TypeScript または JavaScript のファイルを対象
    return fileName.endsWith(".ts") || fileName.endsWith(".js")
}