import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function PublicBooking() {
  const { slug } = useParams();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] =
    useState(null);

  const [selectedDate, setSelectedDate] = useState("");


  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] =
  useState("");

  const [customerName, setCustomerName] =
  useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [bookingError, setBookingError] =
    useState("");

  const [bookingSuccess, setBookingSuccess] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] =
      useState(false);

  const [error, setError] = useState("");
  const [slotError, setSlotError] =
    useState("");

  // --------------------------------
  // Load services
  // --------------------------------

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError("");

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

  // --------------------------------
  // Load available slots
  // --------------------------------

  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setSlots([]);
      return;
    }

    async function loadAvailableSlots() {
      try {
        setLoadingSlots(true);
        setSlotError("");
        setSlots([]);

        const response = await fetch(
          `${API_BASE_URL}/api/book/${slug}/available-slots/?date=${selectedDate}&service=${selectedService.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load available slots."
          );
        }

        setSlots(data.available_slots || []);
      } catch (error) {
        setSlotError(error.message);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailableSlots();
  }, [slug, selectedService, selectedDate]);

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <div className="public-booking">
        <p>Loading booking options...</p>
      </div>
    );
  }

  // --------------------------------
  // Error
  // --------------------------------

  if (error) {
    return (
      <div className="public-booking">
        <p>{error}</p>
      </div>
    );
  }

  // --------------------------------
  // Page
  // --------------------------------
    const handleBooking = async () => {
    setBookingError("");
    setBookingSuccess(null);

    if (!customerName.trim()) {
      setBookingError(
        "Please enter your name."
      );
      return;
    }

    if (!customerPhone.trim()) {
      setBookingError(
        "Please enter your phone number."
      );
      return;
    }

    if (!selectedService) {
      setBookingError(
        "Please select a service."
      );
      return;
    }

    if (!selectedDate) {
      setBookingError(
        "Please select a date."
      );
      return;
    }

    if (!selectedSlot) {
      setBookingError(
        "Please select a time slot."
      );
      return;
    }

    try {
      setBookingLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/book/${slug}/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customer_name:
              customerName.trim(),

            customer_phone:
              customerPhone.trim(),

            booking_date:
              selectedDate,

            booking_time:
              selectedSlot,

            service:
              selectedService.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Unable to create booking."
        );
      }

      setBookingSuccess(data);

    } catch (error) {
      setBookingError(
        error.message
      );
    } finally {
      setBookingLoading(false);
    }
  };
  return (
    <div className="public-booking">

      <h1>
        Book at{" "}
        {slug.charAt(0).toUpperCase() +
          slug.slice(1)}
      </h1>

      <h2>Choose a service</h2>

      {services.length === 0 ? (
        <p>No services available.</p>
      ) : (
        <div className="services-list">

          {services.map((service) => (
            <div
              key={service.id}
              className="service-card"
            >
              <h3>{service.name}</h3>

              <p>
                ₹{service.price}
              </p>

              <p>
                {service.duration} minutes
              </p>

              <button
                type="button"
                onClick={() => {
                    setSelectedService(service);
                    setSelectedDate("");
                    setSelectedSlot("");
                    setSlots([]);
                    setSlotError("");
                    }}
              >
                {selectedService?.id === service.id
                  ? "Selected"
                  : "Select"}
              </button>
            </div>
          ))}

        </div>
      )}

      {/* --------------------------------
          Date selection
      -------------------------------- */}

      {selectedService && (
        <div className="date-section">

          <h2>
            Choose a date
          </h2>

          <p>
            Service:{" "}
            <strong>
              {selectedService.name}
            </strong>
          </p>

          <p>
            Duration:{" "}
            <strong>
              {selectedService.duration} minutes
            </strong>
          </p>

          <p>
            Price:{" "}
            <strong>
              ₹{selectedService.price}
            </strong>
          </p>

          <input
            type="date"
            value={selectedDate}
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
            max={
              new Date(
                Date.now() +
                  30 *
                    24 *
                    60 *
                    60 *
                    1000
              )
                .toISOString()
                .split("T")[0]
            }
            onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot("");
                }}
          />

        </div>
      )}

      {/* --------------------------------
          Available slots
      -------------------------------- */}

      {selectedDate && selectedService && (
        <div className="slots-section">

          <h2>
            Available slots
          </h2>

          {loadingSlots && (
            <p>
              Checking availability...
            </p>
          )}

          {slotError && (
            <p>
              {slotError}
            </p>
          )}

          {!loadingSlots &&
            !slotError &&
            slots.length === 0 && (
              <p>
                No slots available for this
                date.
              </p>
            )}

          {!loadingSlots &&
            slots.length > 0 && (
                <div className="slots-list">

                {slots.map((slot) => (
                    <button
                        key={slot}
                        type="button"
                        style={{
                            padding: "10px 18px",
                            margin: "5px",
                            border: "1px solid black",
                            borderRadius: "6px",
                            background:
                            selectedSlot === slot
                                ? "black"
                                : "white",
                            color:
                            selectedSlot === slot
                                ? "white"
                                : "black",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            console.log("SLOT CLICKED:", slot);
                            setSelectedSlot(slot);
                        }}
                        >
                        {slot}
                        </button>
                ))}

                </div>
            )}

            {selectedSlot && (
            <p>
                Selected time:{" "}
                <strong>{selectedSlot}</strong>
            </p>
            )}

        </div>
      )}

      {selectedSlot && (
        <div className="customer-section">

          <h2>Customer details</h2>

          <div>
            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
            />
          </div>

          <div>
            <label>Phone number</label>

            <input
              type="tel"
              placeholder="Enter your phone number"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value)
              }
            />
          </div>

          {bookingError && (
            <p>{bookingError}</p>
          )}

          <button
            type="button"
            disabled={bookingLoading}
            onClick={handleBooking}
          >
            {bookingLoading
              ? "Creating booking..."
              : "Confirm Booking"}
          </button>

        </div>
      )}
      {bookingSuccess && (
        <div>
          <h2>
            Booking confirmed! 🎉
          </h2>

          <p>
            Your booking has been successfully
            created.
          </p>

          <p>
            Service:{" "}
            <strong>
              {selectedService.name}
            </strong>
          </p>

          <p>
            Date:{" "}
            <strong>
              {selectedDate}
            </strong>
          </p>

          <p>
            Time:{" "}
            <strong>
              {selectedSlot}
            </strong>
          </p>

          {bookingSuccess.resource && (
            <p>
              Resource:{" "}
              <strong>
                {bookingSuccess.resource}
              </strong>
            </p>
          )}
        </div>
      )}

    </div>
  );
}

export default PublicBooking;