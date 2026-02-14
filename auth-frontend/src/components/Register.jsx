import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthContext } from "../contextAPI/auth-store";

// Validation schema
const schema = z.object({
  name: z.string().min(2, "Name too short"),
  phone: z.string().min(10, "Invalid phone"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  verificationMethod: z.enum(["email", "phone"], {
    errorMap: () => ({ message: "Please select verification method" }),
  }),
  // confirmPassword: z.string(),
});
  // .refine((data) => data.password === data.confirmPassword, {
  //   message: "Passwords do not match",
  //   path: ["confirmPassword"],
  // });

const Register = () => {
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

  
  const navigate = useNavigate();

  // Submit
  const handleRegister = async (data) => {
    console.log("data is: ", data);
    data.phone = "+91" + data.phone;
    try {
      setLoading(true);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/register`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        toast.success(res.data.message);
        navigate(`/otp-verification/${data.email}/${data.phone}`);
      });
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-500 text-sm mt-2">
          Join us and start your journey 🚀
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit((data) => handleRegister(data))}
        className="space-y-5"
      >
        {/* -------- Name -------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Full Name
          </label>

          <input
            {...register("name")}
            placeholder="John Doe"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />

          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* -------- Phone -------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Phone Number
          </label>

          <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
            <span className="px-4 text-gray-600 border-r text-sm font-medium">
              +91
            </span>

            <input
              type="tel"
              placeholder="9876543210"
              {...register("phone")}
              className="flex-1 p-3 outline-none bg-transparent"
            />
          </div>

          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* -------- Email -------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Email
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />

          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* -------- Password -------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Password
          </label>

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter password"
              {...register("password")}
              className="w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-indigo-500 outline-none transition"
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
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* -------- Confirm Password -------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Confirm Password
          </label>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              className="w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-indigo-500 outline-none transition"
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
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* otp method selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select OTP Delivery Method
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Email option */}
            <label className="cursor-pointer">
              <input
                type="radio"
                name="verificationMethod"
                value={"email"}
                {...register("verificationMethod")}
                className="hidden peer"
              />

              <div
                className="flex flex-col items-center justify-center p-4 border rounded-xl transition
                      peer-checked:border-indigo-600
                      peer-checked:bg-indigo-50
                      hover:border-indigo-400"
              >
                <span className="text-lg">📧</span>
                <span className="text-sm font-medium mt-1">Email</span>
              </div>
            </label>

            {/* Phone option */}
            <label className="cursor-pointer">
              <input
                type="radio"
                name="verificationMethod"
                value={"phone"}
                {...register("verificationMethod")}
                className="hidden peer"
              />

              <div
                className="flex flex-col items-center justify-center p-4 border rounded-xl transition
                      peer-checked:border-indigo-600
                      peer-checked:bg-indigo-50
                      hover:border-indigo-400"
              >
                <span className="text-lg">📱</span>
                <span className="text-sm font-medium mt-1">Phone</span>
              </div>
            </label>
          </div>

          {errors.verificationMethod && (
            <p className="text-red-500 text-xs mt-2">
              {errors.verificationMethod.message}
            </p>
          )}
        </div>

        {/* -------- Submit -------- */}
        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link className="text-indigo-600 font-semibold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
