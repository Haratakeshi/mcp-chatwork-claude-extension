import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義 (引数なし)
export const MeGetSchema = z.object({});

export type MeGetInput = z.infer<typeof MeGetSchema>;

/**
 * 自分のアカウント情報を取得します。
 */
export const meGetDescription = '自分のアカウント情報を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {MeGetInput} ツールへの入力 (今回は空)
 * @returns {Promise<object>} 自分のアカウント情報
 */
export async function meGet(env: ToolEnv, input: MeGetInput): Promise<object> {
  try {
    // 1. 入力検証
    MeGetSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get('/me');

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}