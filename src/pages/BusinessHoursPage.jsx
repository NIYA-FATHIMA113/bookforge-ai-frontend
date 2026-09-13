import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import BusinessHours from "../components/BusinessHours";
import OwnerNavigation from "../components/OwnerNavigation";

function BusinessHoursPage() {
  const [tenantId, setTenantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/api/tenants/");

        const businesses = data.results || data;

        if (!businesses || businesses.length === 0) {
          setError(
            "No business found. Please create a business first."
          );
          return;
        }

        setTenantId(businesses[0].id);
      } catch (err) {
        setError(
          err.message || "Failed to load business."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, []);

  if (loading) {
    return (
      <div className="business-hours-page">
        <h1>Business Hours</h1>
        <p>Loading business...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="business-hours-page">
        <h1>Business Hours</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className="business-hours-page">
        <h1>Business Hours</h1>
        <p>Business ID not found.</p>
      </div>
    );
  }

  return (
  <>
    <OwnerNavigation />

    <BusinessHours tenantId={tenantId} />
  </>
);
}

export default BusinessHoursPage;