import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const IncomingRequestsApproveSchema = z.object({
  request_id: z.string().describe("承認したいコンタクト承認依頼のID"),
});

export type IncomingRequestsApproveInput = z.infer<typeof IncomingRequestsApproveSchema>;

/**
 * 指定されたコンタクト承認依頼を承認します。
 */
export const incomingRequestsApproveDescription = '指定されたコンタクト承認依頼を承認します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {IncomingRequestsApproveInput} ツールへの入力
 * @returns {Promise<object>} 承認されたコンタクトの情報
 */
export async function incomingRequestsApprove(env: ToolEnv, input: IncomingRequestsApproveInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = IncomingRequestsApproveSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.put(`/incoming_requests/${validatedInput.request_id}`);

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}