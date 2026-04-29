'use strict';

const { createVectorSearchTool } = require('./tools/vectorSearch');
const { createSummarizeTool } = require('./tools/summarize');

function createTools(db) {
    return [
        createVectorSearchTool(db),
        createSummarizeTool(),
    ];
}

module.exports = { createTools };
