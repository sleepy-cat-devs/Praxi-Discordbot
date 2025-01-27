import { BaseChannel, BaseGuildTextChannel, BaseGuildVoiceChannel, escapeMarkdown, ForumChannel, GuildChannel, GuildTextBasedChannel, TextBasedChannel, TextChannel } from "discord.js";

import { Config } from "../config/config";
import logger from "./logger";

/**
 * 
 * @param channel 投稿対象のチャンネル
 * @param message 送信メッセージ
 * @param isMdEscape Markdownエスケープオプション
 * @returns 
 */
export const sendMessage = (
    channel: GuildTextBasedChannel | undefined,
    message: string,
    isMdEscape: boolean = false
): void => {
    if (!channel) {
        logger.warn("送信チャンネルが未定義です")
        return
    }

    if (isMdEscape)
        message = mdEscape(message)

    if (Config.IS_RELEASE) {
        channel.send(message)
    } else {
        logger.debug(`channel:${channel.name}\nmessage:${message}`)
    }
}

/**
 * 
 * @param text Markdownエスケープ対象テキスト
 * @returns Markdownエスケープ済テキスト
 */
export const mdEscape = (text: string): string => {
    return escapeMarkdown(
        // FIXME 実装に不安あり
        text
            .replace(/^#/g, "\\#")          // 行頭の #をエスケープ
            .replace(/\n#/g, "\n\\#")       // 改行後の #をエスケープ
            .replace(/^-#/gm, "\\-#")       // 行頭の -# をエスケープ
            .replace(/\n-#/gm, "\n\\-#")    // 改行後の -# をエスケープ
    )
}

export const channelText = (channel: GuildTextBasedChannel | BaseGuildVoiceChannel): string => {
    return `<#${channel.id}>`
}