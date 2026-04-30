using { warranty.warriors as ww } from '../db/schema';

service ClaimService @(path: '/odata/v4/claim') {
  @readonly
  entity Reports as projection on ww.Reports {
    ID,
    caseId, 
    caseDescription,
    matNrMH,
    matNrCust,
    claimsCount
  };

  entity ClaimLongText as projection on ww.ClaimLongText;
}
