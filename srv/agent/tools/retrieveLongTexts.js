'use strict';

const { z } = require('zod');
const cds = require('@sap/cds');

function createRetrieveLongTextsTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ claimIDs }) => {
            console.log(`Retrieving long texts for claim IDs`);
            const { ClaimLongText } = cds.entities("warranty.warriors");
            const claimLongText = await SELECT.from(ClaimLongText).where({ claim: { in: claimIDs } });
            return claimLongText.map(claim => claim.longText);
        },
        {
            name: 'retrieve_claim_long_texts',
            description:
                'Retrieve and return the long texts of claims based on the given claim ids. Pass the claimIDs values from fetch_claim_ids results.',
            schema: z.object({
                claimIDs: z
                    .array(z.string())
                    .min(1)
                    .describe('Array of claim IDs for which the long texts should be extracted'),
            }),
        }
    );
}

module.exports = { createRetrieveLongTextsTool };
