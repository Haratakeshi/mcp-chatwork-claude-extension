import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const FilesGetSchema = z.object({
  room_id: z.string().describe("ファイルが属するチャットルームのID"),
  file_id: z.string().describe("取得したいファイルのID"),
  create_download_url: z.union([z.literal(0), z.literal(1)]).optional().describe("1を指定すると、ダウンロードURLを発行する"),
});

export type FilesGetInput = z.infer<typeof FilesGetSchema>;

/**
 * 指定されたファイルの詳細情報を取得します。
 */
export const filesGetDescription = '指定されたファイルの詳細情報を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {FilesGetInput} ツールへの入力
 * @returns {Promise<object>} ファイルの詳細情報
 */
export async function filesGet(env: ToolEnv, input: FilesGetInput): Promise<object> {
  try {
    // 1. 入力検証
    const { room_id, file_id, ...queryParams } = FilesGetSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get(`/rooms/${room_id}/files/${file_id}`, {
      params: queryParams,
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}