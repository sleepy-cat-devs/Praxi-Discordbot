/**
 * デフォルト通知チャンネルの設定
 */
import { ChannelType, ChatInputCommandInteraction, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { channelText } from "../../../utils/message";
import { notifyChannelMap } from "../models/vcNotifySettingManager";

export const command = new SlashCommandBuilder()
    .setName("set_default_notify_channel")
    .setDescription("VC通知のデフォルトチャンネルを設定")
    .addChannelOption(option =>
        option.setName("default_notify_channel")
            .setNameLocalization("ja", "デフォルト通知先チャンネル")
            .setDescription("Set default notify target TextChannel (Default: Typing Channel)")
            .setDescriptionLocalization("ja", "デフォルト通知先のチャンネルを選択 (デフォルト: コマンドを実行したチャンネル)")
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText))
    .toJSON()


export const handler = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) {
        interaction.reply("Discordサーバー内でコマンドを実行してください")
        return
    }
    const options = interaction.options

    const default_notify_channel = (options.getChannel("default_notify_channel") ?? interaction.channel) as GuildTextBasedChannel

    if (!default_notify_channel)
        throw new Error("NotifyTextChannel not found")

    notifyChannelMap.get(interaction.guild.id)?.setDefaultNotifyChannel(default_notify_channel)

    interaction.reply(`デフォルト の通知先を ${channelText(default_notify_channel)}に設定しました`)
}