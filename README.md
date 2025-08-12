# Chatwork Claude MCP拡張機能

## 概要

このプロジェクトは、[Chatwork API](https://developer.chatwork.com/docs) を [Anthropic Claude](https://docs.anthropic.com/) から利用するためのMCP (Managed Component Platform) 拡張機能です。

この拡張機能をClaudeにインストールすることで、ClaudeがChatworkの様々な機能（メッセージの送信、ルーム情報の取得、タスクの管理など）を実行できるようになります。

## 機能一覧

この拡張機能は、Chatwork APIの以下の機能を提供します。

*   **認証:**
    *   APIトークンを利用した認証
*   **コンタクト:**
    *   コンタクト一覧の取得
*   **ファイル:**
    *   ファイル情報の取得
    *   ファイル一覧の取得
*   **コンタクト承認依頼:**
    *   コンタクト承認依頼の承認・拒否・一覧取得
*   **自分自身の情報:**
    *   自分の情報の取得
    *   自分のステータスの取得
    *   自分のタスク一覧の取得
*   **メンバー:**
    *   チャットルームのメンバー一覧取得・更新
*   **メッセージ:**
    *   メッセージの取得・一覧取得・送信
*   **チャットルーム:**
    *   チャットルームの作成・削除・取得・一覧取得・更新
*   **タスク:**
    *   タスクの作成・取得・一覧取得

## セットアップと開発

### 前提条件

*   [Node.js](https://nodejs.org/) (v18以上を推奨)
*   [pnpm](https://pnpm.io/) (または npm, yarn)

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/mcp-chatwork-claude-extension.git
cd mcp-chatwork-claude-extension
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. ビルドとDXTファイルの生成

このプロジェクトでは、TypeScriptのコンパイルとDXTファイルのパッケージングを一つのコマンドで実行できます。

プロジェクトのルートディレクトリで以下のコマンドを実行してください。

```bash
pnpm run build
```

このコマンドにより、以下の処理が自動的に行われます。

1.  `src` ディレクトリのTypeScriptソースコードがコンパイルされ、`dist` ディレクトリにJavaScriptファイルが出力されます。
2.  コンパイルされたファイルと `manifest.json` などの必要なリソースが、`dxt pack` コマンドによって単一の `.dxt` ファイルにパッケージングされます。

生成された `.dxt` ファイルはプロジェクトのルートディレクトリに作成されます。

## 拡張機能のインストールと利用

1.  生成された `.dxt` ファイルを、お使いのClaude環境（Desktop版など）にドラッグ＆ドロップするか、指定された方法でインストールします。
2.  インストール後、拡張機能の設定画面で `Chatwork API Token` を入力します。APIトークンは[Chatworkのドキュメント](https://developer.chatwork.com/docs/api-token)を参考に発行してください。
3.  設定が完了すると、Claudeとの対話の中で「Chatworkで〇〇さんにメッセージを送って」のように指示することで、この拡張機能の機能を利用できます。

## ライセンス

[MIT](./LICENSE)
