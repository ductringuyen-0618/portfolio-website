// PDF Knowledge Base Loader
// This utility will load PDFs from the knowledge-base folder for future expansion

export interface KnowledgeDocument {
  id: string;
  filename: string;
  title: string;
  content: string;
  url: string;
  lastModified?: Date;
}

export class PDFKnowledgeLoader {
  private baseUrl = '/portfolio-website/knowledge-base/';
  private documents: KnowledgeDocument[] = [];

  constructor() {
    // For now, we'll hardcode the available PDFs
    // In the future, this could dynamically scan the folder
    this.initializeDocuments();
  }

  private initializeDocuments(): void {
    // Define known PDFs in the knowledge base folder
    const knownPDFs = [
      {
        filename: 'resume.pdf',
        title: 'Complete Resume - Duc Nguyen',
        description: 'Full professional resume including work experience, technical skills, education, and projects'
      }
    ];

    this.documents = knownPDFs.map(pdf => ({
      id: pdf.filename.replace('.pdf', ''),
      filename: pdf.filename,
      title: pdf.title,
      content: pdf.description,
      url: this.baseUrl + pdf.filename
    }));
  }

  getAvailableDocuments(): KnowledgeDocument[] {
    return this.documents;
  }

  getDocumentByFilename(filename: string): KnowledgeDocument | null {
    return this.documents.find(doc => doc.filename === filename) || null;
  }

  // Future method: This would actually parse PDF content
  async loadPDFContent(filename: string): Promise<string> {
    // For now, return a message about PDF availability
    const doc = this.getDocumentByFilename(filename);
    if (!doc) {
      return 'PDF document not found in knowledge base.';
    }
    
    return `PDF Document: ${doc.title} - Available for download at ${doc.url}. This document contains comprehensive information about Duc Nguyen's professional background.`;
  }

  // Method to add new PDFs (for future expansion)
  addDocument(document: KnowledgeDocument): void {
    this.documents.push(document);
  }
}

// Export singleton instance
export const pdfKnowledgeLoader = new PDFKnowledgeLoader();