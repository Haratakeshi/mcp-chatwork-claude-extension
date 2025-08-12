import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const FilesListSchema = z.object({
  room_id: z.string().describe("ファイル一覧を取得したいチャットルームのID"),
  account_id: z.number().optional().describe('ファイルをアップロードしたユーザーのアカウントID'),
});

export type FilesListInput = z.infer<typeof FilesListSchema>;

/**
 * 指定されたチャットルームのファイル一覧を取得します。
 */
export const filesListDescription = '指定されたチャットルームのファイル一覧を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {FilesListInput} ツールへの入力
 * @returns {Promise<object>} ファイル一覧
 */
export async function filesList(env: ToolEnv, input: FilesListInput): Promise<object> {
  try {
    // 1. 入力検証
    const { room_id, ...queryParams } = FilesListSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get(`/rooms/${room_id}/files`, {
      params: queryParams,
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}