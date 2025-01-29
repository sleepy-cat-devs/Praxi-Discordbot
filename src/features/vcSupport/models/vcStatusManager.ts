import { BaseGuildVoiceChannel, Guild, GuildMember } from "discord.js"
import logger from "../../../utils/logger"


const vcStatuses = new Map<string, vcStatus>()


/**
 * ボイスチャットの状態を取得する
 * @param channel チャンネルID
 * @returns 指定ボイスチャット状態インスタンス
 */
export function getVcStatus(channel: BaseGuildVoiceChannel): vcStatus | undefined {
    return vcStatuses.get(channel.id)
}

/**
 * VC開始処理
 * @param channel チャンネルID
 * @returns 
 */
export function initVc(channel: BaseGuildVoiceChannel) {
    if (getVcStatus(channel)) {
        logger.debug("開始済みです")
        return
    }
    vcStatuses.set(channel.id, new vcStatus())
}

export function endVc(channel: BaseGuildVoiceChannel) {
    logger.debug("ボイスチャットを終了")
    vcStatuses.delete(channel.id)
}


export class vcStatus {
    private _memberIds: Set<string>
    private _vcBeginTime: Date | undefined
    private _totalTime: number

    // VC実行中フラグ
    private _isVcInProgress: boolean

    constructor() {
        this._memberIds = new Set<string>()
        this._vcBeginTime = undefined
        this._totalTime = 0
        this._isVcInProgress = false
    }

    /**
     * ボイスチャット参加者を記録する
     * @param member ユーザー
     * @returns 
     */
    public addMember(member: GuildMember) {
        this._memberIds.add(member.id)
    }

    /**
     * ボイスチャット参加者取得
     * @returns 参加者リスト
     */
    public getMembers(guild: Guild): Array<GuildMember> {
        let members = Array<GuildMember>()
        const guildMembersCache = guild.members.cache
        Array.from(this._memberIds).forEach(memberId => {
            const member = guildMembersCache.get(memberId)
            if (member) members.push(member)
        })
        return members
    }

    /**
     * ボイスチャット開始時刻を記録する
     */
    public beginVc() {
        if (this._isVcInProgress) {
            logger.warn("VC継続中に開始しようとしました")
            return
        }
        this._vcBeginTime = this.now()
        this._isVcInProgress = true
    }

    /**
     * ボイスチャット経過時間を記録する
     * @returns 
     */
    public pauseVc() {
        if (!this._vcBeginTime)
            return
        if (!this._isVcInProgress) {
            logger.warn("VC中断中に中断しようとしました")
            return
        }
        this._totalTime += this.now().getTime() - this._vcBeginTime.getTime()
        this._isVcInProgress = false
    }

    /**
     * 経過時間の日時分秒を算出する
     * @param ms 経過時間ミリ秒(経過時間が自動指定される)
     * @returns 
     */
    public convertMsToHMS(
        ms: number = this._totalTime
    ): { hours: number; minutes: number; seconds: number, milliseconds: number } {
        const totalSeconds = ms / 1000

        const hours = Math.trunc(totalSeconds / 3600)
        const minutes = Math.trunc((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        const milliseconds = ms % 1000

        return {
            hours,
            minutes,
            seconds,
            milliseconds
        }

    }

    /**
     * 現在時刻を返却する
     * @returns 現在時刻
     */
    private now(): Date {
        return new Date()
    }
}