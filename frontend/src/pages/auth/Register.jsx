import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerApi } from "../../services/auth.api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "TELECALLER",
};

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "TL", label: "Team Leader" },
  { value: "TELECALLER", label: "Telecaller" },
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingAccount, setExistingAccount] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setExistingAccount(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setExistingAccount(false);
    setSuccess("");
    setLoading(true);

    try {
      await registerApi({
        ...form,
        phone: form.phone.trim(),
      });

      setSuccess("User created successfully. Redirecting to dashboard...");

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 900);
    } catch (requestError) {
      const isConflict = requestError.response?.status === 409;
      setExistingAccount(isConflict);
      setError(
        isConflict
          ? "An account with this email already exists."
          : requestError.response?.data?.message ||
              requestError.message ||
              "Unable to register user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e9eef1] px-4 py-10">
      <div className="w-full max-w-[620px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0f172a] text-5xl font-bold text-white shadow-sm">
            F
          </div>

          <h1 className="text-[4rem] font-black leading-none tracking-[-0.05em] text-[#17232b]">
            FinBoat CRM
          </h1>

          <p className="mt-4 text-3xl font-medium text-[#4b5563]">
            Add a team user
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-[#f3b8c1] bg-[#f9dfe3] px-5 py-4 text-[1.1rem] font-semibold text-[#d92d48] shadow-sm"
            >
              <p>{error}</p>
              {existingAccount && (
                <p className="mt-2 text-base font-medium">
                  Sign in with the existing account, or use another email to
                  create a different team user.{" "}
                  <Link
                    to="/login"
                    className="font-bold underline"
                  >
                    Go to sign in
                  </Link>
                </p>
              )}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl border border-[#b7e4c7] bg-[#eafaf1] px-5 py-4 text-[1.1rem] font-semibold text-[#0f766e] shadow-sm">
              {success}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-[1.05rem] font-medium text-[#1f2937]">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                required
                className="w-full rounded-2xl border border-[#d1d9e0] bg-[#f3f6f8] px-4 py-4 text-[1.1rem] text-[#111827] outline-none transition placeholder:text-[#8b96a5] focus:border-[#d1d9e0] focus:ring-0"
              />
            </div>

            <div>
              <label className="mb-3 block text-[1.05rem] font-medium text-[#1f2937]">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@finboat.com"
                required
                className="w-full rounded-2xl border border-[#d1d9e0] bg-[#f3f6f8] px-4 py-4 text-[1.1rem] text-[#111827] outline-none transition placeholder:text-[#8b96a5] focus:border-[#d1d9e0] focus:ring-0"
              />
            </div>

            <div>
              <label className="mb-3 block text-[1.05rem] font-medium text-[#1f2937]">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full rounded-2xl border border-[#d1d9e0] bg-[#f3f6f8] px-4 py-4 text-[1.1rem] text-[#111827] outline-none transition placeholder:text-[#8b96a5] focus:border-[#d1d9e0] focus:ring-0"
              />
            </div>

            <div>
              <label className="mb-3 block text-[1.05rem] font-medium text-[#1f2937]">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-[#d1d9e0] bg-[#f3f6f8] px-4 py-4 text-[1.1rem] text-[#111827] outline-none transition focus:border-[#d1d9e0] focus:ring-0"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-3 block text-[1.05rem] font-medium text-[#1f2937]">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 chars, uppercase + number"
                required
                className="w-full rounded-2xl border border-[#d1d9e0] bg-[#f3f6f8] px-4 py-4 text-[1.1rem] text-[#111827] outline-none transition placeholder:text-[#8b96a5] focus:border-[#d1d9e0] focus:ring-0"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-[#0f172a] px-5 py-5 text-[2rem] font-bold text-white shadow-sm transition hover:bg-[#131f32] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating user..." : "Create User"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-[1rem] text-[#4b5563]">
          Only administrators can add team users.
        </p>
      </div>
    </div>
  );
};

export default Register;
