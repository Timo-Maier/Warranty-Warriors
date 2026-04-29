const cds = require('@sap/cds');

const getMatNr = async (caseDesc) => {
    const { Reports } = cds.entities('warranty.warriors');

    const mhRows = await SELECT`matNrMH, claimsCount`.from(Reports)
        .where({ caseDescription: caseDesc, matNrMH: { '!=': 'PWYEMA1000' } });

    const custRows = await SELECT`matNrCust, claimsCount`.from(Reports)
        .where({ caseDescription: caseDesc, matNrCust: { '!=': '#' } });

    const mhSum = mhRows.reduce((sum, r) => sum + (r.claimsCount || 0), 0);

    const custSum = custRows.reduce((sum, r) => sum + (r.claimsCount || 0), 0);

    return {
        MatNrMH: {
            claimsCount: mhSum,
            matNr: mhRows.map(r => r.matNrMH)
        },
        MatNrCust: {
            claimsCount: custSum,
            matNr: custRows.map(r => r.matNrCust)
        }
    };
}

module.exports = getMatNr;