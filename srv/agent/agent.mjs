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
 */

import { OrchestrationClient } from '@sap-ai-sdk/langchain';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { createTools } from './tools.mjs';

// Model name as registered in SAP Generative AI Hub
const MODEL_NAME = 'anthropic--claude-4.6-sonnet';

export function createAgent(db) {
    const llm = new OrchestrationClient({
        promptTemplating: {
            model: {
                name: MODEL_NAME,
                params: { max_tokens: 4096 },
            }
        },
    });
    const tools = createTools(db);
    return createReactAgent({ llm, tools });
}
