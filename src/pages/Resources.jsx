import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import "./Resources.css";

function Resources() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] =
    useState(null);

  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [resourceName, setResourceName] =
    useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");

      const businessData =
        await apiRequest("/api/tenants/");

      const businesses =
        businessData.results || businessData;

      if (businesses.length === 0) {
        setServices([]);
        return;
      }

      const tenantId = businesses[0].id;

      const serviceData =
        await apiRequest(
          `/api/tenants/${tenantId}/services/`
        );

      const serviceList =
        serviceData.results || serviceData;

      setServices(serviceList);

      if (serviceList.length > 0) {
        setSelectedService(serviceList[0]);
        loadResources(serviceList[0].id);
      }

    } catch (err) {
      setError(
        err.message ||
          "Failed to load services."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async (serviceId) => {
    try {
      setError("");

      const data = await apiRequest(
        `/api/services/${serviceId}/resources/`
      );

      setResources(
        data.results || data
      );

    } catch (err) {
      setError(
        err.message ||
          "Failed to load resources."
      );
    }
  };

  const handleServiceChange = (service) => {
    setSelectedService(service);
    setShowForm(false);
    loadResources(service.id);
  };

  const handleAddResource = async () => {
    if (!resourceName.trim()) {
      alert("Please enter a resource name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiRequest(
        `/api/services/${selectedService.id}/resources/`,
        {
          method: "POST",
          body: JSON.stringify({
            name: resourceName.trim(),
          }),
        }
      );

      setResourceName("");
      setShowForm(false);

      await loadResources(
        selectedService.id
      );

    } catch (err) {
      setError(
        err.message ||
          "Failed to create resource."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="resources-page">
        <h1>Resources</h1>
        <p>Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="resources-page">

      <header>
        <h1>Resources</h1>

        <p>
          Manage the resources used for your
          bookings.
        </p>
      </header>

      {error && (
        <p className="resources-error">
          {error}
        </p>
      )}

      {services.length === 0 ? (

        <div className="empty-resources">
          <h2>No services yet</h2>

          <p>
            Create a service before adding
            resources.
          </p>
        </div>

      ) : (

        <>

          <div className="resource-service-selector">

            <h2>Select Service</h2>

            <div className="service-selector-list">

              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className={
                    selectedService?.id === service.id
                      ? "selected-service"
                      : ""
                  }
                  onClick={() =>
                    handleServiceChange(service)
                  }
                >
                  {service.name}
                </button>
              ))}

            </div>

          </div>

          <div className="resources-toolbar">

            <button
              type="button"
              onClick={() =>
                setShowForm(!showForm)
              }
            >
              {showForm
                ? "Close"
                : "+ Add Resource"}
            </button>

          </div>

          {showForm && (
            <div className="resource-form">

              <h2>
                Add Resource
              </h2>

              <div className="form-field">

                <label>
                  Resource Name
                </label>

                <input
                  type="text"
                  value={resourceName}
                  onChange={(e) =>
                    setResourceName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Resource 2"
                />

              </div>

              <div className="resource-form-actions">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setResourceName("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleAddResource}
                >
                  {saving
                    ? "Saving..."
                    : "Save Resource"}
                </button>

              </div>

            </div>
          )}

          <div className="resources-list">

            {resources.length === 0 ? (

              <div className="empty-resources">

                <h2>
                  No resources yet
                </h2>

                <p>
                  Add a resource for{" "}
                  <strong>
                    {selectedService?.name}
                  </strong>.
                </p>

              </div>

            ) : (

              resources.map((resource) => (

                <article
                  className="resource-card"
                  key={resource.id}
                >

                  <h3>
                    {resource.name}
                  </h3>

                  <button
                    type="button"
                  >
                    Delete
                  </button>

                </article>

              ))

            )}

          </div>

        </>

      )}

    </div>
  );
}

export default Resources;