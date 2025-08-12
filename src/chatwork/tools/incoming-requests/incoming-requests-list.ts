import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義 (引数なし)
export const IncomingRequestsListSchema = z.object({});

export type IncomingRequestsListInput = z.infer<typeof IncomingRequestsListSchema>;

/**
 * 自分へのコンタクト承認依頼一覧を取得します。
 */
export const incomingRequestsListDescription = '自分へのコンタクト承認依頼一覧を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {IncomingRequestsListInput} ツールへの入力 (今回は空)
 * @returns {Promise<object>} コンタクト承認依頼一覧
 */
export async function incomingRequestsList(env: ToolEnv, input: IncomingRequestsListInput): Promise<object> {
  try {
    // 1. 入力検証
    IncomingRequestsListSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get('/incoming_requests');

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}