import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const TasksCreateSchema = z.object({
  room_id: z.string().describe("タスクを作成したいチャットルームのID"),
  body: z.string().describe('タスクの内容'),
  to_ids: z.array(z.number()).describe('担当者のアカウントIDの配列'),
  limit: z.number().optional().describe('タスクの期限(Unix time)'),
});

export type TasksCreateInput = z.infer<typeof TasksCreateSchema>;

/**
 * 指定されたチャットルームに新しいタスクを作成します。
 */
export const tasksCreateDescription = '指定されたチャットルームに新しいタスクを作成します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {TasksCreateInput} ツールへの入力
 * @returns {Promise<object>} 作成されたタスクの情報
 */
export async function tasksCreate(env: ToolEnv, input: TasksCreateInput): Promise<object> {
  try {
    // 1. 入力検証
    const { room_id, ...taskData } = TasksCreateSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const params = new URLSearchParams();
    params.append('body', taskData.body);
    params.append('to_ids', taskData.to_ids.join(','));
    if (taskData.limit) {
      params.append('limit', String(taskData.limit));
    }

    const response = await client.post(`/rooms/${room_id}/tasks`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}