import { TextChannel, escapeMarkdown } from "discord.js";

import { Config } from "../config/config";
import logger from "./logger";

/**
 * 
 * @param channel 投稿対象のチャンネル
 * @param message 送信メッセージ
 * @param is_md_escape Markdownエスケープオプション
 * @returns 
 */
export const sendMessage = (
    channel: TextChannel | undefined,
    message: string,
    is_md_escape: boolean = false
): void => {
    if (!channel) {
        logger.warn("送信チャンネルが未定義です")
        return
    }

    if (is_md_escape)
        message = mdEscape(message)

    if (Config.IS_RELEASE) {
        channel.send(message)
    } else {
        logger.debug(`channel:${channel}\nmessage:${message}`)
    }
}

/**
 * 
 * @param text Markdownエスケープ対象テキスト
 * @returns Markdownエスケープ済テキスト
 */
export const mdEscape = (text: string): string => {
    return escapeMarkdown(
        text
            .replace(/#/g, "\\#")           // すべての #をエスケープ
            .replace(/^-#/gm, "\\-#")       // 行頭の -# をエスケープ
    )
}