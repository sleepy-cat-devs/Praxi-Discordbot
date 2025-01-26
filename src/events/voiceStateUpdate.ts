import { TextChannel, VoiceBasedChannel, VoiceState } from "discord.js"
import logger from "../utils/logger"
import { sendMessage } from "../utils/message"
import { notifyChannelMap } from "../bot"


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

    sendMessageToNotifyChannel(
        voiceState,
        `${voiceState.member.displayName} が ${voiceState.channel} に参加しました`,
        true
    )
}

function leaveVc(voiceState: VoiceState) {
    if (voiceState.member?.user.bot)
        return

    logger.info("ユーザーがボイスチャット離脱")
    const userCount = getUserCount(voiceState.channel)
    if (userCount == 0) {
        sendMessageToNotifyChannel(
            voiceState,
            "ボイスチャットが終了しました"
        )
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
    sendMessageToNotifyChannel(
        voiceState,
        "画面共有を開始しました"
    )
}

function startCameraSharing(voiceState: VoiceState) {
    sendMessageToNotifyChannel(
        voiceState,
        "カメラ共有を開始しました"
    )
}

function sendMessageToNotifyChannel(voiceState: VoiceState, message: string, isMdEscape: boolean = false) {
    sendMessage(getNotifyChannel(voiceState), message, isMdEscape)
}

function getNotifyChannel(voiceState: VoiceState): TextChannel {
    const voiceChannel = voiceState.channel
    if (!voiceChannel)
        throw new Error("Channel not found")

    const notifyChannel
        = notifyChannelMap.get(voiceState.guild.id)?.getNotifyChannel(voiceChannel)

    if (!notifyChannel)
        throw new Error("NotifyChannel not found")

    return notifyChannel
}