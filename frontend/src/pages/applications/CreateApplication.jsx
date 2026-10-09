import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FilePlus2 } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

import { createApplicationApi, getLendersApi } from "../../services/applications.api";

const CreateApplication = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const leadId = searchParams.get("leadId");

  const [lenders, setLenders] = useState([]);
  const [form, setForm] = useState({
    lenderId: "",
    requestedAmount: "",
  });
  const [loadingLenders, setLoadingLenders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadLenders = async () => {
      try {
        setLoadingLenders(true);

        const response = await getLendersApi();
        const lenderList = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

        setLenders(lenderList);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load lenders.");
      } finally {
        setLoadingLenders(false);
      }
    };

    loadLenders();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!leadId) {
      nextErrors.leadId = "Lead is required.";
    }

    if (!form.lenderId) {
      nextErrors.lenderId = "Lender is required.";
    }

    if (!form.requestedAmount || Number(form.requestedAmount) <= 0) {
      nextErrors.requestedAmount = "Requested amount must be greater than zero.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        lenderId: form.lenderId,
        requestedAmount: form.requestedAmount,
      };

      const response = await createApplicationApi(leadId, payload);
      const application = response?.data?.data || response?.data || null;

      if (application?.id) {
        navigate(`/applications/${application.id}`);
      } else {
        navigate(`/applications?leadId=${leadId}`);
      }
    } catch (err) {
      const data = err?.response?.data;

      if (Array.isArray(data?.errors)) {
        const apiErrors = {};

        data.errors.forEach((item) => {
          if (item.field) {
            apiErrors[item.field] = item.message;
          }
        });

        setErrors(apiErrors);
      }

      setError(data?.message || "Unable to create application.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Loan Application"
        description="Create a new loan application for this lead."
        actions={
          <Button
            variant="secondary"
            onClick={() => (leadId ? navigate(`/leads/${leadId}`) : navigate("/applications"))}
          >
            <ArrowLeft size={18} />
            Back
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Application Details" description="Enter the lender and requested loan amount.">
          <div className="space-y-5">
            <Select
              label="Lender"
              name="lenderId"
              value={form.lenderId}
              onChange={handleChange}
              required
              disabled={loadingLenders}
              error={errors.lenderId}
              options={[
                {
                  value: "",
                  label: loadingLenders ? "Loading lenders..." : "Select lender",
                },
                ...lenders.map((lender) => ({
                  value: lender.id,
                  label: lender.name,
                })),
              ]}
            />

            <Input
              label="Requested Amount"
              name="requestedAmount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter requested loan amount"
              value={form.requestedAmount}
              onChange={handleChange}
              error={errors.requestedAmount}
              required
            />
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() => navigate(leadId ? `/leads/${leadId}` : "/applications")}
          >
            Cancel
          </Button>

          <Button type="submit" loading={saving}>
            <FilePlus2 size={17} />
            Create Application
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateApplication;
