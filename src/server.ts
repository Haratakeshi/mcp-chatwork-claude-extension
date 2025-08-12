import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ToolEnv } from './chatwork/shared/types.js';

// --- Existing Tools ---
import { messagesList, MessagesListSchema, messagesListDescription } from './chatwork/tools/messages/messages-list.js';
import { roomsList, RoomsListSchema, roomsListDescription } from './chatwork/tools/rooms/rooms-list.js';
import { meGet, MeGetSchema, meGetDescription } from './chatwork/tools/me/me-get.js';
import { messagesSend, MessagesSendSchema, messagesSendDescription } from './chatwork/tools/messages/messages-send.js';

// --- Newly Added Tools ---
// /me
import { myStatusGet, MyStatusGetSchema, myStatusGetDescription } from './chatwork/tools/me/my-status-get.js';
import { myTasksGet, MyTasksGetSchema, myTasksGetDescription } from './chatwork/tools/me/my-tasks-get.js';
// /contacts
import { contactsGet, ContactsGetSchema, contactsGetDescription } from './chatwork/tools/contacts/contacts-get.js';
// /rooms
import { roomsCreate, RoomsCreateSchema, roomsCreateDescription } from './chatwork/tools/rooms/rooms-create.js';
import { roomsGet, RoomsGetSchema, roomsGetDescription } from './chatwork/tools/rooms/rooms-get.js';
import { roomsUpdate, RoomsUpdateSchema, roomsUpdateDescription } from './chatwork/tools/rooms/rooms-update.js';
import { roomsDelete, RoomsDeleteSchema, roomsDeleteDescription } from './chatwork/tools/rooms/rooms-delete.js';
// /messages
import { messagesGet, MessagesGetSchema, messagesGetDescription } from './chatwork/tools/messages/messages-get.js';
// /tasks
import { tasksList, TasksListSchema, tasksListDescription } from './chatwork/tools/tasks/tasks-list.js';
import { tasksCreate, TasksCreateSchema, tasksCreateDescription } from './chatwork/tools/tasks/tasks-create.js';
import { tasksGet, TasksGetSchema, tasksGetDescription } from './chatwork/tools/tasks/tasks-get.js';
// /files
import { filesList, FilesListSchema, filesListDescription } from './chatwork/tools/files/files-list.js';
import { filesGet, FilesGetSchema, filesGetDescription } from './chatwork/tools/files/files-get.js';
// /members
import { membersList, MembersListSchema, membersListDescription } from './chatwork/tools/members/members-list.js';
import { membersUpdate, MembersUpdateSchema, membersUpdateDescription } from './chatwork/tools/members/members-update.js';
// /incoming_requests
import { incomingRequestsList, IncomingRequestsListSchema, incomingRequestsListDescription } from './chatwork/tools/incoming-requests/incoming-requests-list.js';
import { incomingRequestsApprove, IncomingRequestsApproveSchema, incomingRequestsApproveDescription } from './chatwork/tools/incoming-requests/incoming-requests-approve.js';
import { incomingRequestsReject, IncomingRequestsRejectSchema, incomingRequestsRejectDescription } from './chatwork/tools/incoming-requests/incoming-requests-reject.js';


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
    { name: 'messages_list', description: messagesListDescription, schema: MessagesListSchema, implementation: messagesList },
    { name: 'rooms_list', description: roomsListDescription, schema: RoomsListSchema, implementation: roomsList },
    { name: 'me_get', description: meGetDescription, schema: MeGetSchema, implementation: meGet },
    { name: 'messages_send', description: messagesSendDescription, schema: MessagesSendSchema, implementation: messagesSend },
    // Added
    { name: 'my_status_get', description: myStatusGetDescription, schema: MyStatusGetSchema, implementation: myStatusGet },
    { name: 'my_tasks_get', description: myTasksGetDescription, schema: MyTasksGetSchema, implementation: myTasksGet },
    { name: 'contacts_get', description: contactsGetDescription, schema: ContactsGetSchema, implementation: contactsGet },
    { name: 'rooms_create', description: roomsCreateDescription, schema: RoomsCreateSchema, implementation: roomsCreate },
    { name: 'rooms_get', description: roomsGetDescription, schema: RoomsGetSchema, implementation: roomsGet },
    { name: 'rooms_update', description: roomsUpdateDescription, schema: RoomsUpdateSchema, implementation: roomsUpdate },
    { name: 'rooms_delete', description: roomsDeleteDescription, schema: RoomsDeleteSchema, implementation: roomsDelete },
    { name: 'messages_get', description: messagesGetDescription, schema: MessagesGetSchema, implementation: messagesGet },
    { name: 'tasks_list', description: tasksListDescription, schema: TasksListSchema, implementation: tasksList },
    { name: 'tasks_create', description: tasksCreateDescription, schema: TasksCreateSchema, implementation: tasksCreate },
    { name: 'tasks_get', description: tasksGetDescription, schema: TasksGetSchema, implementation: tasksGet },
    { name: 'files_list', description: filesListDescription, schema: FilesListSchema, implementation: filesList },
    { name: 'files_get', description: filesGetDescription, schema: FilesGetSchema, implementation: filesGet },
    { name: 'members_list', description: membersListDescription, schema: MembersListSchema, implementation: membersList },
    { name: 'members_update', description: membersUpdateDescription, schema: MembersUpdateSchema, implementation: membersUpdate },
    { name: 'incoming_requests_list', description: incomingRequestsListDescription, schema: IncomingRequestsListSchema, implementation: incomingRequestsList },
    { name: 'incoming_requests_approve', description: incomingRequestsApproveDescription, schema: IncomingRequestsApproveSchema, implementation: incomingRequestsApprove },
    { name: 'incoming_requests_reject', description: incomingRequestsRejectDescription, schema: IncomingRequestsRejectSchema, implementation: incomingRequestsReject },
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