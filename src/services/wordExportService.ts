import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export const wordExportService = {
  toWord: async (text: string, fileName: string): Promise<void> => {
    const lines = text.split('\n');
    const paragraphs = lines.map(line => {
      if (line.trim().startsWith('---') && line.trim().endsWith('---')) {
        return new Paragraph({
          text: line.replace(/---/g, '').trim(),
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 120 },
        });
      }
      return new Paragraph({
        children: [new TextRun({ text: line, size: 24, font: 'Arial' })],
        spacing: { after: 60 },
      });
    });

    const doc = new Document({
      creator: 'Vimana 360 — Chingaté Abogados',
      title: fileName,
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'VIMANA 360 — CHINGATÉ ABOGADOS',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Archivo: ${fileName} | Fecha: ${new Date().toLocaleDateString('es-ES')}`, italics: true, color: '666666', size: 20 })],
            spacing: { after: 400 },
          }),
          ...paragraphs,
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_vimana360.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  toTxt: (text: string, fileName: string): void => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_vimana360.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  toClipboard: async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
  },
};
