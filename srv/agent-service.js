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
            const result = await agent.invoke(
                { messages: [new HumanMessage(query)] },
                { configurable: { thread_id: threadId } }
            );

            return result.messages.at(-1).content;
        });

        return super.init();
    }
};
