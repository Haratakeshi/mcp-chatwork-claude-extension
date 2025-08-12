import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const RoomsUpdateSchema = z.object({
  room_id: z.string().describe("情報を更新したいチャットルームのID"),
  name: z.string().optional().describe('グループチャット名'),
  description: z.string().optional().describe('チャットの概要'),
  icon_preset: z.enum([
      'group', 'check', 'document', 'meeting', 'event', 'project', 'business', 'study',
      'security', 'star', 'idea', 'heart', 'magcup', 'beer', 'music', 'sports', 'travel'
    ]).optional().describe('チャットのアイコン種類'),
});

export type RoomsUpdateInput = z.infer<typeof RoomsUpdateSchema>;

/**
 * 指定されたチャットルームの情報を更新します。
 */
export const roomsUpdateDescription = '指定されたチャットルームの情報を更新します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {RoomsUpdateInput} ツールへの入力
 * @returns {Promise<object>} 更新結果
 */
export async function roomsUpdate(env: ToolEnv, input: RoomsUpdateInput): Promise<object> {
  try {
    // 1. 入力検証
    const { room_id, ...updateData } = RoomsUpdateSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();
    
    const params = new URLSearchParams();
    if (updateData.name) params.append('name', updateData.name);
    if (updateData.description) params.append('description', updateData.description);
    if (updateData.icon_preset) params.append('icon_preset', updateData.icon_preset);

    const response = await client.put(`/rooms/${room_id}`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}