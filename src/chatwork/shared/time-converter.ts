/**
 * UNIXタイムスタンプを指定されたフォーマットの文字列に変換します。
 * @param unixTimestamp - 変換するUNIXタイムスタンプ（秒単位）。
 * @returns 'YYYY/MM/DD hh:mm:ss' 形式の文字列。
 */
export function convertUnixTimestampToDateTime(unixTimestamp: number): string {
  if (unixTimestamp === 0) {
    return 'N/A';
  }
  const date = new Date(unixTimestamp * 1000); // ミリ秒に変換
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}