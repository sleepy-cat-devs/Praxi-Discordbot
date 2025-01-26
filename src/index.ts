import { bot } from "./bot"
import { Config } from "./config/config"

//ボット作成時のトークンでDiscordと接続
bot.login(Config.DISCORD_TOKEN)