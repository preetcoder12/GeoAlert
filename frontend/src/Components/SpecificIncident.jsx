import axios from "axios";
import React, { useEffect, useState } from "react";

const SpecificIncident = () => {
  const [incident, setIncident] = useState(null); // Store single incident details
  const incidentId = localStorage.getItem("incidentId"); // Retrieve Incident ID from localStorage

  const fetchIncident = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/admin/incident/${incidentId}`
      );
      setIncident(response.data.incident); // Assuming your API returns a single report
      console.log(response.data.incident);
    } catch (error) {
      console.error("Error fetching incident:", error);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, []);

  if (!incident) {
    return <div>Loading incident details...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-lg w-full bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Incident Details</h1>
        <div className="text-gray-800">
          <p className="mb-2">
            <strong>ID:</strong> {incident._id}
          </p>
          <p className="mb-2">
            <strong>Title:</strong> {incident.title}
          </p>
          <p className="mb-2">
            <strong>Description:</strong> {incident.description}
          </p>
          <p className="mb-2">
            <strong>Category:</strong> {incident.category}
          </p>
          <p className="mb-2">
            <strong>Status:</strong>{" "}
            <span
              className={`font-medium ${
                incident.status === "verified" ? "text-green-600" : "text-red-600"
              }`}
            >
              {incident.status}
            </span>
          </p>
          <p className="mb-2">
            <strong>Reported By:</strong> {incident.reportedBy.name} (
            {incident.reportedBy.contact})
          </p>
          <p className="mb-2">
            <strong>Location:</strong>{" "}
            {`${incident.location.address} (Lat: ${incident.location.latitude}, Lng: ${incident.location.longitude})`}
          </p>
          <p className="text-gray-500 text-sm mb-4">
            <strong>Created At:</strong>{" "}
            {new Date(incident.createdAt).toLocaleDateString()}
          </p>
        </div>
    
      </div>
    </div>
  );
};

export default SpecificIncident;
