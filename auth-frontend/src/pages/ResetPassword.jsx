import { useContext, useState } from "react";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { AuthContext } from "../contextAPI/auth-store";

const schema = z
  .object({
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const { token } = useParams(); // /reset-password/:token
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, user, setUser } =
    useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Summit handler
  const resetPasswordHandler = async (data) => {
    try {
      setLoading(true);

      await axios
        .put(
          `http://localhost:3000/api/v1/user/password/reset/${token}`,
          data,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(true);
          setUser(res.data.user);
        });
    } catch (err) {
      toast.error(err.response.data.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/auth"} />;
  }

  const inputStyle =
    "w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-indigo-500 outline-none transition";

  const errorStyle = "text-red-500 text-xs mt-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
            <Lock className="text-indigo-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>

          <p className="text-sm text-gray-500 mt-1">
            Enter your new password below
          </p>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit((data) => {resetPasswordHandler(data)})} className="space-y-5">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter new password"
                {...register("password")}
                className={inputStyle}
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className={errorStyle}>{errors.password.message}</p>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                {...register("confirmPassword")}
                className={inputStyle}
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className={errorStyle}>{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
                  <button
                      type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500 mt-6">
          Remember your password?
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
