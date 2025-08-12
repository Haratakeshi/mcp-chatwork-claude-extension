import dotenv from 'dotenv';
import { ToolEnv } from '../src/chatwork/shared/types.js';

// --- Import all tools to be tested ---
import { meGet } from '../src/chatwork/tools/me/me-get.js';
import { myStatusGet } from '../src/chatwork/tools/me/my-status-get.js';
import { myTasksGet } from '../src/chatwork/tools/me/my-tasks-get.js';
import { contactsGet } from '../src/chatwork/tools/contacts/contacts-get.js';
import { roomsList } from '../src/chatwork/tools/rooms/rooms-list.js';
import { roomsGet } from '../src/chatwork/tools/rooms/rooms-get.js';
import { roomsCreate } from '../src/chatwork/tools/rooms/rooms-create.js';
import { roomsUpdate } from '../src/chatwork/tools/rooms/rooms-update.js';
import { roomsDelete } from '../src/chatwork/tools/rooms/rooms-delete.js';
import { membersList } from '../src/chatwork/tools/members/members-list.js';
import { membersUpdate } from '../src/chatwork/tools/members/members-update.js';
import { messagesList } from '../src/chatwork/tools/messages/messages-list.js';
import { messagesGet } from '../src/chatwork/tools/messages/messages-get.js';
import { messagesSend } from '../src/chatwork/tools/messages/messages-send.js';
import { tasksList } from '../src/chatwork/tools/tasks/tasks-list.js';
import { tasksGet } from '../src/chatwork/tools/tasks/tasks-get.js';
import { tasksCreate } from '../src/chatwork/tools/tasks/tasks-create.js';
import { filesList } from '../src/chatwork/tools/files/files-list.js';
import { filesGet } from '../src/chatwork/tools/files/files-get.js';
import { incomingRequestsList } from '../src/chatwork/tools/incoming-requests/incoming-requests-list.js';
import { incomingRequestsApprove } from '../src/chatwork/tools/incoming-requests/incoming-requests-approve.js';
import { incomingRequestsReject } from '../src/chatwork/tools/incoming-requests/incoming-requests-reject.js';


// .envファイルを読み込む
dotenv.config();

/**
 * Chatwork APIツールの単体テストを実行する
 */
