import dotenv from "dotenv"
import { Command } from "commander"

dotenv.config()

if (!process.env.DISCORD_TOKEN) {
    throw new Error("環境変数DISCORD_TOKENが取得できませんでした")
}
const _DISCORD_TOKEN: string = process.env.DISCORD_TOKEN


const _CLI_OPTIONS = new Command()
    .option("-r, --release_mode", "リリースモードで起動します", false)
    .parse()
    .opts()

export class Config {
    public static DISCORD_TOKEN: string = _DISCORD_TOKEN
    public static IS_RELEASE: boolean = _CLI_OPTIONS.release_mode
}
