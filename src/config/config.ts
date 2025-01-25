import dotenv from 'dotenv'

dotenv.config()

if (!process.env.DISCORD_TOKEN) {
    throw new Error('環境変数DISCORD_TOKENが取得できませんでした')
}
const _DISCORD_TOKEN: string = process.env.DISCORD_TOKEN

export class Config {
    static DISCORD_TOKEN: string = _DISCORD_TOKEN
}
