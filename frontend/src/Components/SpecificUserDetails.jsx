import axios from "axios";
import React, { useEffect, useState } from "react";

const SpecificUserDetails = () => {
  const [user, setUser] = useState(null); // Initialize user as null
  const id = localStorage.getItem("userId"); // Retrieve user ID from localStorage

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/user/details/${id}`
      );
      setUser(response.data.user); // Update user state with fetched data
      console.log(response.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const delteuser = async () => {
    try {
      await axios.delete(`http://localhost:3000/admin/deleteuser/${id}`);
      localStorage.removeItem("userId");
      window.location.href="/admin"
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">User Details</h1>
        <div className="text-gray-800">
          <p>
            <strong>ID:</strong> {user._id}
          </p>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          {user.subscribedToAlerts && (
            <p className="text-green-600 font-medium">Subscribed to Alerts</p>
          )}
          <p>
            <strong>Location:</strong> Latitude: {user.location.lat}, Longitude:{" "}
            {user.location.lng}
          </p>
          <p className="text-gray-500 text-sm">
            <strong>Created At:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button onClick={delteuser} className=" border-2 border-bold p-2 rounded-lg bg-red-600 text-white">
          Delete
        </button>
      </div>
    </div>
  );
};

export default SpecificUserDetails;
