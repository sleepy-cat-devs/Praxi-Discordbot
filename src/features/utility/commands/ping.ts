import { ApplicationCommandType, CommandInteraction } from "discord.js"

export const command = {
    type: ApplicationCommandType.ChatInput,
    name: "ping",
    description: "botが反応します"
}

export const handler = async (interaction: CommandInteraction) => {
    interaction.reply("眠いからまた後にしてにゃ")
}