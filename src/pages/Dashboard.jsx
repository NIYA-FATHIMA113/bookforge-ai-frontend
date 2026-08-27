import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import BusinessList from "../components/BusinessList";
import { apiRequest } from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [businessCount, setBusinessCount] = useState(0);

  const [summary, setSummary] = useState({
    services: 0,
    bookings: 0,
    resources: 0,
  });

  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await apiRequest(
          "/api/dashboard/summary/"
        );

        console.log("DASHBOARD SUMMARY:", data);

        setSummary({
          services:
            data.services ??
            data.service_count ??
            data.services_count ??
            0,

          bookings:
            data.bookings ??
            data.booking_count ??
            data.bookings_count ??
            0,

          resources:
            data.resources ??
            data.resource_count ??
            data.resources_count ??
            0,
        });
      } catch (error) {
        console.error(
          "Failed to load dashboard summary:",
          error
        );
      } finally {
        setLoadingSummary(false);
      }
    }

    loadSummary();
  }, []);

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">

        <h2>BookForge AI</h2>

        <nav>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Businesses
          </NavLink>

          <NavLink to="/dashboard">
            Services
          </NavLink>

          <NavLink to="/dashboard">
            Resources
          </NavLink>

          <NavLink
            to="/dashboard/bookings"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Bookings
          </NavLink>

          <NavLink to="/dashboard">
            Business Hours
          </NavLink>
        </nav>

        <button onClick={logout}>
          Logout
        </button>

      </aside>

      {/* Main content */}
      <main className="dashboard-content">

        <header>
          <h1>Dashboard</h1>

          <p>
            Manage your business and bookings from one place.
          </p>
        </header>

        {/* Welcome */}
        <section className="welcome-card">

          <h2>
            Welcome to BookForge AI 👋
          </h2>

          <p>
            Create your business booking platform
            with the help of AI.
          </p>

          <button onClick={() => navigate("/ai-setup")}>
          + Create Business with AI
        </button>

        </section>

        {/* Businesses */}
        <BusinessList
          onCountChange={setBusinessCount}
        />

        {/* Statistics */}
        <section className="stats">

          <div className="stat-card">
            <h3>Businesses</h3>
            <p>{businessCount}</p>
          </div>

          <div className="stat-card">
            <h3>Services</h3>
            <p>
              {loadingSummary
                ? "..."
                : summary.services}
            </p>
          </div>

          <div className="stat-card">
            <h3>Bookings</h3>
            <p>
              {loadingSummary
                ? "..."
                : summary.bookings}
            </p>
          </div>

          <div className="stat-card">
            <h3>Resources</h3>
            <p>
              {loadingSummary
                ? "..."
                : summary.resources}
            </p>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;