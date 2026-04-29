'use strict';

const { createMaterialNumberTool } = require('./tools/retrieveMatNr');
const { createLongTextsFromClaimIdsTool } = require('./tools/fetchLongTextsFromClaims');
const { createAnalyzeDataTool } = require('./tools/analyzeData');
const { createFilterQueryTool } = require('./tools/createFilterQuery');

function createTools(db) {
    return [
        createMaterialNumberTool(),
        createLongTextsFromClaimIdsTool(),
        createAnalyzeDataTool(),
        createFilterQueryTool()
    ];
}

module.exports = { createTools };
