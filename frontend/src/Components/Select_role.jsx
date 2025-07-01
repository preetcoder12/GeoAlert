import { useNavigate } from "react-router-dom";
import { Users, ShieldCheck } from "lucide-react";

const SelectRole = () => {
  const navigate = useNavigate();

  const handleClickUser = () => {
    localStorage.setItem("userRole", "100");
    localStorage.removeItem("adminRole");
    navigate("/signup");
  };

  const handleClickAdmin = () => {
    localStorage.setItem("adminRole", "200");
    localStorage.removeItem("userRole");
    navigate("/adminsignup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-red-800 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl grid grid-cols-2 transform transition-all duration-300 hover:scale-[1.02]">
        {/* User/Driver Section */}
        <div className="p-12 flex flex-col items-center justify-center text-center bg-white">
          <div className="bg-blue-100 p-6 rounded-full mb-6 shadow-md">
            <Users className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">User</h2>
          <p className="text-gray-600 mb-6 text-center">
            Register as a User to get live disaster alerts or as an Admin to
            manage and monitor users and disasters.
          </p>
          <button
            onClick={handleClickUser}
            className="px-8 py-3 bg-red-600 text-white rounded-xl 
                        font-semibold hover:bg-red-700 transition-all 
                        flex items-center justify-center space-x-2 
                        shadow-md hover:shadow-lg group"
          >
            <span>Select User</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* Admin Section */}
        <div className="p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br from-indigo-50 to-indigo-100">
          <div className="bg-indigo-100 p-6 rounded-full mb-6 shadow-md">
            <ShieldCheck className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Admin</h2>
          <p className="text-gray-600 mb-6 text-center">
            Access administrative controls to manage users and disasters data
          </p>
          <button
            onClick={handleClickAdmin}
            className="px-8 py-3 bg-green-600 text-white rounded-xl 
                        font-semibold hover:bg-green-700 transition-all 
                        flex items-center justify-center space-x-2 
                        shadow-md hover:shadow-lg group"
          >
            <span>Select Admin</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
