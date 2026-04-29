'use strict';

const { z } = require('zod');
const fetchClaims = require('../../utils/fetchWTYClaims');

const cds = require('@sap/cds');

const SUMMARIZE_PROMPT = `You are an automotive warranty analyst. Given a list of workshop long texts from warranty claims, summarize the fault pattern and identify recurring issues. The texts may be in multiple languages (German, English, Turkish, Spanish, Polish, Czech, Hungarian, Swedish, Norwegian, French, Italian, Finnish). Respond in English with a structured summary.`;

const MODEL_NAME = 'anthropic--claude-4.6-opus';

function createFetchAnalysisFromClaimsTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ matNrs, useMhNr }) => {
            console.log(`Retrieving long texts for material numbers: ${matNrs} using Mann Hummel material number: ${useMhNr}`);
            const claimNumbers = await fetchClaims(matNrs, useMhNr);
            const { ClaimLongText } = cds.entities("warranty.warriors");
            try {
                const chunkSize = 5000;
                const chunks = [];
                for (let i = 0; i < claimNumbers.length; i += chunkSize) {
                    chunks.push(claimNumbers.slice(i, i + chunkSize));
                }
                const results = await Promise.all(
                    chunks.map(chunk => SELECT.from(ClaimLongText).where({ claim: { in: chunk } }).columns('longText'))
                );
                const resultingLongTexts = [...new Set(results.flat().map(claim => claim.longText))]
                const subResults = resultingLongTexts.slice(0, 1000);
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
            const combined = subResults.join('\n---\n');
            const response = await client.invoke([
                new SystemMessage(SUMMARIZE_PROMPT),
                new HumanMessage(`Can you analize the following long texts for me and give a report on potential issues or patterns:\n${combined}`),
            ]);
                return response.content
            } catch(e) {
                console.log(e)
            }
            
        },
        {
            name: 'fetch_long_text_analysis_from_material_numbers',
            description:
                'Get the long text analysis of the claims based on the referenced material numbers. Fetching either based on Mann Hummel material number or customer material number determined by boolean.',
            schema: z.object({
                matNrs: z
                    .array(z.string())
                    .min(1)
                    .describe('Array of material numbers to search for'),
                useMhNr: z
                    .boolean()
                    .describe('Boolean determining whether to use Mann Hummel material number or not (customer)')
            }),
        }
    );
}

module.exports = { createFetchAnalysisFromClaimsTool };
