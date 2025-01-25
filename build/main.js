"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//必要なパッケージをインポートする
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const dotenv_1 = __importDefault(require("dotenv"));
//.envファイルを読み込む
dotenv_1.default.config();
//Botで使うGatewayIntents、partials
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
    partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel],
});
// const client = new Client(process.env.INTENTS);
//Botがきちんと起動したか確認
client.once('ready', () => {
    console.log('Ready!');
    if (client.user) {
        console.log(client.user.tag);
    }
});
let voiceConnection = null;
client.on('voiceStateUpdate', (oldState, newState) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // ユーザーが新たにボイスチャンネルに参加した場合
    if (!oldState.channel && newState.channel && !((_a = newState.member) === null || _a === void 0 ? void 0 : _a.user.bot)) {
        const voiceChannel = newState.channel;
        // ボットがすでに接続している場合は無視
        //if (voiceConnection) return;
        console.log(voiceChannel.id);
        // ボイスチャンネルに参加
        voiceConnection = (0, voice_1.joinVoiceChannel)({
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            //selfDeaf: true,
            //selfMute: false,
        });
        console.log(`参加しました: ${voiceChannel.name}`);
    }
    // ボイスチャンネルから全員が退出した場合
    if (oldState.channel && !newState.channel && voiceConnection) {
        const oldChannel = oldState.channel;
        // チャンネルに残っているユーザーを確認
        if (oldChannel.members.filter((member) => !member.user.bot).size === 0) {
            console.log(`ボイスチャンネルを離れます: ${oldChannel.name}`);
            voiceConnection.destroy(); // ボイスチャンネルから切断
            voiceConnection = null;
        }
    }
}));
//!timeと入力すると現在時刻を返信するように
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(message.content);
    if (message.author.bot)
        return;
    if (message.content === '!time') {
        const date1 = new Date();
        console.log("test");
        //message.channel.send(date1.toLocaleString());
        message.reply(date1.toLocaleString());
    }
}));
//ボット作成時のトークンでDiscordと接続
client.login(process.env.TOKEN);
