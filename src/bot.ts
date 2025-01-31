
import * as fs from "fs"
import * as path from "path"

import { Client, GatewayIntentBits, Interaction, Partials } from "discord.js"

import { EventSetting } from "./models/eventSetting"
import logger from "./utils/logger"

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

// スラッシュコマンドリスト
const command_list = Array()

fs.readdirSync(featuresDir).forEach(feature => {
    loadEvents(featuresDir, feature)
    loadCommands(featuresDir, feature)
})

//Botが起動したか確認
bot.once("ready", async () => {
    logger.info("Ready!")
    if (bot.user) {
        logger.info(bot.user.tag)
    }
    // スラッシュコマンドをリセット
    logger.info("Reset SlashCommand")
    bot.application?.commands.set([])

    bot.guilds.cache.forEach(async guild => {
        await bot.application?.commands.set(command_list, guild.id)
    })
})

export default bot

/**
 * 指定されたディレクトリ内のイベントを読み込む関数
 * 
 * @param featuresDir - 特徴ファイルが格納されているディレクトリのパス
 * @param dirName - 読み込むイベントが含まれるサブディレクトリの名前
 */
function loadEvents(featuresDir: string, dirName: string) {
    const eventsPath = path.join(featuresDir, dirName, "events")

    if (!fs.existsSync(eventsPath))
        return

    // eventsディレクトリ内のすべてのファイルを自動的に登録
    logger.info("load events")
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
        })
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
                interaction.editReply(`${interaction.commandName}の実行に失敗しました`)
                logger.error(`Event: ${interaction.commandName} error occurred`, error)
            }
        })
    })
}

function isTargetFile(fileName: string) {
    // TypeScript または JavaScript のファイルを対象
    return fileName.endsWith(".ts") || fileName.endsWith(".js")
}