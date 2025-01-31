/**
 * 入力中を表示可能ならば表示する
 * 全てのチャンネルでTyping表示が出せるわけではない
 * @param channel チャンネルオブジェクト
 */
export async function trySendTyping(channel: any) {
    if (typeof channel.sendTyping === "function") {
        await channel.sendTyping();
    }
}

/**
 * トークン量から料金を試算
 * @param tokenCount トークン量
 * @returns 
 */
export function calcFee(tokenCount: number) {
    const fee = tokenCount * 0.15 / (10 ** 6)
    return Math.round(fee * 100000) / 100000
}