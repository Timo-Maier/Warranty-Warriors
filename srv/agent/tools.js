'use strict';

const { createMaterialNumberTool } = require('./tools/retrieveMatNr');
const { createLongTextsFromClaimIdsTool } = require('./tools/fetchLongTextsFromClaims');
const { createAnalyzeDataTool } = require('./tools/analyzeData');

function createTools(db) {
    return [
        createMaterialNumberTool(),
        createLongTextsFromClaimIdsTool(),
        createAnalyzeDataTool()
    ];
}

module.exports = { createTools };
