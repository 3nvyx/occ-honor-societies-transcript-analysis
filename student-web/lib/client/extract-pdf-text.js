let pdfJsPromise;

async function loadPdfJs() {
  if (!pdfJsPromise) {
    pdfJsPromise = import('pdfjs-dist/build/pdf.mjs').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      return pdfjsLib;
    });
  }

  return pdfJsPromise;
}

function rebuildPageText(items) {
  const lines = [];

  items.forEach((item) => {
    const value = String(item?.str || '');
    if (!value.trim()) return;

    const x = item?.transform?.[4] ?? 0;
    const y = item?.transform?.[5] ?? 0;
    const existingLine = lines.find((line) => Math.abs(line.y - y) <= 2.5);

    if (existingLine) {
      existingLine.items.push({ x, value });
      return;
    }

    lines.push({ y, items: [{ x, value }] });
  });

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) =>
      line.items
        .sort((a, b) => a.x - b.x)
        .map((chunk) => chunk.value)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean)
    .join('\n');
}

async function extractTextFromSinglePdf(file) {
  const pdfjsLib = await loadPdfJs();
  const buffer = await file.arrayBuffer();
  const task = pdfjsLib.getDocument({
    data: new Uint8Array(buffer)
  });
  const pdf = await task.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(rebuildPageText(content.items));
  }

  return pages.filter(Boolean).join('\n\n');
}

export async function extractPdfTextFromFiles(fileList) {
  const files = Array.from(fileList || []);
  const documents = [];

  for (const file of files) {
    const text = await extractTextFromSinglePdf(file);
    documents.push({
      fileName: file.name,
      text
    });
  }

  return {
    fileNames: documents.map((document) => document.fileName),
    documents,
    combinedText: documents
      .map((document) => document.text.trim())
      .filter(Boolean)
      .join('\n\n--- TRANSCRIPT SEPARATOR ---\n\n')
  };
}

export function hasUsableTranscriptText(extractedText) {
  const text = String(extractedText || '').trim();
  if (text.replace(/\s+/g, ' ').length < 120) return false;

  const signals = [
    /\bName\s*:/i,
    /\bBirth Date\s*:/i,
    /\bProgram\s*:/i,
    /\bTerm\s*:/i,
    /\bOverall\s*:/i
  ];

  return signals.filter((regex) => regex.test(text)).length >= 2;
}
