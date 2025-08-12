import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義 (引数なし)
export const RoomsListSchema = z.object({});

export type RoomsListInput = z.infer<typeof RoomsListSchema>;

/**
 * 参加しているすべてのチャットルームの一覧を取得します。
 */
export const roomsListDescription = '参加しているすべてのチャットルームの一覧を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {RoomsListInput} ツールへの入力 (今回は空)
 * @returns {Promise<object>} ルーム一覧
 */
export async function roomsList(env: ToolEnv, input: RoomsListInput): Promise<object> {
  try {
    // 1. 入力検証
    RoomsListSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get('/rooms');

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}