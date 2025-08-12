import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const TasksGetSchema = z.object({
  room_id: z.string().describe("タスクが属するチャットルームのID"),
  task_id: z.string().describe("取得したいタスクのID"),
});

export type TasksGetInput = z.infer<typeof TasksGetSchema>;

/**
 * 指定されたタスクの詳細情報を取得します。
 */
export const tasksGetDescription = '指定されたタスクの詳細情報を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {TasksGetInput} ツールへの入力
 * @returns {Promise<object>} タスクの詳細情報
 */
export async function tasksGet(env: ToolEnv, input: TasksGetInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = TasksGetSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get(`/rooms/${validatedInput.room_id}/tasks/${validatedInput.task_id}`);

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}