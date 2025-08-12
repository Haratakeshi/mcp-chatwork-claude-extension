import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const TasksListSchema = z.object({
  room_id: z.string().describe("タスク一覧を取得したいチャットルームのID"),
  account_id: z.number().optional().describe('タスクの担当者のアカウントID'),
  assigned_by_account_id: z.number().optional().describe('タスクの依頼者のアカウントID'),
  status: z.enum(['open', 'done']).optional().describe('タスクのステータス(open: 未完了, done: 完了)'),
});

export type TasksListInput = z.infer<typeof TasksListSchema>;

/**
 * 指定されたチャットルームのタスク一覧を取得します。
 */
export const tasksListDescription = '指定されたチャットルームのタスク一覧を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {TasksListInput} ツールへの入力
 * @returns {Promise<object>} タスク一覧
 */
export async function tasksList(env: ToolEnv, input: TasksListInput): Promise<object> {
  try {
    // 1. 入力検証
    const { room_id, ...queryParams } = TasksListSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get(`/rooms/${room_id}/tasks`, {
      params: queryParams,
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}