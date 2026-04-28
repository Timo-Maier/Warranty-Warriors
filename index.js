const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const INPUT_FILE = path.join(__dirname, "test", "data", "Wo6M case description 2 p#.xlsx");
const SHEET_NAME = "Tabelle1";
const OUTPUT_FILE = path.join(__dirname, "test", "data", "warranty.warriors-Reports.csv");

const workbook = XLSX.readFile(INPUT_FILE);

if (!workbook.SheetNames.includes(SHEET_NAME)) {
  console.error(`Sheet "${SHEET_NAME}" not found. Available sheets: ${workbook.SheetNames.join(", ")}`);
  process.exit(1);
}

const COLUMN_MAP = {
  "case identifier": "caseId",
  "case description": "caseDescription",
  "Mat_#_M+H_installed": "matNrMH",
  "Mat_Descr_M+H": "Mat_Descr_MH",
  "Mat_#_Cust_installed": "matNrCust",
  "M+H_Proj_#_new": "MH_Proj_id_new",
  "Cust_2_Group_L2": "Cust_2_Group_L2",
  "M+H_Plant_2_Comp_Code": "MH_Plant_2_Comp_Code",
  "Number of claims all years": "claimsCount",
  "Filtration/Non filtration": "Filtration_Non_filtration",
  "Mat_0_Cust installed normed": "Mat_0_Cust_installed_normed",
  "copy of casedescription for vlookup": "copy_of_casedescription_for_vlookup",
};

const worksheet = workbook.Sheets[SHEET_NAME];
const rows = XLSX.utils.sheet_to_json(worksheet);

const schemaFields = Object.values(COLUMN_MAP);
const csvHeader = ["ID", ...schemaFields].join(",");
const csvRows = rows
  .filter((row) => {
    const v = row["Number of claims all years"];
    return v !== undefined && String(v) !== "#NV";
  })
  .map((row) => {
    const id = crypto.randomUUID();
    const values = Object.entries(COLUMN_MAP).map(([xlsxCol, schemaCol]) => {
      let v = row[xlsxCol] ?? "";
      if (schemaCol === "claimsCount") {
        return parseInt(v, 10) || 0;
      }
      const str = String(v).replace(/"/g, '""');
      return `"${str}"`;
    });
    return `"${id}",${values.join(",")}`;
  });

const csv = [csvHeader, ...csvRows].join("\n");

fs.writeFileSync(OUTPUT_FILE, csv, "utf8");
console.log(`CSV written to ${OUTPUT_FILE}`);
