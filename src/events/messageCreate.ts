import { Message } from 'discord.js';
import axios from 'axios';
import logger from '../utils/logger'; // ログユーティリティのインポート

const OLLAMA_API_URL = 'http://localhost:11434'; // 仮のURL
const OLLAMA_API_KEY = 'あなたのOllama APIキー'; // 必要に応じて設定

export const handler = async (message: Message) => {
  console.log(message);
  try {
    // Bot自身やメンション以外のメッセージを無視
    if (message.author.bot || !message.client.user || !message.mentions.has(message.client.user.id)) return;

    // メッセージ内容からメンション部分を削除
    const userQuery = message.content.replace(`<@${message.client.user.id}>`, '').trim();
    if (!userQuery) {
      await message.reply('質問を教えてください！');
      return;
    }

    logger.info(`メッセージを受信: ${userQuery}`);

    // Ollama APIへのリクエスト
    const response = await axios.post(
      `${OLLAMA_API_URL}/api/generate`,
      { 
        model: 'llama3.1',
        prompt: userQuery,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const generatedText = response.data.response || '回答がありませんでした…';
    logger.info(`API応答: ${generatedText}`);
    console.log(userQuery)
    console.log(response)
    // メッセージ返信
    await message.reply(generatedText);
  } catch (error) {
    logger.error('エラー:', error);
    await message.reply('問題が発生しました…もう一度試してみてください！');
  }
};