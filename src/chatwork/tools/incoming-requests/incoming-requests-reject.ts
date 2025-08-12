import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const IncomingRequestsRejectSchema = z.object({
  request_id: z.string().describe("否認したいコンタクト承認依頼のID"),
});

export type IncomingRequestsRejectInput = z.infer<typeof IncomingRequestsRejectSchema>;

/**
 * 指定されたコンタクト承認依頼を否認します。
 */
export const incomingRequestsRejectDescription = '指定されたコンタクト承認依頼を否認します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {IncomingRequestsRejectInput} ツールへの入力
 * @returns {Promise<object>} 処理結果 (成功時は空)
 */
export async function incomingRequestsReject(env: ToolEnv, input: IncomingRequestsRejectInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = IncomingRequestsRejectSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.delete(`/incoming_requests/${validatedInput.request_id}`);

    // 3. レスポンス整形
    return response.data; // 成功時は空のボディが返る
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}