/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ToolInvocation } from './tools.js';
import { BaseDeclarativeTool, type Todo, type ToolResult } from './tools.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
export declare const WRITE_TODOS_DESCRIPTION = "This tool can help you list out the current subtasks that are required to be completed for a given user request. The list of subtasks helps you keep track of the current task, organize complex queries and help ensure that you don't miss any steps. With this list, the user can also see the current progress you are making in executing a given task.\n\nDepending on the task complexity, you should first divide a given task into subtasks and then use this tool to list out the subtasks that are required to be completed for a given user request.\nEach of the subtasks should be clear and distinct. \n\nUse this tool for complex queries that require multiple steps. If you find that the request is actually complex after you have started executing the user task, create a todo list and use it. If execution of the user task requires multiple steps, planning and generally is higher complexity than a simple Q&A, use this tool.\n\nDO NOT use this tool for simple tasks that can be completed in less than 2 steps. If the user query is simple and straightforward, do not use the tool. If you can respond with an answer in a single turn then this tool is not required.\n\n## Task state definitions\n\n- pending: Work has not begun on a given subtask.\n- in_progress: Marked just prior to beginning work on a given subtask. You should only have one subtask as in_progress at a time.\n- completed: Subtask was successfully completed with no errors or issues. If the subtask required more steps to complete, update the todo list with the subtasks. All steps should be identified as completed only when they are completed.\n- cancelled: As you update the todo list, some tasks are not required anymore due to the dynamic nature of the task. In this case, mark the subtasks as cancelled.\n\n\n## Methodology for using this tool\n1. Use this todo list as soon as you receive a user request based on the complexity of the task.\n2. Keep track of every subtask that you update the list with.\n3. Mark a subtask as in_progress before you begin working on it. You should only have one subtask as in_progress at a time.\n4. Update the subtask list as you proceed in executing the task. The subtask list is not static and should reflect your progress and current plans, which may evolve as you acquire new information.\n5. Mark a subtask as completed when you have completed it.\n6. Mark a subtask as cancelled if the subtask is no longer needed.\n7. You must update the todo list as soon as you start, stop or cancel a subtask. Don't batch or wait to update the todo list.\n\n\n## Examples of When to Use the Todo List\n\n<example>\nUser request: Create a website with a React for creating fancy logos using gemini-2.5-flash-image\n\nToDo list created by the agent:\n1. Initialize a new React project environment (e.g., using Vite).\n2. Design and build the core UI components: a text input (prompt field) for the logo description, selection controls for style parameters (if the API supports them), and an image preview area.\n3. Implement state management (e.g., React Context or Zustand) to manage the user's input prompt, the API loading status (pending, success, error), and the resulting image data.\n4. Create an API service module within the React app (using \"fetch\" or \"axios\") to securely format and send the prompt data via an HTTP POST request to the specified \"gemini-2.5-flash-image\" (Gemini model) endpoint.\n5. Implement asynchronous logic to handle the API call: show a loading indicator while the request is pending, retrieve the generated image (e.g., as a URL or base64 string) upon success, and display any errors.\n6. Display the returned \"fancy logo\" from the API response in the preview area component.\n7. Add functionality (e.g., a \"Download\" button) to allow the user to save the generated image file.\n8. Deploy the application to a web server or hosting platform.\n\n<reasoning>\nThe agent used the todo list to break the task into distinct, manageable steps:\n1. Building an entire interactive web application from scratch is a highly complex, multi-stage process involving setup, UI development, logic integration, and deployment.\n2. The agent inferred the core functionality required for a \"logo creator,\" such as UI controls for customization (Task 3) and an export feature (Task 7), which must be tracked as distinct goals.\n3. The agent rightly inferred the requirement of an API service model for interacting with the image model endpoint.\n</reasoning>\n</example>\n\n\n## Examples of When NOT to Use the Todo List\n\n<example>\nUser request: Ensure that the test <test file> passes.\n\nAgent:\n<Goes into a loop of running the test, identifying errors, and updating the code until the test passes.>\n\n<reasoning>\nThe agent did not use the todo list because this task could be completed by a tight loop of execute test->edit->execute test.\n</reasoning>\n</example>\n";
export interface WriteTodosToolParams {
    /**
     * The full list of todos. This will overwrite any existing list.
     */
    todos: Todo[];
}
export declare class WriteTodosTool extends BaseDeclarativeTool<WriteTodosToolParams, ToolResult> {
    static readonly Name = "write_todos";
    constructor(messageBus: MessageBus);
    get schema(): {
        name: string;
        description: string;
        parametersJsonSchema: unknown;
        responseJsonSchema: {
            type: string;
            properties: {
                todos: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            description: {
                                type: string;
                            };
                            status: {
                                type: string;
                                enum: readonly ["pending", "in_progress", "completed", "cancelled"];
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                    };
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
    };
    protected validateToolParamValues(params: WriteTodosToolParams): string | null;
    protected createInvocation(params: WriteTodosToolParams, messageBus: MessageBus, _toolName?: string, _displayName?: string): ToolInvocation<WriteTodosToolParams, ToolResult>;
}
