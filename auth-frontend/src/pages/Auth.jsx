import { useContext, useState } from "react";
import { AuthContext } from "../contextAPI/auth-store.jsx";
import { Navigate } from "react-router-dom";
import Login from "../components/Login.jsx";
import Register from "../components/Register.jsx";


const Auth = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);

    if (isAuthenticated) {
        return <Navigate to="/" />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-200">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          
          <div className="flex mb-6 bg-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-2 font-semibold transition 
              ${isLogin ? "bg-indigo-600 text-white" : "text-gray-600"}`}
            >
              Login
            </button>

            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-2 font-semibold transition 
              ${!isLogin ? "bg-indigo-600 text-white" : "text-gray-600"}`}
            >
              Register
            </button>
          </div>

          {isLogin ? <Login /> : <Register />}
        </div>
      </div>
    );
}

export default Auth;