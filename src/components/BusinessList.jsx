import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useNavigate } from "react-router-dom";

function BusinessList({ onCountChange }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const data = await apiRequest("/api/tenants/");

        const businessList = data.results || data;

        // -----------------------------------------
        // Add mock AI-created business
        // -----------------------------------------

        const mockBusiness = localStorage.getItem(
          "mock_business"
        );

        let finalBusinesses = businessList;

        if (mockBusiness) {
          const parsedBusiness =
            JSON.parse(mockBusiness);

          const mockBusinessForDisplay = {
            id: `mock-${parsedBusiness.id}`,

            business_name:
              parsedBusiness.name,

            business_type:
              parsedBusiness.type,

            location:
              parsedBusiness.location,

            is_active: true,

            isMock: true,
          };

          finalBusinesses = [
            mockBusinessForDisplay,
            ...businessList,
          ];
        }

        setBusinesses(finalBusinesses);

        onCountChange(finalBusinesses.length);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, [onCountChange]);

  if (loading) {
    return <p>Loading businesses...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="business-section">

      <div className="section-header">
        <div>
          <h2>My Businesses</h2>

          <p>
            Manage your businesses and booking platforms.
          </p>
        </div>
      </div>

      {businesses.length === 0 ? (

        <div className="empty-business">

          <h3>No businesses yet</h3>

          <p>
            Create your first business to start
            accepting bookings.
          </p>

        </div>

      ) : (

        <div className="business-grid">

          {businesses.map((business) => (

            <div
              className="business-card"
              key={business.id}
            >

              <div className="business-card-header">

                <div>

                  <h3>
                    {business.business_name}
                  </h3>

                  <p>
                    {business.business_type}
                  </p>

                  {business.location && (
                    <p>
                      📍 {business.location}
                    </p>
                  )}

                </div>

                <span
                  className={
                    business.is_active
                      ? "status active"
                      : "status inactive"
                  }
                >
                  {business.is_active
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <div className="business-card-footer">

                {business.isMock ? (

                  <button
                    onClick={() =>
                      navigate("/ai-setup")
                    }
                  >
                    Continue Setup
                  </button>

                ) : (

                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/business/${business.id}`
                      )
                    }
                  >
                    Manage Business
                  </button>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}

export default BusinessList;