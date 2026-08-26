import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import ReactMarkdown from "react-markdown";

function AISetup() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

 
  const [business, setBusiness] = useState({
    name: "Niya Beauty Salon",
    type: "Beauty Salon",
    location: "Calicut",
    phone: "",
    email: "",
  });
  const [conversationId, setConversationId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [services, setServices] = useState([
    {
      id: 1,
      name: "Haircut",
      duration: 30,
      price: 300,
    },
    {
      id: 2,
      name: "Hair Spa",
      duration: 60,
      price: 1200,
    },
    {
      id: 3,
      name: "Facial",
      duration: 45,
      price: 900,
    },
  ]);

  const [resources, setResources] = useState([
    {
      id: 1,
      name: "Hair Styling Chair 1",
    },
    {
      id: 2,
      name: "Hair Styling Chair 2",
    },
    {
      id: 3,
      name: "Facial Room",
    },
  ]);

  const [hours, setHours] = useState({
    days: "Monday - Saturday",
    opening: "09:00",
    closing: "19:00",
    sundayClosed: true,
  });

  const [bookingRules, setBookingRules] = useState({
    deposit: "No deposit",
    advanceNotice: "1 hour",
    cancellation:
      "Customers can cancel before the appointment.",
  });


 async function handleSend(e) {
  e.preventDefault();

  if (!message.trim() || aiLoading) {
    return;
  }

  const userMessage = message.trim();

  setMessages((current) => [
    ...current,
    {
      role: "user",
      text: userMessage,
    },
  ]);

  setMessage("");
  setAiLoading(true);

  try {
    const data = await apiRequest("/api/ai/chat/", {
      method: "POST",

      body: JSON.stringify({
        message: userMessage,

        ...(conversationId
          ? {
              conversation_id: conversationId,
            }
          : {}),
      }),
    });

    console.log("AI RESPONSE:", data);

    // Save conversation ID returned by Django
    setConversationId(data.conversation_id);

    // Display real AI response
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        text: data.message,
      },
    ]);

    // Update preview data from real configuration
    if (data.business_configuration) {
      const config = data.business_configuration;

      setBusiness((current) => ({
        ...current,
        name:
          config.business_name ||
          current.name,
        type:
          config.business_type ||
          current.type,
        location:
          config.location ||
          current.location,
        phone:
          config.contact_phone ||
          current.phone,
        email:
          config.contact_email ||
          current.email,
      }));

      if (config.services) {
        setServices(config.services);
      }

      if (
        config.opening_time ||
        config.closing_time ||
        config.working_days
      ) {
        setHours((current) => ({
          ...current,
          opening:
            config.opening_time ||
            current.opening,
          closing:
            config.closing_time ||
            current.closing,
          days:
            config.working_days?.join(
              ", "
            ) ||
            current.days,
        }));
      }

      if (config.number_of_resources) {
        setResources(
          Array.from(
            {
              length:
                config.number_of_resources,
            },
            (_, index) => ({
              id: index + 1,
              name: `Resource ${index + 1}`,
            })
          )
        );
      }

      // Only show preview when backend says setup is complete
      if (
        config.configuration_status
          ?.is_complete ||
        config.is_complete
      ) {
        setShowPreview(true);
      }
    }

  } catch (error) {
    console.error(
      "AI chat failed:",
      error
    );

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        text:
          "Sorry, something went wrong: " +
          error.message,
      },
    ]);

  } finally {
    setAiLoading(false);
  }
}

