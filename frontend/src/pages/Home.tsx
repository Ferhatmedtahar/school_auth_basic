import { useState } from "react";

export default function Home() {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklists = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/v1/checklists");
      if (response.ok) {
        const data = await response.json();
        setChecklists(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch checklists.");
      }
    } catch (error) {
      console.error("Error fetching checklists:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-white text-3xl text-center">Home</h1>

      <button
        onClick={fetchChecklists}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Loading..." : "Get All Checklists"}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {checklists.length > 0 && (
        <div className="mt-4">
          <h2>Checklists:</h2>
          <ul>
            {checklists.map((checklist, index) => (
              <li key={index} className="py-2">
                {checklist.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
