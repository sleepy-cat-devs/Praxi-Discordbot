import { Guild } from "discord.js"
import { EventSetting } from "../../../models/eventSetting"
import logger from "../../../utils/logger"
import { notifyChannelMap, vcNotifySettingManager } from "../models/vcNotifySettingManager"

export const eventSetting = new EventSetting("on", "guildCreate")

export const handler = async (guild: Guild) => {
    // ギルドに参加したときに動作する
    // ただし動作未確認
    logger.info(`guild: ${guild.name} joined`)
    notifyChannelMap.set(guild.id, new vcNotifySettingManager(guild.id))
}