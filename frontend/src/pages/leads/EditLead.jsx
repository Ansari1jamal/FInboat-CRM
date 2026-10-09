import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  User,
  IndianRupee,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Card from "../../components/common/Card";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";

import {
  getLeadApi,
  updateLeadApi,
} from "../../services/lead.api";

const EditLead = () => {
  const {
    leadId,
  } = useParams();

  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      customerName: "",
      mobile: "",
      loanType: "",
      loanAmount: "",
      source: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [errors, setErrors] =
    useState({});

  // ========================================
  // FETCH LEAD
  // ========================================

  const fetchLead =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getLeadApi(
            leadId
          );

        const lead =
          response?.data;

        if (!lead) {
          setError(
            "Lead not found."
          );

          return;
        }

        setForm({
          customerName:
            lead.customerName ||
            "",

          mobile:
            lead.mobile ||
            "",

          loanType:
            lead.loanType ||
            "",

          loanAmount:
            lead.loanAmount ||
            "",

          source:
            lead.source ||
            "",
        });
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to load lead."
        );
      } finally {
        setLoading(false);
      }
    }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  // ========================================
  // HANDLE CHANGE
  // ========================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        [name]: "",
      })
    );

    setError("");
  };

  // ========================================
  // VALIDATE
  // ========================================

  const validate = () => {
    const newErrors = {};

    if (
      !form.customerName.trim()
    ) {
      newErrors.customerName =
        "Customer name is required";
    }

    if (!form.mobile.trim()) {
      newErrors.mobile =
        "Mobile number is required";
    } else if (
      !/^\d{10}$/.test(
        form.mobile
      )
    ) {
      newErrors.mobile =
        "Mobile must be 10 digits";
    }

    if (!form.loanType) {
      newErrors.loanType =
        "Loan type is required";
    }

    if (!form.loanAmount) {
      newErrors.loanAmount =
        "Loan amount is required";
    } else if (
      Number(form.loanAmount) <= 0
    ) {
      newErrors.loanAmount =
        "Loan amount must be greater than 0";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        customerName:
          form.customerName.trim(),

        mobile:
          form.mobile.trim(),

        loanType:
          form.loanType,

        loanAmount:
          Number(form.loanAmount),

        ...(form.source && {
          source:
            form.source,
        }),
      };

      await updateLeadApi(
        leadId,
        payload
      );

      navigate(
        `/leads/${leadId}`
      );
    } catch (err) {
      const data =
        err?.response?.data;

      // API validation errors

      if (
        Array.isArray(
          data?.errors
        )
      ) {
        const apiErrors = {};

        data.errors.forEach(
          (item) => {
            if (item.field) {
              apiErrors[
                item.field
              ] = item.message;
            }
          }
        );

        setErrors(apiErrors);
      }

      setError(
        data?.message ||
          "Unable to update lead."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <LoadingState message="Loading lead..." />
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error && !form.customerName) {
    return (
      <div className="space-y-4">
        <Button
          variant="secondary"
          onClick={() =>
            navigate(
              `/leads/${leadId}`
            )
          }
        >
          <ArrowLeft size={18} />
          Back to Lead
        </Button>

        <ErrorState
          message={error}
          onRetry={fetchLead}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <PageHeader
        title="Edit Lead"
        description="Update customer and loan information."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                `/leads/${leadId}`
              )
            }
            disabled={saving}
          >
            <ArrowLeft size={18} />
            Back to Lead
          </Button>
        }
      />

      {/* ================================== */}
      {/* ERROR */}
      {/* ================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ================================== */}
      {/* FORM */}
      {/* ================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* CUSTOMER */}

        <Card
          title="Customer Information"
          description="Update the customer's basic information."
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <User size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Basic Details
              </p>

              <p className="text-xs text-slate-500">
                Customer name and mobile
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Customer Name"
              name="customerName"
              value={
                form.customerName
              }
              onChange={
                handleChange
              }
              error={
                errors.customerName
              }
              required
            />

            <Input
              label="Mobile Number"
              name="mobile"
              type="tel"
              maxLength={10}
              value={form.mobile}
              onChange={
                handleChange
              }
              error={
                errors.mobile
              }
              required
            />
          </div>
        </Card>

        {/* LOAN */}

        <Card
          title="Loan Information"
          description="Update the requested loan details."
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <IndianRupee
                size={19}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Loan Requirement
              </p>

              <p className="text-xs text-slate-500">
                Loan type and amount
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Select
              label="Loan Type"
              name="loanType"
              value={
                form.loanType
              }
              onChange={
                handleChange
              }
              error={
                errors.loanType
              }
              required
              options={[
                {
                  value:
                    "PERSONAL",
                  label:
                    "Personal Loan",
                },
                {
                  value:
                    "HOME",
                  label:
                    "Home Loan",
                },
                {
                  value:
                    "BUSINESS",
                  label:
                    "Business Loan",
                },
                {
                  value: "CAR",
                  label:
                    "Car Loan",
                },
              ]}
            />

            <Input
              label="Loan Amount"
              name="loanAmount"
              type="number"
              value={
                form.loanAmount
              }
              onChange={
                handleChange
              }
              error={
                errors.loanAmount
              }
              required
            />
          </div>
        </Card>

        {/* SOURCE */}

        <Card
          title="Lead Source"
          description="Update the lead source."
        >
          <Select
            label="Source"
            name="source"
            value={form.source}
            onChange={handleChange}
            options={[
              {
                value: "MANUAL",
                label: "Manual",
              },
              {
                value: "WEBSITE",
                label: "Website",
              },
              {
                value: "REFERRAL",
                label: "Referral",
              },
              {
                value: "CAMPAIGN",
                label: "Campaign",
              },
              {
                value: "CALL",
                label: "Call",
              },
              {
                value: "OTHER",
                label: "Other",
              },
            ]}
          />
        </Card>

        {/* ACTIONS */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(
                `/leads/${leadId}`
              )
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={saving}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditLead;