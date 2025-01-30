import OpenAI from 'openai';
import { Config } from '../../../config/config';

export const openAIClient = new OpenAI({
    apiKey: Config.OPENAI_API_KEY,
});
