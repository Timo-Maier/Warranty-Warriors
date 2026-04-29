'use strict';

/**
 * Creates a compiled LangGraph ReAct agent backed by SAP AI Core.
 *
 * Credentials are read automatically by @sap-ai-sdk from:
 *   - Production (CF/BTP): VCAP_SERVICES.aicore[0].credentials binding
 *   - Local dev:           ~/.aicore/config.json
 *       {
 *         "AICORE_SERVICE_KEY": {
 *           "clientid": "...",
 *           "clientsecret": "...",
 *           "url": "https://<auth-url>",
 *           "serviceurls": { "AI_API_URL": "https://<api-url>" }
 *         }
 *       }
 *
 * Session persistence:
 *   MemorySaver keeps all thread histories in-process. Each unique thread_id
 *   (user + sessionId) gets its own isolated message history that is replayed
 *   automatically on every invoke() call.
 *   To persist across restarts or CF instances, swap MemorySaver for
 *   @langchain/langgraph-checkpoint-postgres and point it at a PostgreSQL DB.
 */

const { createTools } = require('./tools');

// Model name as registered in SAP Generative AI Hub
const MODEL_NAME = 'anthropic--claude-4.6-opus';

// Singleton: one compiled agent with one shared checkpointer for all sessions
let _agent = null;

async function getAgent(db) {
    if (_agent) return _agent;

    const { OrchestrationClient } = await import('@sap-ai-sdk/langchain');
    const { createReactAgent } = await import('@langchain/langgraph/prebuilt');
    const { MemorySaver } = await import('@langchain/langgraph');

    const llm = new OrchestrationClient({
        promptTemplating: {
            model: {
                name: MODEL_NAME,
                params: { max_tokens: 64000 },
            },
        },
    });

    const tools = createTools(db);
    const checkpointer = new MemorySaver();

    _agent = createReactAgent({ llm, tools, checkpointSaver: checkpointer });
    return _agent;
}

module.exports = { getAgent };
