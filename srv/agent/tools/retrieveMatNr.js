'use strict';

const { z } = require('zod');
const getMatNr = require('../../utils/getMatNr');

function createVectorSearchTool(db) {
    const { tool } = require('@langchain/core/tools');

    return tool(
        async ({ caseDesc }) => {
            return await getMatNr(caseDesc);
        }
    );
}

module.exports = { createVectorSearchTool };
