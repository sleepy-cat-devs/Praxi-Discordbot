/**
 * デフォルト通知チャンネルの設定
 */
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import logger from "../../../utils/logger";
import { openAIClient } from "../models/chatGPT";
import { calcFee, trySendTyping } from "../utility/botUtil";

const MAX_MESSAGE_COUNT = 50;
const DEFAULT_MESSAGE_COUNT = 20;

export const command = new SlashCommandBuilder()
    .setName("summarize_messages")
    .setDescription("Summarize latest messages")
    .setDescriptionLocalization("ja", "直近のメッセージをChatGPT-4o-miniで要約します")
    .addNumberOption(option =>
        option.setName("load_message_count")
            .setNameLocalization("ja", "取得するメッセージ数")
            .setDescription(`Set number of load messages:1~${MAX_MESSAGE_COUNT} (default to ${DEFAULT_MESSAGE_COUNT})`)
            .setDescriptionLocalization("ja", `取得するメッセージ数を1~${MAX_MESSAGE_COUNT}個の間で指定してください(デフォルト: ${DEFAULT_MESSAGE_COUNT})`)
            .setRequired(false)
    ).addStringOption(option =>
        option.setName("custom_prompt")
            .setNameLocalization("ja", "カスタムプロンプト")
            .setDescription("Set custom prompt message")
            .setDescriptionLocalization("ja", "カスタムのプロンプトを指定")
            .setRequired(false)
    ).addBooleanOption(option =>
        option.setName("use_bot_message")
            .setNameLocalization("ja", "ボットメッセージを要約に含む")
            .setDescription("Target Bot messages for summary (default: true)")
            .setDescriptionLocalization("ja", "ボットメッセージを要約対象に含める(デフォルト: true)")
            .setRequired(false)
    )
    .toJSON()


export const handler = async (interaction: ChatInputCommandInteraction) => {
    const channel = interaction.channel;
    if (!channel)
        return;

    const fetch_count: number = interaction.options.getNumber("load_message_count") ?? DEFAULT_MESSAGE_COUNT;

    if (fetch_count <= 1 || fetch_count > MAX_MESSAGE_COUNT) {
        interaction.reply(`読み込むメッセージ数は1以上${MAX_MESSAGE_COUNT}以下で指定してください${fetch_count}`);
        return;
    }

    const custom_prompt_message: string = interaction.options.getString("custom_prompt") ?? ""
    const use_bot_message: boolean = interaction.options.getBoolean("use_bot_message") ?? true

    const messages = await channel.messages.fetch({ limit: fetch_count });
    const messageTexts = messages
        .reverse().map(msg => {
            if (msg.author.bot)
                if (use_bot_message)
                    return `${msg.author.displayName}(ボットユーザー): ${msg.content}`
                else
                    return
            return `${msg.author.displayName}: ${msg.content}`
        }
        ).join('\n');

    await interaction.deferReply();
    logger.debug(messageTexts)

    await trySendTyping(channel);

    const response = await openAIClient.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "以下のDiscord上の会話を要約してください 適宜改行を挟んで読みやすくしてください"
            },
            {
                role: "system",
                content: custom_prompt_message
            },
            { role: "user", content: messageTexts }
        ],
        model: "gpt-4o-mini",
        max_tokens: 1000
    });

    const replyMessage: string = response.choices[0].message.content ?? "要約に失敗しました"
    const totalTokens = response.usage?.total_tokens ?? 0;
    logger.info(`消費トークン数: ${totalTokens}`)

    interaction.editReply(
        (custom_prompt_message != "" ? `カスタムプロンプト:${custom_prompt_message}\n` : "")
        + `${replyMessage.replace(/(\r?\n){2,}/g, '\n')}`
        + `\n消費トークン量: ${totalTokens} ≒ ${calcFee(totalTokens) * 100}￠`
    )
}