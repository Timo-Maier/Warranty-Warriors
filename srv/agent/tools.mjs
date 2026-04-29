import { createVectorSearchTool } from './tools/vectorSearch.mjs';
import { createSummarizeTool } from './tools/summarize.mjs';

export function createTools(db) {
    return [
        createVectorSearchTool(db),
        createSummarizeTool(),
    ];
}
