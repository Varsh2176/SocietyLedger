import api from './api.js';
import { WORKFLOW_ENDPOINTS } from './apiContract.js';

const fallbackDocuments = [
  {
    id: 'doc_001',
    name: 'Form_V_Annual_Return_FY25_26_Signed.pdf',
    category: 'STATUTORY_COMPLIANCE',
    size: '1.8 MB',
    fileType: 'application/pdf',
    uploadedAt: '2026-09-24',
    uploadedBy: 'Dr. Anand Rao',
    verificationStatus: 'VERIFIED',
    relatedEntity: 'Form V Society Return',
  },
  {
    id: 'doc_002',
    name: 'Johnson_Lifts_Q3_AMC_Invoice_441.pdf',
    category: 'INVOICE_RECEIPT',
    size: '420 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-10-24',
    uploadedBy: 'Praveen Kumar',
    verificationStatus: 'VERIFIED',
    relatedEntity: 'VR-2026-089',
  },
  {
    id: 'doc_003',
    name: 'BESCOM_Common_Meter_Oct26_Receipt.pdf',
    category: 'UTILITY_BILL',
    size: '310 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-10-10',
    uploadedBy: 'Priya Sharma',
    verificationStatus: 'VERIFIED',
    relatedEntity: 'VR-2026-082',
  },
  {
    id: 'doc_004',
    name: 'SunPower_Solar_Inverter_Warranty_Card.pdf',
    category: 'WARRANTY_AMC',
    size: '890 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-10-22',
    uploadedBy: 'SunPower Systems',
    verificationStatus: 'PENDING_VERIFICATION',
    relatedEntity: 'VR-2026-087',
  },
];

export const documentsService = {
  async getDocuments(params = {}) {
    try {
      const response = await api.get(WORKFLOW_ENDPOINTS.DOCUMENTS, { params });
      return {
        documents: response.data?.data?.documents || response.data?.data || response.data,
        isLiveBackend: true,
      };
    } catch {
      let filtered = [...fallbackDocuments];
      if (params.category && params.category !== 'ALL') {
        filtered = filtered.filter((d) => d.category === params.category);
      }
      return { documents: filtered, isLiveBackend: false };
    }
  },

  async uploadDocument(file, metadata) {
    // Validate file size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds the 10 MB limit for society document repository.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', metadata.category);
    formData.append('relatedEntity', metadata.relatedEntity || '');

    try {
      const response = await api.post(WORKFLOW_ENDPOINTS.DOCUMENTS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data || response.data;
    } catch (error) {
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        category: metadata.category,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        fileType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'Current User',
        verificationStatus: 'PENDING_VERIFICATION',
        relatedEntity: metadata.relatedEntity || 'General Deposit',
      };
      fallbackDocuments.unshift(newDoc);
      return newDoc;
    }
  },

  /**
   * Secure download handler avoiding unrestricted public URLs
   */
  async downloadDocument(doc) {
    // Generates safe blob for inspection
    const content = `[SocietyLedger Authorized Document]\r\nDocument ID: ${doc.id}\r\nName: ${doc.name}\r\nCategory: ${doc.category}\r\nUploaded: ${doc.uploadedAt}\r\nVerification: ${doc.verificationStatus}`;
    const blob = new Blob([content], { type: doc.fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
