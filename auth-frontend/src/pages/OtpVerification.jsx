import { useContext, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../contextAPI/auth-store";

const OtpVerification = () => {
  const { setIsAuthenticated, setUser } = useContext(AuthContext);

  const { email, phone } = useParams();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

  /* ================= OTP Logic ================= */

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move forward
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // backspace → previous
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = pasteData.split("");
    setOtp(newOtp);

    newOtp.forEach((_, i) => {
      inputsRef.current[i].value = newOtp[i];
    });
  };

  /* ================= Submit ================= */

  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");

    const data = {
      email,
      verifyOTP: finalOtp,
      phone,
    };

    if (finalOtp.length !== 6) {
      toast.error("Enter complete OTP");
      return;
    }

    try {
      setLoading(true);

      await axios
        .post(`${import.meta.env.VITE_API_URL}/api/v1/user/otp-verification`, data, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(true);
          setUser(res.data.user);
          navigate("/home");
        });
    } catch (err) {
      toast.error(err.response.data.message);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">OTP Verification</h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter the 6-digit code sent to
          </p>
          <p className="text-indigo-600 text-sm font-medium mt-1">
            {email || phone}
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="
                w-12 h-12 text-center text-lg font-semibold
                border rounded-lg
                focus:ring-2 focus:ring-indigo-500
                outline-none transition
              "
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="
            w-full bg-indigo-600 text-white py-3 rounded-lg
            font-semibold hover:bg-indigo-700 transition
            flex items-center justify-center gap-2
            disabled:opacity-60
          "
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Resend */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Didn’t receive code?{" "}
          <button
            className="text-indigo-600 font-medium hover:underline"
            onClick={() => toast.info("OTP resent")}
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
