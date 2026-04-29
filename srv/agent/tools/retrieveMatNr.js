'use strict';

const { z } = require('zod');
const getMatNr = require('../../utils/getMatNr');

function createMaterialNumberTool() {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ caseDesc }) => {
            console.log(`Retrieving material numbers for case description`);
            return await getMatNr(caseDesc);
        },
        {
            name: 'retrive_material_numbers',
            description:
                'Fetching the either the material numbers from Mann Hummel or the customer based on which material numbers are linked to more claims.',
            schema: z.object({
                caseDesc: z
                    .string()
                    .describe('Case Description for which the material numbers should be fetched.'),
            }),
        }
    );
}

module.exports = { createMaterialNumberTool };
