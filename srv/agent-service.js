'use strict';

const cds = require('@sap/cds');
const { createAgent } = require('./agent/agent');

module.exports = class AgentService extends cds.ApplicationService {
    async init() {
        this.on('analyzeWarrantyClaims', async (req) => {
            const { query } = req.data;
            if (!query) return req.reject(400, 'query parameter is required');

            const { HumanMessage } = await import('@langchain/core/messages');

            const agent = await createAgent(cds.db);
            const result = await agent.invoke({
                messages: [new HumanMessage(query)],
            });

            return result.messages.at(-1).content;
        });

        return super.init();
    }
};
