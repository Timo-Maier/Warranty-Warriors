'use strict';


module.exports = { 
    ...require('./fetchClaims'),
    ...require('./retrieveMatNr'),
    ...require('./retrieveLongTexts'),
    ...require('./summarize'),
    ...require('./fetchLongTextsFromClaims'),
};
