// ========================================
// USER SAFE SELECT
// ========================================

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
};

// ========================================
// USER PRIVATE SELECT
// ========================================
//
// Ye fields sirf internal operations ke liye
// use honge.
//
// API response mein directly return nahi karna.
//

const privateUserSelect = {
  ...safeUserSelect,

  passwordHash: true,
};

// ========================================
// KYC SAFE SELECT
// ========================================
//
// Agar future mein KYC model mein ye fields
// hain, to inhe API response mein direct
// expose nahi karna.
//

const safeKycSelect = {
  id: true,
  status: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

// ========================================
// DOCUMENT SAFE SELECT
// ========================================

const safeDocumentSelect = {
  id: true,
  originalName: true,
  mimeType: true,
  size: true,
  documentType: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  safeUserSelect,
  privateUserSelect,
  safeKycSelect,
  safeDocumentSelect,
};