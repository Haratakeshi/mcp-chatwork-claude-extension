import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義 (引数なし)
export const MyStatusGetSchema = z.object({});

export type MyStatusGetInput = z.infer<typeof MyStatusGetSchema>;

/**
 * 自分の未読数、未読TO数、未完了タスク数を取得します。
 */
export const myStatusGetDescription = '自分の未読数、未読TO数、未完了タスク数を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {MyStatusGetInput} ツールへの入力 (今回は空)
 * @returns {Promise<object>} 自分のステータス情報
 */
export async function myStatusGet(env: ToolEnv, input: MyStatusGetInput): Promise<object> {
  try {
    // 1. 入力検証
    MyStatusGetSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get('/my/status');

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}