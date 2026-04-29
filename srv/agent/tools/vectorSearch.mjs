import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export function createVectorSearchTool(db) {
    return tool(
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
}