async function runAllTests() {
  console.log('--- Running All Chatwork Tool Tests ---');

  // 1. テスト環境の準備
  const env: ToolEnv = {
    CHATWORK_API_TOKEN: process.env.CHATWORK_API_TOKEN || '',
  };

  if (!env.CHATWORK_API_TOKEN) {
    console.error('Error: CHATWORK_API_TOKEN is not set in your .env file.');
    process.exit(1);
  }

  // テストヘルパー関数
  const testTool = async (name: string, toolFn: (env: ToolEnv, input: any) => Promise<any>, input: any = {}) => {
    console.log(`\n--- Testing: ${name} ---`);
    try {
      const result = await toolFn(env, input);
      console.log('Result:', JSON.stringify(result, null, 2));
      console.log(`✅ Test Succeeded: ${name}`);
      return result;
    } catch (error) {
      console.error(`❌ Test Failed: ${name}`);
      if (error instanceof Error) {
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);
      } else {
        console.error('An unknown error occurred:', error);
      }
      throw new Error(`Test failed for ${name}`);
    }
  };

  try {
    // --- Read-only Tests (Generally safe to run) ---
    console.log('--- Running Read-only tests ---');
    await testTool('meGet', meGet);
    await testTool('myStatusGet', myStatusGet);
    await testTool('myTasksGet', myTasksGet, { status: 'open' });
    await testTool('contactsGet', contactsGet);
    const incomingRequests = await testTool('incomingRequestsList', incomingRequestsList);

    const rooms = await testTool('roomsList', roomsList);
    if (rooms && rooms.length > 0) {
      const testRoomId = String(rooms[0].room_id);
      console.log(`\n>>> Using Room ID: ${testRoomId} for dependent tests <<<`);

      await testTool('roomsGet', roomsGet, { room_id: testRoomId });
      await testTool('membersList', membersList, { room_id: testRoomId });
      
      const messages = await testTool('messagesList', messagesList, { room_id: testRoomId });
      if (messages && messages.length > 0) {
        const testMessageId = String(messages[0].message_id);
        await testTool('messagesGet', messagesGet, { room_id: testRoomId, message_id: testMessageId });
      } else {
        console.log(`\n[SKIP] No messages found in room ${testRoomId}, skipping messagesGet test.`);
      }

      const tasks = await testTool('tasksList', tasksList, { room_id: testRoomId });
      if (tasks && tasks.length > 0) {
        const testTaskId = String(tasks[0].task_id);
        await testTool('tasksGet', tasksGet, { room_id: testRoomId, task_id: testTaskId });
      } else {
        console.log(`\n[SKIP] No tasks found in room ${testRoomId}, skipping tasksGet test.`);
      }

      const files = await testTool('filesList', filesList, { room_id: testRoomId });
      if (files && files.length > 0) {
        const testFileId = String(files[0].file_id);
        // `download_url` is required for filesGet, so we just test the list here.
        // await testTool('filesGet', filesGet, { room_id: testRoomId, file_id: testFileId, create_download_url: 1 });
         console.log(`\n[INFO] filesGet test requires manual confirmation of download. Skipping automated test.`);
      } else {
        console.log(`\n[SKIP] No files found in room ${testRoomId}, skipping filesGet test.`);
      }

    } else {
      console.log('\n[WARN] No rooms found. Skipping tests that depend on a room.');
    }

    // --- Write Tests (Potentially destructive. Run with caution.) ---
    console.log('\n--- Write-related tests are SKIPPED by default. ---');
    console.log('To run them, uncomment the corresponding lines in test/tools.test.ts');

    /*
    // ** Room Tests **
    const newRoom = await testTool('roomsCreate', roomsCreate, {
      name: 'DXT Test Room',
      description: 'Room for DXT testing',
      members_admin_ids: [YOUR_ACCOUNT_ID], // Replace with a valid Account ID
    });
    if (newRoom) {
      const newRoomId = String(newRoom.room_id);
      await testTool('roomsUpdate', roomsUpdate, { room_id: newRoomId, name: 'DXT Test Room (Updated)' });
      
      // ** Members Tests **
      await testTool('membersUpdate', membersUpdate, {
        room_id: newRoomId,
        members_admin_ids: [YOUR_ACCOUNT_ID], // Replace with valid Account IDs
        members_member_ids: [],
        members_readonly_ids: [],
      });

      // ** Message Tests **
      await testTool('messagesSend', messagesSend, { room_id: newRoomId, body: 'Hello from DXT test!' });
      
      // ** Task Tests **
      await testTool('tasksCreate', tasksCreate, {
        room_id: newRoomId,
        body: 'This is a test task from DXT',
        to_ids: [YOUR_ACCOUNT_ID], // Replace with a valid Account ID
      });

      // ** Cleanup **
      await testTool('roomsDelete', roomsDelete, { room_id: newRoomId, action_type: 'delete' });
    }
    */

    /*
    // ** Incoming Requests Tests **
    if (incomingRequests && incomingRequests.length > 0) {
      const testRequestId = String(incomingRequests[0].request_id);
      // await testTool('incomingRequestsApprove', incomingRequestsApprove, { request_id: testRequestId });
      // await testTool('incomingRequestsReject', incomingRequestsReject, { request_id: testRequestId });
    } else {
      console.log('\n[SKIP] No incoming requests to test.');
    }
    */

    console.log('\n🎉🎉🎉 All runnable tests completed successfully! 🎉🎉🎉');

  } catch (error) {
    console.error('\n🔥🔥🔥 One or more tests failed. Aborting. 🔥🔥🔥');
    process.exit(1);
  }
}

runAllTests();