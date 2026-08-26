import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import ResourceList from "./ResourceList";

function ServiceList({ tenantId }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await apiRequest(
          `/api/tenants/${tenantId}/services/`
        );

        setServices(data.results || data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, [tenantId]);

  if (loading) {
    return <p>Loading services...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <h2>Services</h2>

      {services.length === 0 ? (
        <p>No services added yet.</p>
      ) : (
        <div>
          {services.map((service) => (
            <div key={service.id}>
              <h3>{service.name}</h3>

              <p>
                Duration: {service.duration} minutes
              </p>

              <p>
                Price: ₹{service.price}
              </p>

              <p>
                Status:{" "}
                {service.is_active ? "Active" : "Inactive"}
              </p>

              {/* ADD IT HERE */}
              <ResourceList serviceId={service.id} />

            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ServiceList;