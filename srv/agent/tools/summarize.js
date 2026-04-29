'use strict';

const { z } = require('zod');

const SUMMARIZE_PROMPT = `You are an automotive warranty analyst. Given a list of workshop long texts from warranty claims, summarize the fault pattern and identify recurring issues. The texts may be in multiple languages (German, English, Turkish, Spanish, Polish, Czech, Hungarian, Swedish, Norwegian, French, Italian, Finnish). Respond in English with a structured summary.`;

const MODEL_NAME = 'anthropic--claude-4.6-opus';

function createSummarizeTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ longTexts }) => {
            console.log(`Summarizing ${longTexts.length} long texts from claims`);
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
                new HumanMessage(`Can you analize the following long texts for me and give a report on potential issues or patterns:\n${combined}`),
            ]);
            return response.content;
        },
        {
            name: 'summarize_claims',
            description:
                'Summarizes and analyzes a list of claim long texts and identifies patterns. Pass the longText values from fetch_long_text_from_material_numbers results.',
            schema: z.object({
                longTexts: z
                    .array(z.string())
                    .min(1)
                    .describe('Array of claim long text strings to summarize'),
            }),
        }
    );
}

module.exports = { createSummarizeTool };
