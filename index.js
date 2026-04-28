const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "AI Prep Tabelle.xlsx");
const SHEET_NAME = "all claims";
const OUTPUT_FILE = path.join(__dirname, "all_claims.csv");

const workbook = XLSX.readFile(INPUT_FILE);

if (!workbook.SheetNames.includes(SHEET_NAME)) {
  console.error(`Sheet "${SHEET_NAME}" not found. Available sheets: ${workbook.SheetNames.join(", ")}`);
  process.exit(1);
}

const worksheet = workbook.Sheets[SHEET_NAME];
const csv = XLSX.utils.sheet_to_csv(worksheet);

fs.writeFileSync(OUTPUT_FILE, csv, "utf8");
console.log(`CSV written to ${OUTPUT_FILE}`);
