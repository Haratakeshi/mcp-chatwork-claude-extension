import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const MembersListSchema = z.object({
  room_id: z.string().describe("メンバー一覧を取得したいチャットルームのID"),
});

export type MembersListInput = z.infer<typeof MembersListSchema>;

/**
 * 指定されたチャットルームのメンバー一覧を取得します。
 */
export const membersListDescription = '指定されたチャットルームのメンバー一覧を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {MembersListInput} ツールへの入力
 * @returns {Promise<object>} メンバー一覧
 */
export async function membersList(env: ToolEnv, input: MembersListInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = MembersListSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get(`/rooms/${validatedInput.room_id}/members`);

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}