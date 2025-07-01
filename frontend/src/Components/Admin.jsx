import axios from "axios";
import { useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";

const Admin = () => {
  const [Users, setUsers] = useState([]);
  const [incidents, setincidents] = useState([]);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/admin/allusers");
      setUsers(response.data.user);
      console.log(response.data.user);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAllincidents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/admin/allincidents"
      );
      setincidents(response.data.reports);
      console.log(response.data.reports);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  const visituser = (user) => {
    const id = user._id;
    localStorage.setItem("userId", id);
    window.location.href = `/details/${id}`;
  };
  const visitincident = (inci) => {
    const id = inci._id;
    localStorage.setItem("incidentId", id);
    window.location.href = `/incident/${id}`;
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllincidents();
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold text-center mb-6">Admin Panel</h1>
      {Users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Users.map((user) => (
            <div
              key={user._id}
              className="p-4 border rounded-lg shadow-sm bg-gray-400"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {user.name}
              </h2>
              <p className="text-gray-900">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-gray-900">
                <strong>Phone:</strong> {user.phone}
              </p>

              <button
                onClick={() => visituser(user)}
                className="flex flex-row gap-2 border-black border-[5px] border-bold p-2 rounded-lg bg-green-600"
              >
                Profile
                <FaUserAlt />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">No user found</div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-center mb-6">Incidents</h1>
        {incidents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incidents.map((incident) => (
              <div
                key={incident._id}
                className="p-4 border rounded-lg shadow-sm bg-gray-100"
              >
                <h2 className="text-lg font-semibold mb-2 text-gray-800">
                  {incident.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Category:</strong> {incident.category}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-medium ${
                      incident.status === "verified"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {incident.status}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Reported By:</strong> {incident.reportedBy.name} (
                  {incident.reportedBy.contact})
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Location:</strong> {incident.location.region}
                </p>
                <button
                  onClick={() => visitincident(incident)}
                  className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No incidents found</div>
        )}
      </div>
    </div>
  );
};

export default Admin;
