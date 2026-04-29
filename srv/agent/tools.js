'use strict';

const { createSummarizeTool } = require('./tools/summarize');
const { createClaimIdsTool } = require('./tools/fetchClaims');
const { createMaterialNumberTool } = require('./tools/retrieveMatNr');
const { createRetrieveLongTextsTool } = require('./tools/retrieveLongTexts');
const { createLongTextsFromClaimIdsTool } = require('./tools/fetchLongTextsFromClaims');
const { createFetchAnalysisFromClaimsTool } = require('./tools/fetchAnalysisFromClaims');

function createTools(db) {
    return [
        // createSummarizeTool(),
        // createClaimIdsTool(),
        createMaterialNumberTool(),
        createRetrieveLongTextsTool(),
        // createLongTextsFromClaimIdsTool(),
        createFetchAnalysisFromClaimsTool()
    ];
}

module.exports = { createTools };
