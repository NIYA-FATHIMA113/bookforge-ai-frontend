import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerNavigation from "../components/OwnerNavigation";
import { apiRequest } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");
        const [tenantData, summaryData] = await Promise.all([
          apiRequest("/api/tenants/"),
          apiRequest("/api/dashboard/summary/"),
        ]);
        setTenant((tenantData.results || tenantData)[0] || null);
        setSummary(summaryData);
      } catch (err) {
        setError(err.message || "Failed to load your dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = [
    ["Total bookings", summary?.total_bookings],
    ["Today’s bookings", summary?.today_bookings],
    ["Pending", summary?.pending_bookings],
    ["Confirmed", summary?.confirmed_bookings],
    ["Completed", summary?.completed_bookings],
    ["Cancelled", summary?.cancelled_bookings],
  ];

  return (
    <div className="owner-page dashboard-page">
      <OwnerNavigation />
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Owner dashboard</p>
            <h1>{tenant?.business_name || "Your business"}</h1>
            <p>{tenant?.business_type?.replaceAll("_", " ") || "Business overview"}</p>
          </div>
          <button type="button" onClick={() => navigate("/ai-setup")}>Configure with AI</button>
        </header>

        {loading && <p className="dashboard-state">Loading dashboard…</p>}
        {error && <p className="dashboard-error">{error}</p>}
        {!loading && !error && !tenant && (
          <section className="empty-dashboard">
            <h2>No business yet</h2>
            <p>Create your first business to start managing bookings.</p>
          </section>
        )}
        {!loading && !error && tenant && (
          <>
            <section className="stats" aria-label="Booking summary">
              {stats.map(([label, value]) => (
                <article className="stat-card" key={label}>
                  <p>{label}</p><strong>{value ?? 0}</strong>
                </article>
              ))}
              <article className="stat-card revenue-card">
                <p>Total revenue</p><strong>₹{summary?.total_revenue ?? 0}</strong>
              </article>
            </section>
            <section className="quick-actions">
              <h2>Manage your business</h2>
              <div className="quick-actions-grid">
                <button type="button" onClick={() => navigate("/dashboard/services")}>Services</button>
                <button type="button" onClick={() => navigate("/dashboard/resources")}>Resources</button>
                <button type="button" onClick={() => navigate("/dashboard/hours")}>Business hours</button>
                <button type="button" onClick={() => navigate("/dashboard/bookings")}>Bookings</button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
