import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const RoomsGetSchema = z.object({
  room_id: z.string().describe("情報を取得したいチャットルームのID"),
});

export type RoomsGetInput = z.infer<typeof RoomsGetSchema>;

/**
 * 指定されたチャットルームの詳細情報を取得します。
 */
export const roomsGetDescription = '指定されたチャットルームの詳細情報を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {RoomsGetInput} ツールへの入力
 * @returns {Promise<object>} ルームの詳細情報
 */
export async function roomsGet(env: ToolEnv, input: RoomsGetInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = RoomsGetSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get(`/rooms/${validatedInput.room_id}`);

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}