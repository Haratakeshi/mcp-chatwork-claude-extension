import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const RoomsDeleteSchema = z.object({
  room_id: z.string().describe("退席または削除したいチャットルームのID"),
  action_type: z.enum(['leave', 'delete']).describe("`leave`: グループチャットから退席する, `delete`: グループチャットを削除する"),
});

export type RoomsDeleteInput = z.infer<typeof RoomsDeleteSchema>;

/**
 * グループチャットから退席または削除します。
 */
export const roomsDeleteDescription = 'グループチャットから退席または削除します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {RoomsDeleteInput} ツールへの入力
 * @returns {Promise<object>} 処理結果 (成功時は空)
 */
export async function roomsDelete(env: ToolEnv, input: RoomsDeleteInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = RoomsDeleteSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();
    
    const params = new URLSearchParams();
    params.append('action_type', validatedInput.action_type);

    const response = await client.delete(`/rooms/${validatedInput.room_id}`, {
        data: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // 3. レスポンス整形
    return response.data; // 成功時は空のボディが返る
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}