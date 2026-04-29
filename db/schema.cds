using { cuid } from '@sap/cds/common';

namespace warranty.warriors;

entity Reports : cuid {
  caseId : String;
  caseDescription : String;
  matNrMH : String;
  matNrCust : String;
  claimsCount : Integer;
  Mat_Descr_MH : String;
  MH_Proj_id_new : String;
  Cust_2_Group_L2 : String; 
  MH_Plant_2_Comp_Code: String; 
  Remark1 : String; 
  Remark2 : String;
  id_of_claims_in_actual_Wo6M : String;
  id_in_returned_parts : String; 
  Filtration_Non_filtration : String; 
  Mat_0_Cust_installed_normed : String; 
  additional_info_found : String;
  copy_of_casedescription_for_vlookup : String;
}

entity ClaimLongText {
  key claim : String;
    longText : String(5000);
    @cds.api.ignore
    embedding : Vector = VECTOR_EMBEDDING(
            longText, 'DOCUMENT', 'SAP_NEB.20240715'
        ) stored;
}