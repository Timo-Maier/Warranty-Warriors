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

  entity Search(query : String) as
        select from ww.ClaimLongText {
            claim,
            longText,
            :query as query : String,
            cosine_similarity(
                embedding, to_real_vector(
                    vector_embedding(
                        :query, 'QUERY', 'SAP_NEB.20240715'
                    )
                )
            ) as cosine_similarity : String,
            l2distance(
                embedding, to_real_vector(
                    vector_embedding(
                        :query, 'QUERY', 'SAP_NEB.20240715'
                    )
                )
            ) as l2distance : String, 
        }
        order by
            cosine_similarity desc
        limit 5;
}
