import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function PublicBooking() {
  const { slug } = useParams();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/book/${slug}/services/`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load business services."
          );
        }

        const data = await response.json();

        setServices(data.results || data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, [slug]);

  if (loading) {
    return <p>Loading booking options...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="public-booking">
      <h1>Book at {slug}</h1>

      <h2>Choose a service</h2>

      {services.length === 0 ? (
        <p>No services available.</p>
      ) : (
        <div>
          {services.map((service) => (
            <div key={service.id}>
              <h3>{service.name}</h3>

              <p>
                ₹{service.price}
              </p>

              <p>
                {service.duration} minutes
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicBooking;