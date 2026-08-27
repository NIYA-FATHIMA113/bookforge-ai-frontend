import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

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
      <div>
        <h1>Bookings</h1>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Bookings</h1>

      <p>
        Manage bookings made by your customers.
      </p>

      {error && (
        <p>
          {error}
        </p>
      )}

      {bookings.length === 0 ? (
        <div>
          <h2>No bookings yet</h2>

          <p>
            Customer bookings will appear here.
          </p>
        </div>
      ) : (
        <div>
          {bookings.map((booking) => (
            <div key={booking.id}>
              <h2>
                {booking.customer_name}
              </h2>

              <p>
                <strong>Phone:</strong>{" "}
                {booking.customer_phone}
              </p>

              <p>
                <strong>Service:</strong>{" "}
                {booking.service?.name || "N/A"}
                </p>

              <p>
                <strong>Date:</strong>{" "}
                {booking.booking_date}
              </p>

              <p>
                <strong>Time:</strong>{" "}
                {booking.booking_time}
              </p>

              <p>
                <strong>Resource:</strong>{" "}
                {booking.resource?.name || "N/A"}
                </p>

              <p>
                <strong>Status:</strong>{" "}
                {booking.status}
              </p>

              {booking.status === "PENDING" && (
                <div>
                  <button
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
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  deleteBooking(booking.id)
                }
              >
                Delete
              </button>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;