import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const MyTasksGetSchema = z.object({
  assignee_id: z.number().optional().describe('担当者のアカウントID'),
  status: z.enum(['open', 'done']).optional().describe('タスクのステータス(open: 未完了, done: 完了)'),
});

export type MyTasksGetInput = z.infer<typeof MyTasksGetSchema>;

/**
 * 自分のタスク一覧を取得します。
 */
export const myTasksGetDescription = '自分のタスク一覧を取得します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {MyTasksGetInput} ツールへの入力
 * @returns {Promise<object>} 自分のタスク一覧
 */
export async function myTasksGet(env: ToolEnv, input: MyTasksGetInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = MyTasksGetSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.get('/my/tasks', {
      params: validatedInput,
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}