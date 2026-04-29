'use strict';

const { z } = require('zod');
const fetchClaims = require('../../utils/fetchWTYClaims');

const cds = require('@sap/cds');

function createLongTextsFromClaimIdsTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ matNrs, useMhNr }) => {
            const claimNumbers = await fetchClaims(matNrs, useMhNr);
            const { ClaimLongText } = cds.entities("warranty.warriors");
            try {
                const claimLongText = await SELECT.from(ClaimLongText).where({ claim: { in: claimNumbers } });
                return claimLongText.map(claim => claim.longText);
            } catch(e) {
                console.log(e)
            }
            
        },
        {
            name: 'fetch_long_text_from_claim_ids',
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
