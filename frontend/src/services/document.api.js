import api from "./api";

// ========================================
// GET LEAD DOCUMENTS
// ========================================

export const getLeadDocumentsApi = async (leadId) => {
  const response = await api.get(`/documents/lead/${leadId}`);

  const payload = response?.data;
  const result = payload?.data || payload;
  const documents = result?.documents || result || [];

  return {
    data: Array.isArray(documents) ? documents : [],
  };
};

// ========================================
// UPLOAD DOCUMENT
// ========================================

export const uploadLeadDocumentApi = async (leadId, { file, documentType, applicationId }) => {
  const formData = new FormData();

  formData.append("document", file);
  formData.append("documentType", documentType);

  if (applicationId) {
    formData.append("applicationId", applicationId);
  }

  const response = await api.post(`/documents/lead/${leadId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const uploadDocument = async (leadId, formData) => {
  const response = await api.post(`/documents/lead/${leadId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// ========================================
// GET SINGLE DOCUMENT
// ========================================

export const getDocument = async (id) => {
  const response = await api.get(`/documents/document/${id}`);
  return response.data;
};

// ========================================
// UPDATE STATUS
// ========================================

export const updateDocumentStatus = async (id, data = {}) => {
  const response = await api.patch(`/documents/${id}/status`, {
    ...data,
    status: data.status || "VERIFIED",
  });

  return response.data;
};

export const verifyDocumentApi = async (documentId, payload = {}) => {
  const response = await api.patch(`/documents/${documentId}/verify`, {
    ...payload,
    status: "VERIFIED",
  });

  return response.data;
};

export const rejectDocumentApi = async (documentId, payload = {}) => {
  const response = await api.patch(`/documents/${documentId}/reject`, {
    ...payload,
    status: "REJECTED",
    reason: payload.reason || payload.rejectionReason,
    rejectionReason: payload.reason || payload.rejectionReason,
  });

  return response.data;
};

// ========================================
// DELETE DOCUMENT
// ========================================

export const deleteDocument = async (id) => (await api.delete(`/documents/${id}`)).data;
