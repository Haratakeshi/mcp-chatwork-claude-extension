import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義 (引数なし)
export const ContactsGetSchema = z.object({});

export type ContactsGetInput = z.infer<typeof ContactsGetSchema>;

/**
 * 自分のコンタクト一覧を取得します。
 */
export const contactsGetDescription = '自分のコンタクト一覧を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {ContactsGetInput} ツールへの入力 (今回は空)
 * @returns {Promise<object>} コンタクト一覧
 */
export async function contactsGet(env: ToolEnv, input: ContactsGetInput): Promise<object> {
  try {
    // 1. 入力検証
    ContactsGetSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get('/contacts');

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}