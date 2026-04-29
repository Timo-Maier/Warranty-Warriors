'use strict';

const { z } = require('zod');
const getMatNr = require('../../utils/getMatNr');

const SUMMARIZE_PROMPT = `You are a SAP Cloud Application Programming Model expert. You are working with an entity of the following structure:
    entity EnrichedClaims {
        key claimId : String;
        key caseDescription : String;
            country: String;
            productionDate: String;
            longText: String(5000); 
    }
    
    You need to create a javascript object to replace the queryObject variable in the where condition of the following query:
    const claims = await SELECT.from(EnrichedClaims).where({caseDescription: caseDescription}).where(queryObject).limit(1000);
    The country is a ISO country code (two character length)
`;

const MODEL_NAME = 'anthropic--claude-4.6-opus';

function createFilterQueryTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ queryPromt }) => {
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
            const getQuery = await client.invoke([
                new SystemMessage(SUMMARIZE_PROMPT),
                new HumanMessage(`The input prompt is: ${queryPromt}. Can you please return the respective query object and only this object. Nothing else. Please use double quotes and not single quotes`),
            ]);
            const scopedPrompt = getQuery.content;
            const match = scopedPrompt.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const formattedMatch = match ? match[1].trim() : null
            const query = JSON.parse(formattedMatch);
            return query;
        },
        {
            name: 'create_query_from_prompt',
            description:
                'Skill to create a query based on a user prompt describing how the claims should be filtered. The output should be a valid cap cqn query that can be used to filter the claims in the database. This skill should only be executed if the user wants to analyze based on certain conditions',
            schema: z.object({
                queryPromt: z
                    .string()
                    .describe('Input prompt which specifies how the claims should be filtered'),
            }),
        }
    );
}

module.exports = { createFilterQueryTool };
