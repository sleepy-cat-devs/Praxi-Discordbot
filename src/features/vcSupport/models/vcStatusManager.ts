import { Guild, GuildMember } from "discord.js"
import logger from "../../../utils/logger"

export class vcStatusManager {
    private _vcStatuses: Map<string, vcStatus>

    constructor() {
        this._vcStatuses = new Map<string, vcStatus>()
    }

    /**
     * VC実行中判定(登録済みか否か)
     * @param channelId チャンネルID
     * @returns 登録済みならばTrue
     */
    public isVcInProgress(channelId: string): boolean {
        return this._vcStatuses.get(channelId) != undefined
    }

    /**
     * VC開始処理
     * @param channelId チャンネルID
     * @returns 
     */
    public initVc(channelId: string) {
        if (this.isVcInProgress(channelId)) {
            logger.debug("")
            return
        }
        this._vcStatuses.set(channelId, new vcStatus())
    }

    /**
     * ボイスチャットの状態を取得する
     * @param channelId チャンネルID
     * @returns 指定ボイスチャット状態インスタンス
     */
    public getVcStatus(channelId: string): vcStatus | undefined {
        return this._vcStatuses.get(channelId)
    }
}

class vcStatus {
    private _memberIds: Set<string>
    private _startTime: Date
    private _vcBeginTime: Date | undefined
    private _totalTime: number

    constructor(vcStartTime: Date = this.now()) {
        this._memberIds = new Set<string>()
        this._startTime = vcStartTime
        this._vcBeginTime = undefined
        this._totalTime = 0
    }

    /**
     * ボイスチャット参加者を記録する
     * @param memberId ユーザーID
     * @returns 
     */
    public addMember(memberId: string) {
        this._memberIds.add(memberId)
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
        this._vcBeginTime = this.now()
    }

    /**
     * ボイスチャット経過時間を記録する
     * @returns 
     */
    public addTotalTime() {
        if (!this._vcBeginTime)
            return
        this._totalTime += this.now().getTime() - this._vcBeginTime.getTime()
    }

    /**
     * 経過時間の日時分秒を算出する
     * @param ms 経過時間ミリ秒(経過時間が自動指定される)
     * @returns 
     */
    public convertMsToHMS(
        ms: number = this._totalTime
    ): { hours: number; minutes: number; seconds: number } {
        const totalSeconds = ms / 1000

        const hours = Math.trunc(totalSeconds / 3600)
        const minutes = Math.trunc((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return {
            hours,
            minutes,
            seconds
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