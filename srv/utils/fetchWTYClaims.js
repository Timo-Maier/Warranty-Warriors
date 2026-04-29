const cds = require('@sap/cds');

const fetchClaims = async (matNrs, useMhNr) => {
    const srv = await cds.connect.to('DATASPHERE');
    const filteredField = useMhNr ? '_BIC_WTYMM_096' : '_BIC_WTYMM_123';
    const filterQuery = matNrs.map(matNr => `${filteredField} eq '${matNr}'`).join(' or ');
    const response = await srv.get(`/api/v1/datasphere/consumption/relational/IT_MAIN01/C1VF_WTY_0002/C1VF_WTY_0002?$select=AU_CLMNO,_BIC_WTYMM_058,WM_PROD_D&$apply=filter(${filterQuery})/groupby((AU_CLMNO))`, matNrs)
    return response.value.map(claim => {
        return {
            claimId: claim.AU_CLMNO,
            country: claim.WTYMM_058,
            prodDate: claim.WM_PROD_D
        }
    });
}

module.exports = fetchClaims;