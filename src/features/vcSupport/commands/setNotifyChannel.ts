/**
 * 通知チャンネルの設定
 */
import { ApplicationCommandOptionType, ApplicationCommandType, CacheType, ChannelType, CommandInteraction, GuildMember, SlashCommandBuilder, TextChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { notifyChannelMap } from "../models/vcNotifySettingManager";
import logger from "../../../utils/logger";

export const command = {
    type: ApplicationCommandType.ChatInput,
    name: "set_notify_channel",
    description: "VC通知をするチャンネルの変更",
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            name: "text_channel",
            description: "TextChannel を選択",
            required: false
        },
        {
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildVoice, ChannelType.GuildStageVoice],
            name: "voice_channel",
            description: "VoiceChannel を選択",
            required: false
        }
    ]
}

export const handler = async (interaction: CommandInteraction<CacheType>) => {
    // TODO 設定処理
    // optionsから値が取得できない
}