import axios from 'axios';

/**
 * Chatworkの認証を管理するクラス
 */
export class ChatworkAuthenticator {
  private readonly client;

  constructor(private token?: string) {
    if (!token) {
      throw new Error('Chatwork API token is not provided.');
    }
    this.client = axios.create({
      baseURL: 'https://api.chatwork.com/v2',
      headers: {
        'X-ChatWorkToken': this.token,
      },
    });
  }

  /**
   * 初期化済みのaxiosインスタンスを取得します
   * @returns {axios.AxiosInstance}
   */
  public getClient() {
    return this.client;
  }
}