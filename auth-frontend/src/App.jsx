import { useContext, useEffect} from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Auth from "./pages/Auth.jsx";
import OtpVerification from "./pages/Otpverification.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Home from "./pages/Home.jsx";
import { AuthContext } from "./contextAPI/auth-store.jsx";
import axios from "axios";

function App() {
  const { setIsAuthenticated, setUser } =
    useContext(AuthContext);

  useEffect(() => {
    const getUser = async () => {
      await axios
        .get(`${import.meta.env.VITE_API_URL}/api/v1/user/me`, {
          withCredentials: true,
        })
        .then((res) => {
          setUser(res.data.user);
          setIsAuthenticated(true);
        })
        .catch((err) => {
          setIsAuthenticated(false);
          setUser(null);
        });
    };
    getUser();
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/otp-verification/:email/:phone"
            element={<OtpVerification />}
          />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
        </Routes>

        <ToastContainer theme="colored" position="top-right" />
        
      </BrowserRouter>
    </>
  );
}

export default App;
