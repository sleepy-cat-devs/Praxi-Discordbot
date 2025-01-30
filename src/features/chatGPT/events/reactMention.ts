import { Events, Message } from "discord.js";
import { default as bot } from "../../../bot";
import { EventSetting } from "../../../models/eventSetting";
import logger from "../../../utils/logger";
import { openAIClient } from "../models/chatGPT";


export const eventSetting = new EventSetting("on", Events.MessageCreate)

export const handler = async (message: Message) => {
    // 発信元がボット、自ボットユーザーが特定できない、メンションが付与されていない
    if (message.author.bot || !bot.user || !message.mentions.has(bot.user)) return;

    const userMessage = message.content.replace(`<@${bot.user?.id}>`, "").trim();
    if (!userMessage) {
        logger.debug("メッセージがありません")
        return
    }

    await trySendTyping(message.channel)

    if (message.attachments.size > 0) {
        for (const attachment of message.attachments.values()) {
            if (!attachment.contentType?.startsWith("image/"))
                continue

            const visionResponse = await openAIClient.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: userMessage },
                            {
                                type: "image_url",
                                image_url: {
                                    "url": attachment.url,
                                    "detail": "low"
                                },
                            }
                        ],
                    },
                ],
                max_tokens: 1000
            })

            const replyMessage = visionResponse.choices[0].message.content;
            if (!replyMessage)
                return;

            await message.reply(replyMessage);
        }
    } else {
        const response = await openAIClient.chat.completions.create({
            messages: [{ role: "user", content: userMessage }],
            model: "gpt-4o-mini"
        });

        const replyMessage = response.choices[0].message.content;
        if (!replyMessage)
            return;

        await message.reply(replyMessage);
    }

}


/**
 * 入力中を表示可能ならば表示する
 * 全てのチャンネルでTyping表示が出せるわけではない
 * @param channel チャンネルオブジェクト
 */
async function trySendTyping(channel: any) {
    if (typeof channel.sendTyping === "function") {
        await channel.sendTyping();
    }
}