import Tesseract from 'tesseract.js';

export const ocrService = {
  extractFromImage: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const result = await Tesseract.recognize(file, 'spa+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });
    return result.data.text;
  },
};
