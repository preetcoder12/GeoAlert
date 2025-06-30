import React, { useState, useMemo } from "react";
import { Clock, MapPin, Search } from "lucide-react";

const itemsPerPage = 50;

const DisasterCard = React.memo(({ disaster, isSelected, onClick }) => (
  <div
    key={disaster.id}
    className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
      isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:border-blue-200"
    }`}
    onClick={onClick}
  >
    <div className="flex items-start gap-3">
      <div className="p-2.5 rounded-lg shadow-sm bg-red-100">
        🔥
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 mb-1 truncate">{disaster.title}</h4>
            <p className="text-gray-500 text-sm mb-2 line-clamp-2">
              {disaster.description || "No description available"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {disaster.categories?.[0]?.title || "Unknown"}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            {disaster.geometries?.[0]?.date
              ? new Date(disaster.geometries[0].date).toLocaleString()
              : "Date not available"}
          </span>
          {disaster.geometries?.[0] && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <MapPin className="w-3 h-3 mr-1" />
              {disaster.continent
                ? disaster.continent.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
                : "Unknown"}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
));

const DisasterList = ({ loading, filteredDisasters }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredDisasters.length / itemsPerPage);

  const paginatedDisasters = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDisasters.slice(start, start + itemsPerPage);
  }, [filteredDisasters, currentPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (filteredDisasters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Search className="h-8 w-8 text-gray-500" />
        </div>
        <p className="text-gray-600 text-center">No disasters match your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {paginatedDisasters.map((disaster) => (
          <DisasterCard
            key={disaster.id}
            disaster={disaster}
            isSelected={selectedEvent?.id === disaster.id}
            onClick={() => setSelectedEvent(disaster)}
          />
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default DisasterList;
