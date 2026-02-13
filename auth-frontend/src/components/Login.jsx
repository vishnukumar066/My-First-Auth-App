import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react"; // optional icons
import { AuthContext } from "../contextAPI/auth-store";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { set } from "zod";

const Login = () => {
  // Yt code 
  const { isAuthenticated, setIsAuthenticated, user, setUser } =
    useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      await axios
        .post("http://localhost:3000/api/v1/user/login", data, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(true);
          setUser(res.data.user);
          navigate("/");
        });
    } catch (error) {
       toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back 👋
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Login to continue to your account
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <a
              href="http://localhost:3000/auth/google"
              className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5 h-5"
              />
              Continue with Google
            </a>

            <a
              href="http://localhost:3000/auth/facebook"
              className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              <img
                src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                alt="facebook"
                className="w-5 h-5"
              />
              Continue with Facebook
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="grow h-px bg-gray-200"></div>
            <span className="px-3 text-gray-400 text-sm">OR</span>
            <div className="grow h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit((data) => handleLogin(data))}
            className="space-y-5"
          >
            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1 text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                {...register("email")}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="example@gmail.com"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col relative">
              <label className="text-sm font-semibold mb-1 text-gray-700">
                Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-12 transition"
                placeholder="Enter your password"
              />

              {/* Eye Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="accent-indigo-600" />
                Remember me
              </label>

              <Link
                to={"/password/forgot"}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold flex justify-center items-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Logging in...</span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
    </>
  );
};

export default Login;
