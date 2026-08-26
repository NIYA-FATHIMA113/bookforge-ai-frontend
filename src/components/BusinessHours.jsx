import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const DAYS = [
  { id: 0, name: "Monday" },
  { id: 1, name: "Tuesday" },
  { id: 2, name: "Wednesday" },
  { id: 3, name: "Thursday" },
  { id: 4, name: "Friday" },
  { id: 5, name: "Saturday" },
  { id: 6, name: "Sunday" },
];

function BusinessHours({ tenantId }) {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHours();
  }, [tenantId]);

  async function loadHours() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        `/api/tenants/${tenantId}/hours/`
      );

      setHours(data.results || data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getDay(dayId) {
    return hours.find(
      (item) => item.day_of_week === dayId
    );
  }

  function updateLocalDay(dayId, field, value) {
    setHours((current) =>
      current.map((item) =>
        item.day_of_week === dayId
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  async function saveDay(dayId) {
    const day = getDay(dayId);

    if (!day) {
      return;
    }

    try {
      setSavingDay(dayId);
      setError("");

      const updated = await apiRequest(
        `/api/hours/${day.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            opening_time: day.opening_time,
            closing_time: day.closing_time,
            is_closed: day.is_closed,
          }),
        }
      );

      setHours((current) =>
        current.map((item) =>
          item.day_of_week === dayId
            ? updated
            : item
        )
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setSavingDay(null);
    }
  }

  if (loading) {
    return <p>Loading business hours...</p>;
  }

  return (
    <section>
      <h2>Business Hours</h2>

      {error && <p>{error}</p>}

      {DAYS.map((dayInfo) => {
        const day = getDay(dayInfo.id);

        if (!day) {
          return (
            <div key={dayInfo.id}>
              <h3>{dayInfo.name}</h3>
              <p>Hours not configured.</p>
            </div>
          );
        }

        return (
          <div key={day.id}>
            <h3>{dayInfo.name}</h3>

            <label>
              <input
                type="checkbox"
                checked={day.is_closed}
                onChange={(e) =>
                  updateLocalDay(
                    dayInfo.id,
                    "is_closed",
                    e.target.checked
                  )
                }
              />

              Closed
            </label>

            {!day.is_closed && (
              <>
                <div>
                  <label>Opening:</label>

                  <input
                    type="time"
                    value={day.opening_time}
                    onChange={(e) =>
                      updateLocalDay(
                        dayInfo.id,
                        "opening_time",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label>Closing:</label>

                  <input
                    type="time"
                    value={day.closing_time}
                    onChange={(e) =>
                      updateLocalDay(
                        dayInfo.id,
                        "closing_time",
                        e.target.value
                      )
                    }
                  />
                </div>
              </>
            )}

            <button
              onClick={() => saveDay(dayInfo.id)}
              disabled={savingDay === dayInfo.id}
            >
              {savingDay === dayInfo.id
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        );
      })}
    </section>
  );
}

export default BusinessHours;