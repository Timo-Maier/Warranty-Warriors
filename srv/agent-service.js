'use strict';

const cds = require('@sap/cds');
const { getAgent } = require('./agent/agent');

module.exports = class AgentService extends cds.ApplicationService {
    async init() {
        this.on('analyzeWarrantyClaims', async (req) => {
            const { query } = req.data;
            if (!query) return req.reject(400, 'query parameter is required');

            const { HumanMessage } = await import('@langchain/core/messages');

            // One thread per user. For multiple parallel conversations per user,
            // read an optional x-session-id request header and append it here.
            const userId = req.user?.id ?? 'anonymous';
            const sessionId = req.headers?.['x-session-id'];
            const threadId = sessionId ? `${userId}:${sessionId}` : userId;

            const agent = await getAgent(cds.db);

            let finalContent;
            const stream = agent.streamEvents(
                { messages: [new HumanMessage(query)] },
                { version: 'v2', configurable: { thread_id: threadId } }
            );
            for await (const event of stream) {
                if (event.event === 'on_tool_start') {
                    console.log(`[Agent] Tool call: ${event.name}`, JSON.stringify(event.data?.input ?? {}));
                } else if (event.event === 'on_tool_end') {
                    console.log(`[Agent] Tool done: ${event.name}`);
                } else if (event.event === 'on_chat_model_start') {
                    console.log('[Agent] LLM thinking...');
                } else if (event.event === 'on_chat_model_end') {
                    const toolCalls = event.data?.output?.tool_calls ?? event.data?.output?.additional_kwargs?.tool_calls;
                    if (toolCalls?.length) {
                        console.log('[Agent] LLM decided to call:', toolCalls.map(t => t.name ?? t.function?.name).join(', '));
                    } else {
                        console.log('[Agent] LLM produced final response');
                    }
                } else if (event.event === 'on_chain_end' && event.name === 'LangGraph') {
                    finalContent = event.data?.output?.messages?.at(-1)?.content;
                }
            }

            return finalContent;
        });

        return super.init();
    }
};
