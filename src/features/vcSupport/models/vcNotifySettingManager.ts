import * as fs from "fs"
import * as path from "path"

import { BaseGuildVoiceChannel, Guild, GuildTextBasedChannel } from "discord.js"

import bot from "../../../bot"
import { Config } from "../../../config/config"
import logger from "../../../utils/logger"


const notifySettingDirName = path.join(Config.GUILDS_SETTINGS_DIRNAME)
if (!fs.existsSync(notifySettingDirName)) {
    fs.mkdirSync(notifySettingDirName, { recursive: true })
    logger.info("通知設定フォルダを作成しました")
}


export class vcNotifySettingManager {
    private _guildId: string
    private _vcNotifyChannelIdMap: Map<string, string>

    private _defaultChannelId: string | undefined

    constructor(guildId: string) {
        this._guildId = guildId
        this._vcNotifyChannelIdMap = new Map<string, string>()
        this.loadFile()

    }

    /**
     * 通知チャンネルを設定
     * @param voiceChannel ボイスチャンネル（ステージ含む）
     * @param notifyChannel 通知チャンネル
     */
    public setNotifyChannel(voiceChannel: BaseGuildVoiceChannel, notifyChannel: GuildTextBasedChannel) {
        this._vcNotifyChannelIdMap.set(voiceChannel.id, notifyChannel.id)
    }

    /**
     * 通知チャンネルを取得
     * @param voiceChannel 通知チャンネルを取得するボイスチャンネル
     * @returns 通知チャンネル
     */
    public getNotifyChannel(voiceChannel: BaseGuildVoiceChannel): GuildTextBasedChannel {
        const notifyChannelId = this._vcNotifyChannelIdMap.get(voiceChannel.id)
        if (notifyChannelId)
            return this.getChannelFromChannelId(notifyChannelId)
        else {
            const defaultChannel = this._defaultChannelId ? this.getChannelFromChannelId(this._defaultChannelId) : null
            if (defaultChannel) {
                return defaultChannel;
            }
            const systemChannel = this.getGuild().systemChannel
            if (!systemChannel)
                throw new Error("SystemChannel not found")
            return systemChannel
        }
    }

    /**
     * デフォルトの通知チャンネルを設定する
     * @param channel デフォルト通知チャンネル
     */
    public setDefaultNotifyChannel(channel: GuildTextBasedChannel) {
        this._defaultChannelId = channel.id
    }

    /**
     * チャンネルIDからチャンネルを取得する
     * @param channelId チャンネルID
     * @returns チャンネルオブジェクト
     */
    private getChannelFromChannelId(channelId: string): GuildTextBasedChannel {
        const channel = this.getGuild().channels.cache.get(channelId)
        if (!channel)
            throw new Error("Channel not found")
        if (!channel.isTextBased())
            throw new Error("Channel isn't GuildTextBasedChannel")

        return channel
    }

    /**
     * ギルドオブジェクトの取得
     */
    private getGuild(): Guild {
        const guild = bot.guilds.cache.get(this._guildId)
        if (!guild)
            throw new Error("Guild not found")
        return guild
    }

    private getFilePath(): string {
        return path.join(notifySettingDirName, `${this._guildId}.json`)
    }

    private saveFile() {
        // TODO ファイル書き込みを追加
        const notifyChannelObj = Object.fromEntries(this._vcNotifyChannelIdMap)
        const saveObject = {
            "defaultChannelId": this._defaultChannelId,
            "notifyChannelMap": notifyChannelObj
        }
        const jsonData = JSON.stringify(saveObject, null, 2)

        fs.writeFileSync(this.getFilePath(), jsonData, "utf8")
    }

    private loadFile() {
        try {
            const jsonData = fs.readFileSync(this.getFilePath(), "utf8")
            const obj = JSON.parse(jsonData)
            this._defaultChannelId = obj["defaultChannelId"]
            this._vcNotifyChannelIdMap = new Map<string, string>(Object.entries(obj["notifyChannelMap"]))
        } catch {
            logger.error("ファイル読み込みに失敗しました")
        }

    }
}

export const notifyChannelMap = new Map<string, vcNotifySettingManager>()