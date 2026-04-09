import fs from 'node:fs/promises';
import path from 'node:path';

const SUPPORTED_SOCIETIES = new Set([
  'ABG',
  'AGS',
  'AMG',
  'EEO',
  'IX',
  'MAT',
  'MDR',
  'NTHS',
  'OPS',
  'PAM',
  'PTK',
  'PRS',
  'PTE',
  'PB',
  'SALUTE',
  'SCE',
  'SKD'
]);

let cachedCatalog = null;

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (char !== '\r') {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export async function loadCourseCatalog() {
  if (cachedCatalog) return cachedCatalog;

  const csvPath = path.join(process.cwd(), 'data', 'course-catalog.csv');
  const raw = await fs.readFile(csvPath, 'utf8');
  const rows = parseCsv(raw).filter((row) => row.some((value) => String(value || '').trim()));
  const [header = [], ...records] = rows;

  const normalizedHeader = header.map((value) => String(value || '').trim().toUpperCase());
  const societyColumns = normalizedHeader.reduce((accumulator, columnName, index) => {
    if (SUPPORTED_SOCIETIES.has(columnName)) {
      accumulator[columnName] = index;
    }
    return accumulator;
  }, {});

  const programIndex = normalizedHeader.findIndex((columnName) => columnName === 'PROGRAM');
  const societyMap = {};
  const programMap = {};

  records.forEach((record) => {
    const courseCode = String(record[0] || '').trim().toUpperCase();
    if (!courseCode) return;

    societyMap[courseCode] = Object.entries(societyColumns)
      .filter(([, columnIndex]) => String(record[columnIndex] || '').trim().toUpperCase() === 'X')
      .map(([societyCode]) => societyCode);

    if (programIndex >= 0) {
      programMap[courseCode] = String(record[programIndex] || '').trim();
    }
  });

  cachedCatalog = { societyMap, programMap };
  return cachedCatalog;
}
