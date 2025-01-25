import { GuildMember, VoiceBasedChannel, VoiceChannel, VoiceState } from "discord.js"
import logger from "../utils/logger" // ロガーのインポート
import { sendMessage } from "../utils/message"


export const handler = async (oldState: VoiceState, newState: VoiceState) => {
    // ボイチャ参加・退出
    if (oldState.channel != newState.channel) {
        if (newState.channel != null)
            joinVc(newState)
        else if (oldState.channel != null) {
            leaveVc(oldState)
        }
    }
    // 画面共有の開始
    if (oldState.streaming != newState.streaming && newState.streaming) {
        startStreaming(newState)
    }
    // カメラ共有の開始
    if (oldState.selfVideo != newState.selfVideo && newState.selfVideo) {
        startCameraSharing(newState)
    }
}

function joinVc(voiceState: VoiceState) {
    if (!voiceState.member || voiceState.member?.user.bot)
        return

    logger.info("ユーザーがボイスチャット参加")
    logger.debug(voiceState.channelId)
    logger.debug(voiceState.channel?.name)
    sendMessage(undefined, `${voiceState.member.displayName} が ${voiceState.channel} に参加しました`, true)
}

function leaveVc(voiceState: VoiceState) {
    if (voiceState.member?.user.bot)
        return

    logger.info("ユーザーがボイスチャット離脱")
    const userCount = getUserCount(voiceState.channel)
    if (userCount == 0) {

    }
}

function getUserCount(voiceChannel: VoiceBasedChannel | null): number {
    let val = 0
    voiceChannel?.members.forEach(member => {
        if (!member.user.bot) val++
    })
    return val
}

function startStreaming(voiceState: VoiceState) {
}

function startCameraSharing(voiceState: VoiceState) {
}

