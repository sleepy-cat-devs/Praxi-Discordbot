import { VoiceState } from 'discord.js'
import { joinVoiceChannel } from '@discordjs/voice'
import logger from '../utils/logger' // ロガーのインポート
// botをインポートする必要がある場合、適宜修正する

let voiceConnection: any = null // エラーハンドリングや型に注意

export const handler = async (oldState: VoiceState, newState: VoiceState) => {
    // ユーザーが新たにボイスチャンネルに参加した場合
    if (!oldState.channel && newState.channel && !newState.member?.user.bot) {
        const voiceChannel = newState.channel

        logger.info(voiceChannel.id)
        // ボイスチャンネルに参加
        voiceConnection = joinVoiceChannel({
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
        })

        logger.info(`参加しました: ${voiceChannel.name}`)
    }

    // ボイスチャンネルから全員が退出した場合
    if (oldState.channel && !newState.channel && voiceConnection) {
        const oldChannel = oldState.channel

        // チャンネルに残っているユーザーを確認
        if (oldChannel.members.filter((member) => !member.user.bot).size === 0) {
            logger.info(`ボイスチャンネルを離れます: ${oldChannel.name}`)
            voiceConnection.destroy() // ボイスチャンネルから切断
            voiceConnection = null
        }
    }
}