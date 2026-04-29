const cds = require('@sap/cds');

const fetchClaims = async (matNrs, useMhNr) => {
    const srv = await cds.connect.to('DATASPHERE');
    const filteredField = useMhNr ? '_BIC_WTYMM_096' : '_BIC_WTYMM_123';
    const filterQuery = matNrs.map(matNr => `${filteredField} eq '${matNr}'`).join(' or ');
    const response = await srv.get(`/api/v1/datasphere/consumption/relational/IT_MAIN01/C1VF_WTY_0002/C1VF_WTY_0002?$select=AU_CLMNO&$apply=filter(${filterQuery})/groupby((AU_CLMNO))`, matNrs)
    return response.value.map(claim => claim.AU_CLMNO);
}

module.exports = fetchClaims;