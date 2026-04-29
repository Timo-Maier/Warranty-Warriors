'use strict';

const { z } = require('zod');

const SUMMARIZE_PROMPT = `You are an automotive warranty analyst. Given a list of workshop long texts from warranty claims, summarize the fault pattern and identify recurring issues. The texts may be in multiple languages (German, English, Turkish, Spanish, Polish, Czech, Hungarian, Swedish, Norwegian, French, Italian, Finnish). Respond in English with a structured summary.`;

const MODEL_NAME = 'anthropic--claude-4.6-sonnet';

function createSummarizeTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ longTexts }) => {
            const { OrchestrationClient } = await import('@sap-ai-sdk/langchain');
            const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');

            const client = new OrchestrationClient({
                promptTemplating: {
                    model: {
                        name: MODEL_NAME,
                        params: { max_tokens: 2048 },
                    },
                },
            });
            const combined = longTexts.join('\n---\n');
            const response = await client.invoke([
                new SystemMessage(SUMMARIZE_PROMPT),
                new HumanMessage(`Workshop texts:\n${combined}`),
            ]);
            return response.content;
        },
        {
            name: 'summarize_claims',
            description:
                'Summarizes a list of warranty claim long texts and identifies recurring fault patterns. Pass the longText values from vector_search_claims results.',
            schema: z.object({
                longTexts: z
                    .array(z.string())
                    .min(1)
                    .describe('Array of workshop long text strings to summarize'),
            }),
        }
    );
}

module.exports = { createSummarizeTool };
