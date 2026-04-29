'use strict';

const { z } = require('zod');
const fetchClaims = require('../../utils/fetchWTYClaims');

function createClaimIdsTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ matNrs, useMhNr }) => {
            return await fetchClaims(matNrs, useMhNr);
        },
        {
            name: 'fetch_claim_ids',
            description:
                'Get the ids of the claims matching the given material numbers. Fetching either based on Mann Hummel material number or customer material number determined by boolean.',
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

module.exports = { createClaimIdsTool };
