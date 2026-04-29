'use strict';

const { z } = require('zod');
const getMatNr = require('../../utils/getMatNr');

const SUMMARIZE_PROMPT = `You are an automotive warranty analyst asssistant. Given a list of workshop long texts from warranty claims, assist the user in analyzing the data to his needs. The texts may be in multiple languages (German, English, Turkish, Spanish, Polish, Czech, Hungarian, Swedish, Norwegian, French, Italian, Finnish). Respond in English with a structured summary.`;

const MODEL_NAME = 'anthropic--claude-4.6-opus';

function createAnalyzeDataTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ scope }) => {
            console.log(`Analyzing data.`);

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
            const getScopedPrompt = await client.invoke([
                new SystemMessage(SUMMARIZE_PROMPT),
                new HumanMessage(`Write a prompt that analyzes data that stores a long text description, country and production date of a warranty claim based on this scope: ${scope}`),
            ]);
            const scopedPrompt = getScopedPrompt.content;

            const { EnrichedClaims } = this.entities;
            const claims = await SELECT.from(EnrichedClaims).limit({ rows: 1000 });
            const longTexts = [...new Set(
                claims.map(c => JSON.parse(c.value).longText)
            )];
            const combined = longTexts.join('\n---\n');
            const getAnalysis = await client.invoke([
                new SystemMessage(SUMMARIZE_PROMPT),
                new HumanMessage(`${scopedPrompt}:\n${combined}`)
            ]);
            const analysis = getAnalysis.content;
            return analysis
        },
        {
            name: 'analyze_data',
            description:
                'Analyzing the enriched claims data stored in the database based on the prompted specifications.',
            schema: z.object({
                scope: z
                    .string()
                    .describe('Description what the analysis should focus on.'),
            }),
        }
    );
}

module.exports = { createMaterialNumberTool };
