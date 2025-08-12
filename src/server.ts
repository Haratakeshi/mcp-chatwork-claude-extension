import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ToolEnv } from './chatwork/shared/types.js';
import dotenv from 'dotenv';

dotenv.config();

// --- Existing Tools ---
import { messagesList, MessagesListSchema, messagesListDescription } from './chatwork/tools/messages/messages-list.js';
import { roomsList, RoomsListSchema, roomsListDescription } from './chatwork/tools/rooms/rooms-list.js';
import { meGet, MeGetSchema, meGetDescription } from './chatwork/tools/me/me-get.js';

// --- Newly Added Read-only Tools ---
// /me
import { myStatusGet, MyStatusGetSchema, myStatusGetDescription } from './chatwork/tools/me/my-status-get.js';
import { myTasksGet, MyTasksGetSchema, myTasksGetDescription } from './chatwork/tools/me/my-tasks-get.js';
// /contacts
import { contactsGet, ContactsGetSchema, contactsGetDescription } from './chatwork/tools/contacts/contacts-get.js';
// /rooms
import { roomsGet, RoomsGetSchema, roomsGetDescription } from './chatwork/tools/rooms/rooms-get.js';
// /messages
import { messagesGet, MessagesGetSchema, messagesGetDescription } from './chatwork/tools/messages/messages-get.js';
// /tasks
import { tasksList, TasksListSchema, tasksListDescription } from './chatwork/tools/tasks/tasks-list.js';
import { tasksGet, TasksGetSchema, tasksGetDescription } from './chatwork/tools/tasks/tasks-get.js';
// /files
import { filesList, FilesListSchema, filesListDescription } from './chatwork/tools/files/files-list.js';
import { filesGet, FilesGetSchema, filesGetDescription } from './chatwork/tools/files/files-get.js';
// /members
import { membersList, MembersListSchema, membersListDescription } from './chatwork/tools/members/members-list.js';
// /incoming_requests
import { incomingRequestsList, IncomingRequestsListSchema, incomingRequestsListDescription } from './chatwork/tools/incoming-requests/incoming-requests-list.js';


try {
  console.error('[DEBUG] Server starting up...');

  // 1. McpServerのインスタンスを作成
  const server = new McpServer({
    name: 'mcp-chatwork-claude-extension',
    version: '2.0.0', // 機能追加のためバージョンアップ
  });

  // 2. ツール定義の配列を作成
  const toolDefinitions = [
    // Existing
    // Read-only tools
    { name: 'messages_list', description: messagesListDescription, schema: MessagesListSchema, implementation: messagesList },
    { name: 'rooms_list', description: roomsListDescription, schema: RoomsListSchema, implementation: roomsList },
    { name: 'me_get', description: meGetDescription, schema: MeGetSchema, implementation: meGet },
    { name: 'my_status_get', description: myStatusGetDescription, schema: MyStatusGetSchema, implementation: myStatusGet },
    { name: 'my_tasks_get', description: myTasksGetDescription, schema: MyTasksGetSchema, implementation: myTasksGet },
    { name: 'contacts_get', description: contactsGetDescription, schema: ContactsGetSchema, implementation: contactsGet },
    { name: 'rooms_get', description: roomsGetDescription, schema: RoomsGetSchema, implementation: roomsGet },
    { name: 'messages_get', description: messagesGetDescription, schema: MessagesGetSchema, implementation: messagesGet },
    { name: 'tasks_list', description: tasksListDescription, schema: TasksListSchema, implementation: tasksList },
    { name: 'tasks_get', description: tasksGetDescription, schema: TasksGetSchema, implementation: tasksGet },
    { name: 'files_list', description: filesListDescription, schema: FilesListSchema, implementation: filesList },
    { name: 'files_get', description: filesGetDescription, schema: FilesGetSchema, implementation: filesGet },
    { name: 'members_list', description: membersListDescription, schema: MembersListSchema, implementation: membersList },
    { name: 'incoming_requests_list', description: incomingRequestsListDescription, schema: IncomingRequestsListSchema, implementation: incomingRequestsList },
  ];

  // 3. すべてのツールを動的に登録
  toolDefinitions.forEach(tool => {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: (tool.schema as any).shape,
      },
      async (input: any) => {
        const env: ToolEnv = {
          CHATWORK_API_TOKEN: process.env.CHATWORK_API_TOKEN || '',
        };
 
        if (!env.CHATWORK_API_TOKEN) {
          throw new Error('Server error: CHATWORK_API_TOKEN is not set.');
        }

        try {
          const result = await tool.implementation(env, input);
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          return {
            isError: true,
            content: [{
              type: 'text' as const,
              text: `Tool execution failed: ${errorMessage}`
            }]
          };
        }
      }
    );
  });

  // 4. StdioServerTransportを使用してサーバーを接続
  const transport = new StdioServerTransport();
  server.connect(transport);

  console.error(`MCP Chatwork Extension Server is running with ${toolDefinitions.length} tools.`);

} catch (error) {
  const errorMessage = error instanceof Error ? `Message: ${error.message}\nStack: ${error.stack}` : String(error);
  console.error('!!! FATAL SERVER ERROR ON STARTUP !!!');
  console.error(JSON.stringify({
    error: errorMessage,
    details: error,
  }, null, 2));
  process.exit(1);
}