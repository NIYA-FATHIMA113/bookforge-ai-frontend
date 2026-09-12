import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./PublicBooking.css";


const API_BASE_URL = "http://127.0.0.1:8000";

function PublicBooking() {
  const { slug } = useParams();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [error, setError] = useState("");
  const [slotError, setSlotError] = useState("");

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
        setSelectedSlot("");

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
  // Create booking
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
            "Content-Type": "application/json",
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

  // --------------------------------
  // Booking progress
  // --------------------------------

  let currentStep = 1;

  if (selectedService) {
    currentStep = 2;
  }

  if (selectedDate) {
    currentStep = 3;
  }

  if (selectedSlot) {
    currentStep = 4;
  }

  if (bookingSuccess) {
    currentStep = 5;
  }

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <div className="public-booking">
        <p>
          Loading booking options...
        </p>
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

  return (
    <div className="public-booking">

      {/* Progress */}

      <div className="booking-progress">

        <span
          className={
            currentStep === 1
              ? "active-step"
              : ""
          }
        >
          1. Service
        </span>

        <span>→</span>

        <span
          className={
            currentStep === 2
              ? "active-step"
              : ""
          }
        >
          2. Date
        </span>

        <span>→</span>

        <span
          className={
            currentStep === 3
              ? "active-step"
              : ""
          }
        >
          3. Available Slots
        </span>

        <span>→</span>

        <span
          className={
            currentStep === 4
              ? "active-step"
              : ""
          }
        >
          4. Customer Details
        </span>

        <span>→</span>

        <span
          className={
            currentStep === 5
              ? "active-step"
              : ""
          }
        >
          5. Confirmation
        </span>

      </div>

      {/* Business title */}

      <h1>
        Book at{" "}
        {slug.charAt(0).toUpperCase() +
          slug.slice(1)}
      </h1>

      {/* Booking success */}

      {bookingSuccess ? (
  <div className="booking-confirmation">

    <div className="confirmation-icon">
      ✓
    </div>

    <h2>
      Booking Confirmed!
    </h2>

    <p className="confirmation-message">
      Your booking has been successfully
      created.
    </p>

    <div className="confirmation-card">

      <div className="confirmation-row">
        <span>Service</span>
        <strong>
          {selectedService?.name}
        </strong>
      </div>

      <div className="confirmation-row">
        <span>Date</span>
        <strong>
          {selectedDate}
        </strong>
      </div>

      <div className="confirmation-row">
        <span>Time</span>
        <strong>
          {selectedSlot}
        </strong>
      </div>

      <div className="confirmation-row">
        <span>Name</span>
        <strong>
          {customerName}
        </strong>
      </div>

      <div className="confirmation-row">
        <span>Phone</span>
        <strong>
          {customerPhone}
        </strong>
      </div>

      {bookingSuccess.resource && (
        <div className="confirmation-row">
          <span>Resource</span>
          <strong>
            {typeof bookingSuccess.resource ===
            "object"
              ? bookingSuccess.resource.name
              : bookingSuccess.resource}
          </strong>
        </div>
      )}

    </div>

    <p className="confirmation-note">
      Please arrive on time for your booking.
    </p>

  </div>
) : (
        <>
          {/* Services */}

          <section className="booking-section">

            <h2>
              1. Select a service
            </h2>

            {services.length === 0 ? (
              <p>
                No services available.
              </p>
            ) : (
              <div className="services-list">

                {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className={
                selectedService?.id === service.id
                  ? "service-card selected-service"
                  : "service-card"
              }
              onClick={() => {
                setSelectedService(service);
                setSelectedDate("");
                setSelectedSlot("");
                setBookingError("");
              }}
            >
              <div className="service-card-content">

                <div>
                  <h3>{service.name}</h3>

                  <p>
                    {service.duration} minutes
                  </p>
                </div>

                <div className="service-price">
                  ₹{service.price}
                </div>

              </div>
            </button>
          ))}

              </div>
            )}

          </section>

          {/* Date */}

          {selectedService && (
            <section className="booking-section">

              <h2>
                2. Select a date
              </h2>

              <input
                type="date"
                value={selectedDate}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) => {
                  setSelectedDate(
                    e.target.value
                  );
                  setSelectedSlot("");
                  setBookingError("");
                }}
              />

            </section>
          )}

          {/* Available slots */}

          {selectedService &&
            selectedDate && (
              <section className="booking-section">

                <h2>
                  3. Available slots
                </h2>

                {loadingSlots && (
                  <p>
                    Loading available slots...
                  </p>
                )}

                {slotError && (
                  <p className="booking-error">
                    {slotError}
                  </p>
                )}

                {!loadingSlots &&
                  !slotError &&
                  slots.length === 0 && (
                    <p>
                      No slots available
                      for this date.
                    </p>
                  )}

                {!loadingSlots &&
                  slots.length > 0 && (
                   <div className="slots-container">

  <p className="slots-subtitle">
    Choose an available time
  </p>

  <div className="slots-list">

    {slots.map((slot) => (
      <button
        key={slot}
        type="button"
        className={
          selectedSlot === slot
            ? "slot-button selected-slot"
            : "slot-button"
        }
        onClick={() => {
          setSelectedSlot(slot);
          setBookingError("");
        }}
      >
        {slot}
      </button>
    ))}

  </div>

  {selectedSlot && (
    <p className="selected-slot-text">
      Selected time: <strong>{selectedSlot}</strong>
    </p>
  )}

</div>
                  )}

              </section>
            )}

          {/* Customer details */}

          {selectedSlot && (
            <section className="booking-section">

              <h2>
                4. Customer Details
              </h2>

              <div className="customer-form">

              <div className="form-field">
                <label htmlFor="customer-name">
                  Full Name
                </label>

                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-field">
                <label htmlFor="customer-phone">
                  Phone Number
                </label>

                <input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) =>
                    setCustomerPhone(e.target.value)
                  }
                  placeholder="Enter your phone number"
                />
              </div>

          </div>
              <div className="booking-summary">

              <h3>Booking Summary</h3>

              <div className="summary-row">
                <span>Service</span>
                <strong>{selectedService?.name}</strong>
              </div>

              <div className="summary-row">
                <span>Price</span>
                <strong>₹{selectedService?.price}</strong>
              </div>

              <div className="summary-row">
                <span>Duration</span>
                <strong>
                  {selectedService?.duration} minutes
                </strong>
              </div>

              <div className="summary-row">
                <span>Date</span>
                <strong>{selectedDate}</strong>
              </div>

              <div className="summary-row">
                <span>Time</span>
                <strong>{selectedSlot}</strong>
              </div>

            </div>


              {bookingError && (
                <p className="booking-error">
                  {bookingError}
                </p>
              )}

              <button
                type="button"
                onClick={handleBooking}
                disabled={bookingLoading}
              >
                {bookingLoading
                  ? "Booking..."
                  : "Confirm Booking"}
              </button>

            </section>
          )}

        </>
      )}

    </div>
  );
}

export default PublicBooking;