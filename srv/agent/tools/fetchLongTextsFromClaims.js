'use strict';

const { z } = require('zod');
const fetchClaims = require('../../utils/fetchWTYClaims');

const cds = require('@sap/cds');

function createLongTextsFromClaimIdsTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ matNrs, useMhNr }) => {
            console.log(`Retrieving long texts for material numbers: ${matNrs} using Mann Hummel material number: ${useMhNr}`);
            const claims = await fetchClaims(matNrs, useMhNr);
            const claimNumbers = claims.map(claim => claim.claimId);
            const { ClaimLongText, EnrichedClaims } = cds.entities("warranty.warriors");
            try {
                const chunkSize = 5000;
                const chunks = [];
                for (let i = 0; i < claimNumbers.length; i += chunkSize) {
                    chunks.push(claimNumbers.slice(i, i + chunkSize));
                }
                const longTextResults = await Promise.all(
                    chunks.map(chunk => SELECT.from(ClaimLongText).where({ claim: { in: chunk } }).columns('claim', 'longText'))
                );
                const longTextMap = new Map();
                for (const row of longTextResults.flat()) {
                    longTextMap.set(row.claim, row.longText);
                }

                const enrichedClaims = claims
                    .filter(claim => longTextMap.has(claim.claimId))
                    .map(claim => ({
                        claimId: claim.claimId,
                        value: JSON.stringify({
                            country: claim.country,
                            prodDate: claim.prodDate,
                            longText: longTextMap.get(claim.claimId)
                        })
                    }));

                await UPSERT.into(EnrichedClaims).entries(enrichedClaims);

                return 'Enriched claims data and saved to database. Retrieve from there.';
            } catch (e) {
                console.log(e)
            }

        },
        {
            name: 'fetch_long_text_from_material_numbers',
            description:
                'Get the long texts of the claims based on the referenced material numbers. Fetching either based on Mann Hummel material number or customer material number determined by boolean.',
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

module.exports = { createLongTextsFromClaimIdsTool };
