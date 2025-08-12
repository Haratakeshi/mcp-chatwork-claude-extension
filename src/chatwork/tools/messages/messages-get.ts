import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const MessagesGetSchema = z.object({
  room_id: z.string().describe("メッセージが属するチャットルームのID"),
  message_id: z.string().describe("取得したいメッセージのID"),
});

export type MessagesGetInput = z.infer<typeof MessagesGetSchema>;

/**
 * 指定されたメッセージの詳細情報を取得します。
 */
export const messagesGetDescription = '指定されたメッセージの詳細情報を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {MessagesGetInput} ツールへの入力
 * @returns {Promise<object>} メッセージの詳細情報
 */
export async function messagesGet(env: ToolEnv, input: MessagesGetInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = MessagesGetSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get(`/rooms/${validatedInput.room_id}/messages/${validatedInput.message_id}`);

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}