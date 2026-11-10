import { PDFParse } from 'pdf-parse';

/**
 * Extracts raw textual contents and metadata from a PDF file buffer.
 * Supports lecture slides, research papers, study guides, and syllabi.
 *
 * @param {Buffer} buffer - Raw file buffer from multer
 * @returns {Promise<{ pageCount: number, wordCount: number, characterCount: number, estimatedMinutes: number, text: string }>}
 */
export async function extractTextFromPdf(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF file buffer is empty or corrupted.');
  }

  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  await parser.load();

  const pageCount = parser.doc?.numPages || 1;
  const result = await parser.getText();
  const rawText = result?.text || '';

  // Clean up pagination headers/footers and redundant vertical whitespace
  const cleanText = rawText
    .replace(/-- \d+ of \d+ --/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleanText) {
    throw new Error('No readable text found in this PDF. It may contain scanned images without OCR.');
  }

  const words = cleanText.split(/\s+/).filter(Boolean).length;

  return {
    pageCount,
    wordCount: words,
    characterCount: cleanText.length,
    estimatedMinutes: Math.max(1, Math.ceil(words / 200)),
    text: cleanText,
  };
}