const handleConfirm = async () => {
  try {
    if (!conversationId) {
      alert("Conversation not found. Please start the AI setup again.");
      return;
    }

    const response = await apiRequest("/api/ai/confirm/", {
      method: "POST",
      body: JSON.stringify({
        conversation_id: conversationId,
      }),
    });

    setConversationId(response.conversation_id);
    console.log("BUSINESS CREATED:", response);

    alert(
      `${response.business_name} created successfully!`
    );

    navigate("/dashboard");

  } catch (error) {
    console.error("Business creation failed:", error);

    alert(
      error.message || "Failed to create business."
    );
  }
};

  function updateService(id, field, value) {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? {
              ...service,
              [field]:
                field === "duration" ||
                field === "price"
                  ? Number(value)
                  : value,
            }
          : service
      )
    );
  }

  function addService() {
    setServices((current) => [
      ...current,
      {
        id: Date.now(),
        name: "New Service",
        duration: 30,
        price: 0,
      },
    ]);
  }

  function removeService(id) {
    setServices((current) =>
      current.filter((service) => service.id !== id)
    );
  }

  function addResource() {
    setResources((current) => [
      ...current,
      {
        id: Date.now(),
        name: "New Resource",
      },
    ]);
  }

  function removeResource(id) {
    setResources((current) =>
      current.filter((resource) => resource.id !== id)
    );
  }

  function updateResource(id, value) {
    setResources((current) =>
      current.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              name: value,
            }
          : resource
      )
    );
  }

  function cleanAIText(text) {
    if (!text) return "";

    return text
      .replace(/\\([*_~`])/g, "$1")
      .replace(/\s+(\d+\.)\s+/g, "\n\n$1 ");
  }
  return (
    <div className="ai-setup-page">

      {/* Header */}

      <header className="ai-setup-header">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div>
          <h1>Create Business with AI 🤖</h1>

          <p>
            Build your booking platform with the help
            of BookForge AI.
          </p>
        </div>
      </header>

      {/* Chat */}

      <section className="ai-chat-card">

        <h2>Tell us about your business</h2>

        <div className="ai-messages">

          {messages.length === 0 && (
            <div className="ai-welcome">
              <h3>
                Welcome to BookForge AI 👋
              </h3>

              <p>
                Tell me what kind of business you
                want to create.
              </p>

              <p>
                Example:
              </p>

              <div className="example-message">
                I run a beauty salon offering
                haircuts, facials and hair spa.
              </div>
            </div>
          )}

          {messages.map((item, index) => (
            <div
              key={index}
              className={`ai-message ${item.role}`}
            >
              <strong>
                {item.role === "user"
                  ? "You"
                  : "BookForge AI"}
              </strong>

              {item.role === "assistant" ? (
                <ReactMarkdown>
                  {item.text}
                </ReactMarkdown>
              ) : (
                <p>{item.text}</p>
              )}
            </div>
          ))}

        </div>

        <form
          className="ai-chat-form"
          onSubmit={handleSend}
        >
          <input
            type="text"
            placeholder="Describe your business..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
          />

          <button type="submit">
            Send
          </button>
        </form>

      </section>

      {/* Preview */}

      {showPreview && (
        <section className="setup-preview">

          <div className="preview-header">
            <div>
              <h2>Business Setup</h2>

              <p>
                Review your setup before creating
                your business.
              </p>
            </div>

            <span className="mock-badge">
              DEMO DATA
            </span>
          </div>

          {/* Business */}

          <div className="preview-card">

            <h3>Business Information</h3>

            <div className="form-grid">

              <label>
                Business Name

                <input
                  value={business.name}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      name: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Business Type

                <input
                  value={business.type}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      type: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Location

                <input
                  value={business.location}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      location: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Phone

                <input
                  value={business.phone}
                  placeholder="Phone number"
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      phone: e.target.value,
                    })
                  }
                />
              </label>

            </div>

          </div>

          {/* Services */}

          <div className="preview-card">

            <div className="section-title-row">
              <div>
                <h3>Services</h3>
                <p>
                  Services customers can book.
                </p>
              </div>

              <button
                type="button"
                onClick={addService}
              >
                + Add Service
              </button>
            </div>

            <div className="service-editor">

              {services.map((service) => (
                <div
                  className="service-editor-row"
                  key={service.id}
                >

                  <input
                    value={service.name}
                    onChange={(e) =>
                      updateService(
                        service.id,
                        "name",
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="number"
                    min="1"
                    value={service.duration}
                    onChange={(e) =>
                      updateService(
                        service.id,
                        "duration",
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="number"
                    min="0"
                    value={service.price}
                    onChange={(e) =>
                      updateService(
                        service.id,
                        "price",
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeService(service.id)
                    }
                  >
                    Remove
                  </button>

                </div>
              ))}

            </div>

            <div className="table-labels">
              <span>Service</span>
              <span>Duration (min)</span>
              <span>Price (₹)</span>
            </div>

          </div>

          {/* Resources */}

          <div className="preview-card">

            <div className="section-title-row">

              <div>
                <h3>Resources</h3>

                <p>
                  Staff, rooms, chairs or other
                  bookable resources.
                </p>
              </div>

              <button
                type="button"
                onClick={addResource}
              >
                + Add Resource
              </button>

            </div>

            {resources.map((resource) => (
              <div
                className="resource-editor-row"
                key={resource.id}
              >

                <input
                  value={resource.name}
                  onChange={(e) =>
                    updateResource(
                      resource.id,
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    removeResource(resource.id)
                  }
                >
                  Remove
                </button>

              </div>
            ))}

          </div>

          {/* Business Hours */}

          <div className="preview-card">

            <h3>Business Hours</h3>

            <div className="form-grid">

              <label>
                Working Days

                <input
                  value={hours.days}
                  onChange={(e) =>
                    setHours({
                      ...hours,
                      days: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Opening Time

                <input
                  type="time"
                  value={hours.opening}
                  onChange={(e) =>
                    setHours({
                      ...hours,
                      opening: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Closing Time

                <input
                  type="time"
                  value={hours.closing}
                  onChange={(e) =>
                    setHours({
                      ...hours,
                      closing: e.target.value,
                    })
                  }
                />
              </label>

            </div>

            <label className="checkbox-label">

              <input
                type="checkbox"
                checked={hours.sundayClosed}
                onChange={(e) =>
                  setHours({
                    ...hours,
                    sundayClosed:
                      e.target.checked,
                  })
                }
              />

              Sunday is closed

            </label>

          </div>

          {/* Booking Rules */}

          <div className="preview-card">

            <h3>Booking Rules</h3>

            <div className="form-grid">

              <label>
                Deposit

                <input
                  value={bookingRules.deposit}
                  onChange={(e) =>
                    setBookingRules({
                      ...bookingRules,
                      deposit: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Minimum Advance Notice

                <input
                  value={bookingRules.advanceNotice}
                  onChange={(e) =>
                    setBookingRules({
                      ...bookingRules,
                      advanceNotice:
                        e.target.value,
                    })
                  }
                />

              </label>

            </div>

            <label>
              Cancellation Policy

              <textarea
                value={bookingRules.cancellation}
                onChange={(e) =>
                  setBookingRules({
                    ...bookingRules,
                    cancellation:
                      e.target.value,
                  })
                }
              />

            </label>

          </div>

          {/* Confirm */}

          <div className="confirm-section">

        <div>
          <h2>
            Ready to create your business?
          </h2>

          <p>
            Review the information above and
            confirm when everything looks correct.
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
        >
          Confirm & Create Business
        </button>

      </div>

        </section>
      )}

    </div>
  );
}

export default AISetup;