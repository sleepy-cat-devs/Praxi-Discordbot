import { Command } from "commander"
import dotenv from "dotenv"

dotenv.config()

const _DISCORD_TOKEN = process.env.DISCORD_TOKEN
if (!_DISCORD_TOKEN)
    throw new Error("ENV_VAR: DISCORD_TOKEN not found")

const _GUILDS_SETTINGS_DIRNAME = process.env.GUILDS_SETTINGS_DIRNAME
if (!_GUILDS_SETTINGS_DIRNAME)
    throw new Error("ENV_VAR: GUILDS_SETTINGS_DIRNAME not found")


const _OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!_OPENAI_API_KEY)
    throw new Error("ENV_VAR: OPENAI_API_KEY not found")

const _CLI_OPTIONS = new Command()
    .option("-r, --release_mode", "リリースモードで起動します", false)
    .parse()
    .opts()

export class Config {
    public static DISCORD_TOKEN: string
        = _DISCORD_TOKEN as string
    public static GUILDS_SETTINGS_DIRNAME: string
        = _GUILDS_SETTINGS_DIRNAME as string

    public static OPENAI_API_KEY: string
        = _OPENAI_API_KEY as string

    public static IS_RELEASE: boolean
        = _CLI_OPTIONS.release_mode
}
