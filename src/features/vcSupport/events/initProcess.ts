import bot from "../../../bot"
import { EventSetting } from "../../../models/eventSetting"
import logger from "../../../utils/logger"
import { notifyChannelMap, vcNotifySettingManager } from "../models/vcNotifySettingManager"

export const eventSetting = new EventSetting("once", "ready")


export const handler = async () => {
    // 接続ギルド毎に設定ファイルを生成
    bot.guilds.cache.forEach(guild => {
        const guildId = guild.id
        notifyChannelMap.set(guildId, new vcNotifySettingManager(guildId))
        logger.info(guild.name)
    })
}