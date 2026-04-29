'use strict';

const { createSummarizeTool } = require('./tools/summarize');
const { createClaimIdsTool } = require('./tools/fetchClaims');
const { createMaterialNumberTool } = require('./tools/retrieveMatNr');
const { createRetrieveLongTextsTool } = require('./tools/retrieveLongTexts');

function createTools(db) {
    return [
        createSummarizeTool(),
        createClaimIdsTool(),
        createMaterialNumberTool(),
        createRetrieveLongTextsTool(),
    ];
}

module.exports = { createTools };
