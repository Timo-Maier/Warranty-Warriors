const cds = require('@sap/cds');

const fetchClaims = async (matNrs, useMhNr) => {
    const srv = await cds.connect.to('DATASPHERE');
    if (useMhNr) {
        await srv.get('/WTY', matNrs)
    } else {

    }
}

module.exports = fetchClaims;