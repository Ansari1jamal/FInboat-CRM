
const leadService =
  require("./lead.service");

const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

// ======================================
// EXPORT SERVICE
// ======================================

const {
  exportLeads,
  createLeadExcel,
  createLeadCSV,
} = require("./lead.export.service");

// ======================================
// CREATE LEAD
// ======================================

const createLead =
  asyncHandler(
    async (req, res) => {

      const result =
        await leadService.createLead({
          // ==================================
          // VALIDATED BODY
          // ==================================

          ...req.validated.body,

          // ==================================
          // CURRENT USER
          // ==================================

          createdBy:
            req.user.userId,

          createdByRole:
            req.user.role,
        });

      // ======================================
      // DUPLICATE LEAD
      // ======================================

      if (result.isDuplicate) {
        return sendSuccess(
          res,
          {
            isDuplicate: true,

            duplicateOf:
              result.duplicateOf,
          },
          "Duplicate lead found",
          200
        );
      }

      // ======================================
      // SUCCESS
      // ======================================

      return sendSuccess(
        res,
        result.lead,
        "Lead created successfully",
        201
      );
    }
  );

// ======================================
// GET ALL LEADS
// ======================================

const getLeads =
  asyncHandler(
    async (req, res) => {

      // ==================================
      // VALIDATED QUERY
      // ==================================

      const query =
        req.validated?.query ||
        {};

      const result =
        await leadService.getLeads({

          // ================================
          // USER
          // ================================

          user:
            req.user,

          // ================================
          // SEARCH
          // ================================

          search:
            query.search,

          // ================================
          // BASIC FILTERS
          // ================================

          status:
            query.status,

          loanType:
            query.loanType,

          source:
            query.source,

          // ================================
          // ASSIGNMENT FILTERS
          // ================================

          assignedToId:
            query.assignedToId,

          assignedTeamId:
            query.assignedTeamId,

          // ================================
          // DATE FILTERS
          // ================================

          fromDate:
            query.fromDate,

          toDate:
            query.toDate,

          // ================================
          // AMOUNT FILTERS
          // ================================

          minAmount:
            query.minAmount,

          maxAmount:
            query.maxAmount,

          // ================================
          // PAGINATION
          // ================================

          page:
            query.page || 1,

          limit:
            query.limit || 20,

          // ================================
          // SORTING
          // ================================

          sortBy:
            query.sortBy ||
            "createdAt",

          sortOrder:
            query.sortOrder ||
            "desc",
        });

      // ======================================
      // SUCCESS
      // ======================================

      return sendSuccess(
        res,
        result,
        "Leads fetched successfully"
      );
    }
  );

// ======================================
// GET SINGLE LEAD
// ======================================

const getLeadById =
  asyncHandler(
    async (req, res) => {

      const id =
        req.validated?.params?.id ||
        req.params.id;

      const lead =
        await leadService.getLeadById(
          id,
          req.user
        );

      return sendSuccess(
        res,
        lead,
        "Lead fetched successfully"
      );
    }
  );

// ======================================
// UPDATE LEAD
// ======================================

const updateLead =
  asyncHandler(
    async (req, res) => {

      const id =
        req.validated?.params?.id ||
        req.params.id;

      const body =
        req.validated?.body ||
        req.body;

      const lead =
        await leadService.updateLead(
          id,
          body,
          req.user
        );

      return sendSuccess(
        res,
        lead,
        "Lead updated successfully"
      );
    }
  );

// ======================================
// DELETE LEAD
// ======================================

const deleteLead =
  asyncHandler(
    async (req, res) => {

      const id =
        req.validated?.params?.id ||
        req.params.id;

      await leadService.deleteLead(
        id,
        req.user
      );

      return sendSuccess(
        res,
        null,
        "Lead deleted successfully"
      );
    }
  );

// ======================================
// EXPORT LEADS TO EXCEL
// ======================================

const exportLeadExcel =
  asyncHandler(
    async (req, res) => {

      const query =
        req.validated?.query ||
        req.query ||
        {};

      const leads =
        await exportLeads({

          // ================================
          // USER
          // ================================

          user:
            req.user,

          // ================================
          // FILTERS
          // ================================

          filters: {

            status:
              query.status,

            loanType:
              query.loanType,

            source:
              query.source,

            search:
              query.search,

            fromDate:
              query.fromDate,

            toDate:
              query.toDate,
          },
        });

      // ======================================
      // CREATE EXCEL
      // ======================================

      const buffer =
        createLeadExcel(
          leads
        );

      // ======================================
      // HEADERS
      // ======================================

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="leads.xlsx"'
      );

      // ======================================
      // RESPONSE
      // ======================================

      return res.send(
        buffer
      );
    }
  );

// ======================================
// EXPORT LEADS TO CSV
// ======================================

const exportLeadCSV =
  asyncHandler(
    async (req, res) => {

      const query =
        req.validated?.query ||
        req.query ||
        {};

      const leads =
        await exportLeads({

          // ================================
          // USER
          // ================================

          user:
            req.user,

          // ================================
          // FILTERS
          // ================================

          filters: {

            status:
              query.status,

            loanType:
              query.loanType,

            source:
              query.source,

            search:
              query.search,

            fromDate:
              query.fromDate,

            toDate:
              query.toDate,
          },
        });

      // ======================================
      // CREATE CSV
      // ======================================

      const csv =
        createLeadCSV(
          leads
        );

      // ======================================
      // HEADERS
      // ======================================

      res.setHeader(
        "Content-Type",
        "text/csv; charset=utf-8"
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="leads.csv"'
      );

      // ======================================
      // RESPONSE
      // ======================================

      return res.send(
        csv
      );
    }
  );

// ======================================
// EXPORT
// ======================================

module.exports = {

  createLead,

  getLeads,

  getLeadById,

  updateLead,

  deleteLead,

  exportLeadExcel,

  exportLeadCSV,
};
