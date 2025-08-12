import { AxiosError } from 'axios';

/**
 * Chatwork APIのエラーをハンドリングし、分かりやすいエラーメッセージをスローします。
 * @param error - Axiosからスローされたエラーオブジェクト
 */
export function handleChatworkError(error: unknown): never {
  if (error instanceof AxiosError) {
    const { response } = error;
    if (response) {
      const { status, data } = response;
      const errorMessage = data?.errors?.[0] || `Request failed with status code ${status}`;
      throw new Error(`Chatwork API Error: ${errorMessage}`);
    } else {
      throw new Error(`Chatwork API Error: ${error.message}`);
    }
  }
  throw new Error('An unknown error occurred while calling Chatwork API.');
}