import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const RoomsCreateSchema = z.object({
  name: z.string().describe('グループチャット名'),
  members_admin_ids: z.array(z.number()).describe('管理者権限のメンバーのアカウントIDの配列'),
  description: z.string().optional().describe('チャットの概要'),
  icon_preset: z.enum([
      'group', 'check', 'document', 'meeting', 'event', 'project', 'business', 'study',
      'security', 'star', 'idea', 'heart', 'magcup', 'beer', 'music', 'sports', 'travel'
    ]).optional().describe('チャットのアイコン種類'),
  members_member_ids: z.array(z.number()).optional().describe('メンバー権限のメンバーのアカウントIDの配列'),
  members_readonly_ids: z.array(z.number()).optional().describe('閲覧のみ権限のメンバーのアカウントIDの配列'),
});

export type RoomsCreateInput = z.infer<typeof RoomsCreateSchema>;

/**
 * 新しいグループチャットを作成します。
 */
export const roomsCreateDescription = '新しいグループチャットを作成します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {RoomsCreateInput} ツールへの入力
 * @returns {Promise<object>} 作成されたルームの情報
 */
export async function roomsCreate(env: ToolEnv, input: RoomsCreateInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = RoomsCreateSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();
    
    // APIが期待する x-www-form-urlencoded 形式のデータを作成
    const params = new URLSearchParams();
    params.append('name', validatedInput.name);
    params.append('members_admin_ids', validatedInput.members_admin_ids.join(','));
    if (validatedInput.description) {
      params.append('description', validatedInput.description);
    }
    if (validatedInput.icon_preset) {
      params.append('icon_preset', validatedInput.icon_preset);
    }
    if (validatedInput.members_member_ids) {
      params.append('members_member_ids', validatedInput.members_member_ids.join(','));
    }
    if (validatedInput.members_readonly_ids) {
      params.append('members_readonly_ids', validatedInput.members_readonly_ids.join(','));
    }

    const response = await client.post('/rooms', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}