import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../services/auth.api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await loginApi(form);
      const payload = result?.data ?? result;

      if (!payload?.token && !payload?.accessToken) {
        throw new Error("Authentication token missing");
      }

      loginUser({
        token: payload.token || payload.accessToken,
        user: payload.user,
      });

      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Invalid email or password");
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
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          {error && (
            <div className="mb-6 rounded-2xl border border-[#f3b8c1] bg-[#f9dfe3] px-5 py-4 text-[1.1rem] font-semibold text-[#d92d48] shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-[1.05rem] font-medium text-[#1f2937]">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@finboat.com"
                required
                className="w-full rounded-2xl border border-[#d1d9e0] bg-[#f3f6f8] px-4 py-4 text-[1.1rem] text-[#111827] outline-none transition placeholder:text-[#8b96a5] focus:border-[#d1d9e0] focus:ring-0"
              />
            </div>

            <div>
              <label className="mb-3 block text-[1.05rem] font-medium text-[#1f2937]">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
                className="w-full rounded-2xl border border-[#d1d9e0] bg-[#f3f6f8] px-4 py-4 text-[1.1rem] text-[#111827] outline-none transition placeholder:text-[#8b96a5] focus:border-[#d1d9e0] focus:ring-0"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-[#0f172a] px-5 py-5 text-[2rem] font-bold text-white shadow-sm transition hover:bg-[#131f32] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;
