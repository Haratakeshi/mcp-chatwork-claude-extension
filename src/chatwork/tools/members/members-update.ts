import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const MembersUpdateSchema = z.object({
  room_id: z.string().describe("メンバー情報を更新したいチャットルームのID"),
  members_admin_ids: z.array(z.number()).describe('管理者権限のメンバーのアカウントIDの配列'),
  members_member_ids: z.array(z.number()).optional().describe('メンバー権限のメンバーのアカウントIDの配列'),
  members_readonly_ids: z.array(z.number()).optional().describe('閲覧のみ権限のメンバーのアカウントIDの配列'),
});

export type MembersUpdateInput = z.infer<typeof MembersUpdateSchema>;

/**
 * 指定されたチャットルームのメンバーを一括変更します。
 */
export const membersUpdateDescription = '指定されたチャットルームのメンバーを一括変更します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {MembersUpdateInput} ツールへの入力
 * @returns {Promise<object>} 更新後のメンバー情報
 */
export async function membersUpdate(env: ToolEnv, input: MembersUpdateInput): Promise<object> {
  try {
    // 1. 入力検証
    const { room_id, ...memberData } = MembersUpdateSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();
    
    const params = new URLSearchParams();
    params.append('members_admin_ids', memberData.members_admin_ids.join(','));
    if (memberData.members_member_ids) {
      params.append('members_member_ids', memberData.members_member_ids.join(','));
    }
    if (memberData.members_readonly_ids) {
      params.append('members_readonly_ids', memberData.members_readonly_ids.join(','));
    }

    const response = await client.put(`/rooms/${room_id}/members`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}