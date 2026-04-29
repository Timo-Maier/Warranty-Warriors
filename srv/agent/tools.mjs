import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const SUMMARIZE_PROMPT = `You are an automotive warranty analyst. Given a list of workshop long texts from warranty claims, summarize the fault pattern and identify recurring issues. The texts may be in multiple languages (German, English, Turkish, Spanish, Polish, Czech, Hungarian, Swedish, Norwegian, French, Italian, Finnish). Respond in English with a structured summary.`;

export function createTools(db) {
    const vectorSearchTool = tool(
        async ({ query, limit = 5 }) => {
            try {
                // HANA: use native vector similarity; SQLite: fall back to plain text search
                const rows = await db.run(
                    `SELECT claim, longText,
                        cosine_similarity(
                            embedding,
                            to_real_vector(vector_embedding(:query, 'QUERY', 'SAP_NEB.20240715'))
                        ) AS score
                     FROM WARRANTY_WARRIORS_CLAIMLONGTEXT
                     ORDER BY score DESC
                     LIMIT :limit`,
                    { query, limit }
                );
                return JSON.stringify(rows);
            } catch {
                // SQLite fallback for local dev without HANA
                const cds = require('@sap/cds');
                const { ClaimLongText } = cds.entities('warranty.warriors');
                const rows = await SELECT.from(ClaimLongText)
                    .where(`longText LIKE`, `%${query}%`)
                    .limit(limit);
                return JSON.stringify(rows.map(r => ({ claim: r.claim, longText: r.longText, score: null })));
            }
        },
        {
            name: 'vector_search_claims',
            description:
                'Searches warranty claim long texts by semantic similarity. Use this to find claims related to a fault description or keyword. Returns up to 5 matching claims with their text.',
            schema: z.object({
                query: z.string().describe('The fault description or keyword to search for'),
                limit: z.number().int().min(1).max(20).optional().describe('Max number of results (default 5)'),
            }),
        }
    );

    const summarizeTool = tool(
        async ({ longTexts }) => {
            const { OrchestrationClient } = await import('@sap-ai-sdk/langchain');
            const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');

            const client = new OrchestrationClient({
                llm: { model_name: 'anthropic--claude-sonnet-4', model_params: { max_tokens: 2048 } },
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

    return [vectorSearchTool, summarizeTool];
}
