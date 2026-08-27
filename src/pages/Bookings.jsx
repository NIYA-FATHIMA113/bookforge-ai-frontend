import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import "./Bookings.css";


function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/bookings/");

      // Handle both paginated and non-paginated responses
      setBookings(data.results || data);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBookingStatus = async (id, status) => {
    try {
      await apiRequest(`/api/bookings/${id}/status/`, {
        method: "PATCH",
        body: JSON.stringify({
          status: status,
        }),
      });

      fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to update booking.");
    }
  };

  const deleteBooking = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/api/bookings/${id}/`, {
        method: "DELETE",
      });

      fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to delete booking.");
    }
  };

  if (loading) {
    return (
      <div className="bookings-loading">
        <h1>Bookings</h1>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <header className="bookings-header">
        <h1>Bookings</h1>

        <p>
          Manage bookings made by your customers.
        </p>
      </header>

      {error && (
        <p className="bookings-error">
          {error}
        </p>
      )}

      {bookings.length === 0 ? (
        <div className="bookings-empty">
          <h2>No bookings yet</h2>

          <p>
            Customer bookings will appear here.
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <div className="booking-card-header">
                <h2>
                  {booking.customer_name}
                </h2>

                <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="booking-detail">
                  <span className="booking-detail-label">Phone</span>
                  <span className="booking-detail-value">{booking.customer_phone}</span>
                </div>

                <div className="booking-detail">
                  <span className="booking-detail-label">Service</span>
                  <span className="booking-detail-value">{booking.service?.name || "N/A"}</span>
                </div>

                <div className="booking-detail">
                  <span className="booking-detail-label">Date</span>
                  <span className="booking-detail-value">{booking.booking_date}</span>
                </div>

                <div className="booking-detail">
                  <span className="booking-detail-label">Time</span>
                  <span className="booking-detail-value">{booking.booking_time}</span>
                </div>

                <div className="booking-detail">
                  <span className="booking-detail-label">Resource</span>
                  <span className="booking-detail-value">{booking.resource?.name || "N/A"}</span>
                </div>

              </div>

              <div className="booking-actions">
                {booking.status === "PENDING" && (
                  <>
                  <button
                    className="confirm-button"
                    type="button"
                    onClick={() =>
                      updateBookingStatus(
                        booking.id,
                        "CONFIRMED"
                      )
                    }
                  >
                    Confirm
                  </button>

                  <button
                    className="cancel-button"
                    type="button"
                    onClick={() =>
                      updateBookingStatus(
                        booking.id,
                        "CANCELLED"
                      )
                    }
                  >
                    Cancel
                  </button>
                  </>
                )}

                <button
                  className="delete-button"
                  type="button"
                  onClick={() =>
                    deleteBooking(booking.id)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;