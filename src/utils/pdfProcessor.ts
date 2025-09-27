// PDF processing disabled in browser environment to prevent CDN worker errors

interface PDFDocument {
  id: string;
  filename: string;
  text: string;
  pageCount: number;
  lastModified: number;
}

class PDFProcessor {
  private cache: Map<string, PDFDocument> = new Map();
  
  async processPDFFromURL(_url: string, _id: string): Promise<PDFDocument | null> {
    // PDF processing disabled to prevent CDN worker errors
    console.log('📄 PDF processing disabled (prevents CDN worker errors)');
    return null;
  }
  
  clearCache(): void {
    this.cache.clear();
  }
  
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const pdfProcessor = new PDFProcessor();

// Export types
export type { PDFDocument };