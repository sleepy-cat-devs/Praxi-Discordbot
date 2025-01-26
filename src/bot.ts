
import * as fs from "fs"
import * as path from "path"

import { GatewayIntentBits, Client, Partials } from "discord.js"

import logger from "./utils/logger"
import { vcNotifySettingManager } from "./models/vcNotifySettingManager"

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

const notifyChannelMap = new Map<string, vcNotifySettingManager>()

//Botがきちんと起動したか確認
const botReadyPromise = new Promise<Client>((resolve, reject) => {
    bot.once("ready", () => {
        logger.info("Ready!")
        if (bot.user) {
            logger.info(bot.user.tag)
        }


        bot.guilds.cache.forEach(guild => {
            const guildId = guild.id
            notifyChannelMap.set(guildId, new vcNotifySettingManager(guildId))
        })
    })
})

// Discordボットのクライアントを作成
const eventsPath = path.join(__dirname, "events")

// eventsディレクトリ内のすべてのファイルを自動的に登録
fs.readdirSync(eventsPath).forEach(file => {
    if (file.endsWith(".ts") || file.endsWith(".js")) { // TypeScript または JavaScript のファイルを対象
        const event = require(path.join(eventsPath, file)) // モジュールを読み込む
        logger.info(file)

        const eventName = file.split(".")[0] // ファイル名から拡張子を除いてイベント名を取得

        bot.on(eventName, async (...args) => {
            if (event.handler) event.handler(...args) // 渡された引数を使って関数を呼び出す
        })
    }
})

export { bot, botReadyPromise, notifyChannelMap }