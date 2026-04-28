const cds = require('@sap/cds');

class ClaimService extends cds.ApplicationService {
    init () {
        const { Reports } = this.entities;

        this.on("READ", Reports, this.fetchClaims);

        return super.init();
    }

    async fetchClaims(req) {
        const { Reports } = this.entities;
        const caseDesc = req.query.SELECT.where?.[2]?.val;
        if (!caseDesc) return req.reject(400, 'caseDescription filter is required');

        const mhRows = await SELECT.from(Reports)
            .where({ caseDescription: caseDesc, matNrMH: { '!=': 'PWYEMA1000' } });

        const custRows = await SELECT.from(Reports)
            .where({ caseDescription: caseDesc, matNrCust: { '!=': '#' } });

        const mhSum = mhRows.reduce((sum, r) => sum + (r.claimsCount || 0), 0);

        const custSum = custRows.reduce((sum, r) => sum + (r.claimsCount || 0), 0);
        
        return mhSum >= custSum ? mhRows : custRows;
    }
}

module.exports = ClaimService;