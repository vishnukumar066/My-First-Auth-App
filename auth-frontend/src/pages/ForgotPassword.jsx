import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { AuthContext } from "../contextAPI/auth-store";
import { useForm } from "react-hook-form";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useContext(AuthContext);

  const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: {errors} } = useForm();

  /* ================= Submit ================= */

    const handleSendLink = async (data) => {
    try {
      setLoading(true);

      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/v1/user/password/forgot`,
          data,
          {
              withCredentials: true,
              headers: {
                  "Content-Type": "application/json"
              }
          },
        )
        .then((res) => {
          toast.success(res.data.message);
        });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
    };
    
    if (isAuthenticated) {
        return <Navigate to={"/"} />
    }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter your email address to receive a password reset token.
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => {handleSendLink(data)})} className="space-y-6">
          {/* ================= Input ================= */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
                          value={value}
                          {...register("email")}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* ================= Submit ================= */}
          <button
            disabled={loading}
            className="
              w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold
              hover:bg-indigo-700 transition
              flex items-center justify-center gap-2
              disabled:opacity-60
            "
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Sending Reset Link..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
