import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const MessagesListSchema = z.object({
  room_id: z.string().describe("メッセージを取得したいチャットルームのID"),
  force: z.union([z.literal(0), z.literal(1)]).optional().describe("0: 未取得メッセージのみ, 1: 最新100件"),
});

export type MessagesListInput = z.infer<typeof MessagesListSchema>;

/**
 * 指定されたチャットルームのメッセージ履歴を取得します。
 */
export const messagesListDescription = '指定されたチャットルームのメッセージ履歴を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {MessagesListInput} ツールへの入力
 * @returns {Promise<object>} メッセージ履歴
 */
export async function messagesList(env: ToolEnv, input: MessagesListInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = MessagesListSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get(`/rooms/${validatedInput.room_id}/messages`, {
      params: {
        force: validatedInput.force,
      },
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}