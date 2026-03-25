export interface ScholarSourceSection {
  sourceLabel: string;
  content: string;
}

export interface ScholarChunkBlock {
  sourceLabel: string;
  pageLabel: string;
  text: string;
  charCount: number;
}

const SOURCE_PATTERN = /^\[Source:\s*(.+?)\]\s*$/;
const MAX_CHUNK_CHARS = 1200;

function normalizeText(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
}

function splitParagraphs(text: string) {
  return normalizeText(text)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function splitLongParagraph(paragraph: string, maxChars = MAX_CHUNK_CHARS) {
  if (paragraph.length <= maxChars) return [paragraph];

  const sentences = paragraph
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    const pieces: string[] = [];
    for (let i = 0; i < paragraph.length; i += maxChars) {
      pieces.push(paragraph.slice(i, i + maxChars).trim());
    }
    return pieces.filter(Boolean);
  }

  const chunks: string[] = [];
  let buffer = '';

  for (const sentence of sentences) {
    const next = buffer ? `${buffer} ${sentence}` : sentence;
    if (next.length > maxChars && buffer) {
      chunks.push(buffer);
      buffer = sentence;
      continue;
    }
    buffer = next;
  }

  if (buffer) chunks.push(buffer);
  return chunks.filter(Boolean);
}

function groupParagraphsIntoChunks(paragraphs: string[], sourceLabel: string, maxChars = MAX_CHUNK_CHARS) {
  const chunks: ScholarChunkBlock[] = [];
  let buffer = '';
  let pageIndex = 1;

  const flush = () => {
    const trimmed = buffer.trim();
    if (!trimmed) return;
    chunks.push({
      sourceLabel,
      pageLabel: `Chunk ${pageIndex}`,
      text: trimmed,
      charCount: trimmed.length,
    });
    buffer = '';
    pageIndex += 1;
  };

  for (const paragraph of paragraphs) {
    const segments = splitLongParagraph(paragraph, maxChars);
    for (const segment of segments) {
      const candidate = buffer ? `${buffer}\n\n${segment}` : segment;
      if (candidate.length > maxChars && buffer) {
        flush();
        buffer = segment;
      } else {
        buffer = candidate;
      }
    }
  }

  flush();
  return chunks;
}

export function splitScholarSourceSections(content: string): ScholarSourceSection[] {
  const normalized = normalizeText(content);
  if (!normalized) return [];

  const lines = normalized.split('\n');
  const sections: ScholarSourceSection[] = [];
  let activeLabel = 'Combined Material';
  let buffer: string[] = [];

  const flush = () => {
    const joined = buffer.join('\n').trim();
    if (joined) {
      sections.push({ sourceLabel: activeLabel, content: joined });
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = line.trim().match(SOURCE_PATTERN);
    if (match) {
      flush();
      activeLabel = match[1].trim() || 'Combined Material';
      continue;
    }
    buffer.push(line);
  }

  flush();

  if (sections.length === 0) {
    return [{ sourceLabel: 'Combined Material', content: normalized }];
  }

  return sections;
}

export function buildScholarChunkManifest(content: string, pdfNames: string[] = []) {
  const sections = splitScholarSourceSections(content);
  const sourceBlocks = sections.flatMap((section) => {
    const paragraphs = splitParagraphs(section.content);
    return groupParagraphsIntoChunks(paragraphs.length > 0 ? paragraphs : [section.content], section.sourceLabel);
  });

  const manifestLines: string[] = [
    'SCHOLAR READING MAP:',
    `Total sources: ${sections.length}`,
    `Attached PDF files: ${pdfNames.length > 0 ? pdfNames.join(', ') : 'none'}`,
    '',
  ];

  sourceBlocks.forEach((chunk, index) => {
    manifestLines.push(`[SOURCE ${index + 1}] ${chunk.sourceLabel}`);
    manifestLines.push(`[${chunk.pageLabel}] ${chunk.text}`);
    manifestLines.push('');
  });

  if (manifestLines.length === 4) {
    manifestLines.push('[SOURCE 1] Combined Material');
    manifestLines.push(`[Chunk 1] ${normalizeText(content)}`);
  }

  return {
    manifest: manifestLines.join('\n').trim(),
    sourceCount: sections.length || 1,
    chunkCount: sourceBlocks.length || 1,
    sourceLabels: sections.map((section) => section.sourceLabel),
  };
}
