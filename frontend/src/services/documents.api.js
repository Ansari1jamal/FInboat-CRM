import api from "./api";

// ========================================
// GET LEAD DOCUMENTS
// ========================================

export const getLeadDocumentsApi =
  async (leadId) => {
    const response =
      await api.get(
        `/documents/lead/${leadId}`
      );

    const payload =
      response?.data;

    const result =
      payload?.data ||
      payload;

    const documents =
      result?.documents ||
      result ||
      [];

    return {
      data: Array.isArray(documents)
        ? documents
        : [],
    };
  };

// ========================================
// UPLOAD DOCUMENT
// ========================================

export const uploadLeadDocumentApi =
  async (
    leadId,
    {
      file,
      documentType,
      applicationId,
    }
  ) => {
    const formData =
      new FormData();

    formData.append(
      "document",
      file
    );

    formData.append(
      "documentType",
      documentType
    );

    if (applicationId) {
      formData.append(
        "applicationId",
        applicationId
      );
    }

    const response =
      await api.post(
        `/documents/lead/${leadId}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };

// ========================================
// VERIFY DOCUMENT
// ========================================

export const verifyDocumentApi =
  async (
    documentId,
    payload = {}
  ) => {
    const response =
      await api.patch(
        `/documents/${documentId}/verify`,
        {
          ...payload,
          status: "VERIFIED",
        }
      );

    return response.data;
  };

// ========================================
// REJECT DOCUMENT
// ========================================

export const rejectDocumentApi =
  async (
    documentId,
    payload = {}
  ) => {
    const response =
      await api.patch(
        `/documents/${documentId}/reject`,
        {
          ...payload,
          status: "REJECTED",
          reason:
            payload.reason ||
            payload.rejectionReason,
          rejectionReason:
            payload.reason ||
            payload.rejectionReason,
        }
      );

    return response.data;
  };