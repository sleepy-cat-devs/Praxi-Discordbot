import * as fs from "fs"
import * as path from "path"

import { Guild, StageChannel, TextChannel, VoiceChannel } from "discord.js"

import { bot } from "../bot"
import { Config } from "../config/config"
import logger from "../utils/logger"


const notifySettingDirname = path.join(Config.GUILDS_SETTINGS_DIRNAME)
if (!fs.existsSync(notifySettingDirname)) {
    fs.mkdirSync(notifySettingDirname, { recursive: true })
    logger.info("通知設定フォルダを作成しました")
}


export class vcNotifySettingManager {
    private _guildId: string
    private _vcNotifyChannelIdMap: Map<string, string>

    private _defaultChannelId: string

    constructor(guildId: string) {
        this._guildId = guildId

        // TODO ファイルからの設定読み込みを追加

        this._vcNotifyChannelIdMap = new Map<string, string>()

        // 設定ファイルでデフォルトチャンネルを決めて置けるようにする
        const systemChannel = this.getGuild().systemChannel
        if (!systemChannel)
            throw new Error("SystemChannel not found")

        logger.debug(systemChannel.name)

        this._defaultChannelId = systemChannel.id
    }

    /**
     * 通知チャンネルを設定
     * @param voiceChannel ボイスチャンネル（ステージ含む）
     * @param notifyChannel 通知チャンネル
     */
    public setNotifyChannel(voiceChannel: VoiceChannel | StageChannel, notifyChannel: TextChannel) {
        this._vcNotifyChannelIdMap.set(voiceChannel.id, notifyChannel.id)
    }

    /**
     * 通知チャンネルを取得
     * @param voiceChannel 通知チャンネルを取得するボイスチャンネル
     * @returns 通知チャンネル
     */
    public getNotifyChannel(voiceChannel: VoiceChannel | StageChannel): TextChannel {
        const notifyChannelId = this._vcNotifyChannelIdMap.get(voiceChannel.id)
        if (notifyChannelId)
            return this.getChannelFromChannelId(notifyChannelId)
        else
            return this.getChannelFromChannelId(this._defaultChannelId)
    }

    /**
     * デフォルトの通知チャンネルを設定する
     * @param channel デフォルト通知チャンネル
     */
    public setDefaultNotifyChannel(channel: TextChannel) {
        this._defaultChannelId = channel.id
    }

    /**
     * チャンネルIDからチャンネルを取得する
     * @param channelId チャンネルID
     * @returns チャンネルオブジェクト
     */
    private getChannelFromChannelId(channelId: string): TextChannel {
        const channel = this.getGuild().channels.cache.get(channelId)
        if (!channel)
            throw new Error("Channel not found")
        if (!(channel instanceof TextChannel))
            throw new Error("Channel isn't TextChannel")

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

    private saveFile() {
        // TODO ファイル書き込みを追加
    }
}
