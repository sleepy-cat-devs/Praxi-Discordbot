//必要なパッケージをインポートする
import { GatewayIntentBits, Client, Partials, Message, VoiceState } from 'discord.js'
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } from '@discordjs/voice';
import dotenv from 'dotenv'

//.envファイルを読み込む
dotenv.config()

//Botで使うGatewayIntents、partials
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
})

// const client = new Client(process.env.INTENTS);

//Botがきちんと起動したか確認
client.once('ready', () => {
    console.log('Ready!')
    if(client.user){
        console.log(client.user.tag)
    }
})

let voiceConnection: any = null;

client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
  // ユーザーが新たにボイスチャンネルに参加した場合
  if (!oldState.channel && newState.channel && !newState.member?.user.bot) {
    const voiceChannel = newState.channel;

    // ボットがすでに接続している場合は無視
    //if (voiceConnection) return;
    console.log(voiceChannel.id)
    // ボイスチャンネルに参加
    voiceConnection = joinVoiceChannel({
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
});

//!timeと入力すると現在時刻を返信するように
client.on('messageCreate', async (message: Message) => {
    console.log(message.content)
    if (message.author.bot) return
    if (message.content === '!time') {
        const date1 = new Date();
        console.log("test");
        //message.channel.send(date1.toLocaleString());
        message.reply(date1.toLocaleString())
    }
})

//ボット作成時のトークンでDiscordと接続
client.login(process.env.TOKEN)