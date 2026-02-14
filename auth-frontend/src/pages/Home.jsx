import { useContext } from "react";
import { AuthContext } from "../contextAPI/auth-store";
import axios from "axios";
import { toast } from "react-toastify";
import { Navigate, Link } from "react-router-dom";
import { LogOut, PlusCircle, NotebookPen } from "lucide-react";

const Home = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } =
    useContext(AuthContext);

  // Logout
  const logoutHandler = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/user/logout`,
        {
          withCredentials: true,
        },
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
    toast.success(res.data.message);
    setIsAuthenticated(false);
    setUser(null);
  };

  // redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-blue-200">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <NotebookPen size={20} />
          NoteYouTube
        </h1>

        <button
          onClick={logoutHandler}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
          Organize your ideas <br />
          <span className="text-indigo-600">Smarter & Faster</span>
        </h2>

        <p className="mt-5 text-gray-500 max-w-xl">
          Create, manage and secure your notes with ease.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            to="/notes"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Create Note
          </Link>

          <Link
            to="/profile"
            className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition"
          >
            View Profile
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
