/**
 * ボイスチャットの開始・終了その他事象について通知する処理
 */

import { GuildTextBasedChannel, VoiceBasedChannel, VoiceState } from "discord.js"
import { EventSetting } from "../../../models/eventSetting"
import logger from "../../../utils/logger"
import { sendMessage } from "../../../utils/message"
import { notifyChannelMap } from "../models/vcNotifySettingManager"
import { endVc, getVcStatus, initVc, vcStatus } from "../models/vcStatusManager"

export const eventSetting = new EventSetting("on", "voiceStateUpdate")

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

/**
 * ユーザーがボイスチャットに参加した際の処理を行う関数
 * @param voiceState - 参加したユーザーのボイスステート情報
 */
function joinVc(voiceState: VoiceState) {
    const voiceChannel = voiceState.channel
    const joinedMember = voiceState.member
    if (!voiceChannel || !joinedMember || joinedMember.user.bot)
        return


    sendMessageToNotifyChannel(
        voiceState,
        `${joinedMember.displayName} が ${voiceChannel} に参加しました`,
        true
    )

    switch (getUserCount(voiceChannel)) {
        // 1名なのでボイスチャットが始まっただけ
        case 1:
            initVc(voiceChannel)
            break
        // 2名なのでボイスチャットの通話が開始された
        case 2:
            getVcStatus(voiceChannel)?.beginVc()
            break
    }

    getVcStatus(voiceChannel)?.addMember(joinedMember)
}

function leaveVc(voiceState: VoiceState) {
    const voiceChannel = voiceState.channel
    const leftMember = voiceState.member
    if (!voiceChannel || !leftMember || leftMember.user.bot)
        return

    logger.info("ユーザーがボイスチャット離脱")
    const targetVcStatus = getVcStatus(voiceChannel)
    if (!targetVcStatus)
        return

    switch (getUserCount(voiceChannel)) {
        // 0名になったのでボイスチャット終了
        case 0:
            endVcPostSummary(targetVcStatus, voiceState)
            break
        // 1名なのでボイスチャット中断
        case 1:
            targetVcStatus.pauseVc()
            break
    }
}


function endVcPostSummary(targetVcStatus: vcStatus, voiceState: VoiceState) {
    const voiceChannel = voiceState.channel
    if (!voiceChannel)
        return
    endVc(voiceChannel)

    // 参加者一覧を取得
    const vcMembers = targetVcStatus.getMembers(voiceState.guild)
    // 参加者1名ならばボイスチャットではない
    if (vcMembers.length == 1)
        return

    // ボイチャ時間を文字列に変換
    const { hours, minutes, seconds, milliseconds } = targetVcStatus.convertMsToHMS()
    const vcPeriodStr = [
        hours > 0 ? `${hours}時間` : "",
        minutes > 0 ? `${minutes}分` : "",
        `${seconds}.${milliseconds}秒`
    ].filter(Boolean).join("");

    // 参加者の名前をコンマ区切りの文字列に変換
    const memberListStr = vcMembers.map(vcMember => vcMember.displayName).join(", ");

    // ボイスチャットの概要テキストを作成
    const summaryMessage = `
${voiceChannel}の通話が終了しました
>>> 通話時間: ${vcPeriodStr}
参加人数: ${vcMembers.length}
参加者: ${memberListStr}
`
    sendMessageToNotifyChannel(voiceState, summaryMessage)
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

/**
 * 指定されたボイスステートに関連する通知チャンネルにメッセージを送信する関数
 * @param voiceState - メッセージを送信するボイスステート情報
 * @param message - 送信するメッセージ内容
 * @param isMdEscape - メッセージ内のMarkdownをエスケープするかどうかのフラグ（デフォルトはfalse）
 */
function sendMessageToNotifyChannel(voiceState: VoiceState, message: string, isMdEscape: boolean = false) {
    sendMessage(getNotifyChannel(voiceState), message, isMdEscape)
}

function getNotifyChannel(voiceState: VoiceState): GuildTextBasedChannel {
    const voiceChannel = voiceState.channel
    if (!voiceChannel)
        throw new Error("Channel not found")

    const notifyChannel
        = notifyChannelMap.get(voiceState.guild.id)?.getNotifyChannel(voiceChannel)

    if (!notifyChannel)
        throw new Error("NotifyChannel not found")

    return notifyChannel
}