'use strict';

const { z } = require('zod');
const getMatNr = require('../../utils/getMatNr');
const cds = require('@sap/cds');

const SUMMARIZE_PROMPT = `You are an automotive warranty analyst asssistant. Given a list of workshop long texts from warranty claims, assist the user in analyzing the data to his needs. The texts may be in multiple languages (German, English, Turkish, Spanish, Polish, Czech, Hungarian, Swedish, Norwegian, French, Italian, Finnish). Respond in English with a structured summary.`;

const MODEL_NAME = 'anthropic--claude-4.6-opus';

function createAnalyzeDataTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ scope, caseDescription, queryObject }) => {
            console.log(`Analyzing data.`);

            const { OrchestrationClient } = await import('@sap-ai-sdk/langchain');
            const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');

            const client = new OrchestrationClient({
                promptTemplating: {
                    model: {
                        name: MODEL_NAME,
                        params: { max_tokens: 64000 },
                    },
                },
            });
            const getScopedPrompt = await client.invoke([
                new SystemMessage(SUMMARIZE_PROMPT),
                new HumanMessage(`Write a prompt that analyzes data that stores a long text description, country and production date of a warranty claim based on this scope. Output only the prompt itself and nothing else: ${scope}`),
            ]);
            const scopedPrompt = getScopedPrompt.content;
            const { EnrichedClaims } = cds.entities("warranty.warriors");
            const formattedQueryObject = queryObject ? JSON.parse(queryObject) : {};
            const claims = await SELECT.from(EnrichedClaims).where({caseDescription: caseDescription}).where(formattedQueryObject).limit(1000);
            if (!claims) {
                throw new Error('No claims currently exist for this case description. Run fetch_long_text_from_material_numbers to get the claims data first.');
            }
            const stringifiedClaims = claims.map(claim => JSON.stringify(claim));
            const combined = stringifiedClaims.join('\n---\n');
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
                caseDescription: z
                    .string()
                    .describe('Case Description for which the material numbers should be fetched.'),
                queryObject: z
                    .string()
                    .describe('CAP CQN query object to filter the claims which should be analyzed. This parameter is optional and should not be filled if no query is required.'),
            }),
        }
    );
}

module.exports = { createAnalyzeDataTool };
