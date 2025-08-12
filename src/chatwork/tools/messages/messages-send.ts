import { z } from 'zod';
import { ChatworkAuthenticator } from '../../shared/auth.js';
import { handleChatworkError } from '../../shared/error-handler.js';
import { ToolEnv } from '../../shared/types.js';

// 入力スキーマを定義
export const MessagesSendSchema = z.object({
  room_id: z.string().describe("メッセージを送信するチャットルームのID"),
  body: z.string().describe("送信するメッセージ本文"),
  self_unread: z.union([z.literal(0), z.literal(1)]).optional().describe("0: 未読にしない, 1: 未読にする"),
});

export type MessagesSendInput = z.infer<typeof MessagesSendSchema>;

/**
 * 指定されたチャットルームに新しいメッセージを送信します。
 */
export const messagesSendDescription = '指定されたチャットルームに新しいメッセージを送信します。';

/**
 * @param env {ToolEnv} CHATWORK_API_TOKENを含む環境変数
 * @param input {MessagesSendInput} ツールへの入力
 * @returns {Promise<object>} 送信されたメッセージの情報
 */
export async function messagesSend(env: ToolEnv, input: MessagesSendInput): Promise<object> {
  try {
    // 1. 入力検証
    const validatedInput = MessagesSendSchema.parse(input);

    // 2. Chatwork API呼び出し
    const auth = new ChatworkAuthenticator(env.CHATWORK_API_TOKEN);
    const client = auth.getClient();

    const response = await client.post(`/rooms/${validatedInput.room_id}/messages`, null, {
      params: {
        body: validatedInput.body,
        self_unread: validatedInput.self_unread,
      },
    });

    // 3. レスポンス整形
    return response.data;
  } catch (error) {
    handleChatworkError(error);
    throw error;
  }
}