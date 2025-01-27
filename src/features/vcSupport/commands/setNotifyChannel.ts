/**
 * 通知チャンネルの設定
 */
import { BaseGuildVoiceChannel, ChannelType, ChatInputCommandInteraction, GuildMember, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { channelText } from "../../../utils/message";
import { notifyChannelMap } from "../models/vcNotifySettingManager";

export const command = new SlashCommandBuilder()
    .setName("set_notify_channel")
    .setDescription("VC通知のチャンネルを設定")
    .addChannelOption(option =>
        option.setName("notify_channel")
            .setNameLocalization("ja", "通知先チャンネル")
            .setDescription("Set notify target TextChannel (Default: Typing Channel)")
            .setDescriptionLocalization("ja", "通知先のチャンネルを選択 (デフォルト: コマンドを実行したチャンネル)")
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText))
    .addChannelOption(option =>
        option.setName("voice_channel")
            .setNameLocalization("ja", "通知元ボイスチャンネル")
            .setDescription("Set notify source VoiceChannel (Default: Joining Channel)")
            .setDescriptionLocalization("ja", "通知元のボイスチャンネルを選択 (デフォルト: 参加中のチャンネル)")
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildVoice)
            .addChannelTypes(ChannelType.GuildStageVoice)
    ).toJSON()


export const handler = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) {
        interaction.reply("Discordサーバー内でコマンドを実行してください")
        return
    }
    const options = interaction.options

    const exec_user = interaction.member as GuildMember

    const notify_channel = (options.getChannel("notify_channel") ?? interaction.channel) as GuildTextBasedChannel
    const voice_channel = (options.getChannel("voice_channel") ?? exec_user.voice.channel) as BaseGuildVoiceChannel | undefined

    if (!notify_channel)
        throw new Error("NotifyTextChannel not found")

    if (!voice_channel) {
        interaction.reply("通知元チャンネルを指定,または通知元チャンネルに参加した状態で実行してください")
        return
    }

    notifyChannelMap.get(interaction.guild.id)?.setNotifyChannel(voice_channel, notify_channel)

    interaction.reply(`${channelText(voice_channel)} の通知先を ${channelText(notify_channel)}に設定しました`)
}