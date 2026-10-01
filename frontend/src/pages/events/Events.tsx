import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface GeofenceEvent {
  id: number;
  device_id: number;
  geofence_id: number;
  location_event_id: number;
  event_type: string;
  previous_state: string;
  current_state: string;
  latitude: number;
  longitude: number;
  event_timestamp: string;
  created_at: string;
}

const Events = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await api.get("/events/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to load geofence events."
      );
    } finally {
      setLoading(false);
    }
  };

  const getEventStyle = (eventType: string) => {
    switch (eventType) {
      case "ENTER":
        return {
          background: "rgba(46, 125, 50, 0.2)",
          color: "#81c784",
        };

      case "EXIT":
        return {
          background: "rgba(211, 47, 47, 0.2)",
          color: "#ef9a9a",
        };

      case "INSIDE":
        return {
          background: "rgba(25, 118, 210, 0.2)",
          color: "#64b5f6",
        };

      case "OUTSIDE":
        return {
          background: "rgba(117, 117, 117, 0.2)",
          color: "#bdbdbd",
        };

      default:
        return {
          background: "rgba(255,255,255,0.1)",
          color: "white",
        };
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Geofence Events</h1>
          <p style={styles.subtitle}>
            View ENTER, EXIT and other geofence detection events
          </p>
        </div>

        <div style={styles.headerButtons}>
          <button style={styles.refreshButton} onClick={fetchEvents}>
            ↻ Refresh
          </button>

          <button
            style={styles.backButton}
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {loading && (
        <div style={styles.message}>
          Loading geofence events...
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Event History</h2>
              <p style={styles.count}>
                {events.length} event{events.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📍</div>

              <h3 style={styles.emptyTitle}>
                No geofence events yet
              </h3>

              <p style={styles.emptyText}>
                Submit a device location from the Locations page to
                trigger geofence detection.
              </p>

              <button
                style={styles.locationButton}
                onClick={() => navigate("/locations")}
              >
                Go to Locations
              </button>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Event</th>
                    <th style={styles.th}>Device</th>
                    <th style={styles.th}>Geofence</th>
                    <th style={styles.th}>State</th>
                    <th style={styles.th}>Coordinates</th>
                    <th style={styles.th}>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td style={styles.td}>#{event.id}</td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...getEventStyle(event.event_type),
                          }}
                        >
                          {event.event_type}
                        </span>
                      </td>

                      <td style={styles.td}>
                        Device #{event.device_id}
                      </td>

                      <td style={styles.td}>
                        Geofence #{event.geofence_id}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.state}>
                          <span>{event.previous_state}</span>
                          <span style={styles.arrow}>→</span>
                          <span>{event.current_state}</span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.coordinates}>
                          <span>
                            {event.latitude.toFixed(6)}
                          </span>
                          <span>
                            {event.longitude.toFixed(6)}
                          </span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        {new Date(
                          event.event_timestamp
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "30px",
    color: "white",
    minHeight: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
  },

  subtitle: {
    marginTop: "8px",
    color: "#aeb8c8",
    fontSize: "15px",
  },

  headerButtons: {
    display: "flex",
    gap: "10px",
  },

  refreshButton: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    cursor: "pointer",
  },

  backButton: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    cursor: "pointer",
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "24px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "21px",
  },

  count: {
    margin: "6px 0 0",
    color: "#8f9bad",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "950px",
  },

  th: {
    textAlign: "left",
    padding: "14px 12px",
    color: "#9faabd",
    fontSize: "12px",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  td: {
    padding: "16px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
  },

  state: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#c8d0dc",
  },

  arrow: {
    color: "#687386",
  },

  coordinates: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    fontFamily: "monospace",
    color: "#b8c2d1",
  },

  message: {
    padding: "30px",
    textAlign: "center",
    color: "#aeb8c8",
  },

  error: {
    padding: "14px",
    borderRadius: "8px",
    background: "rgba(211, 47, 47, 0.2)",
    border: "1px solid rgba(244, 67, 54, 0.4)",
    color: "#ef9a9a",
    marginBottom: "20px",
  },

  empty: {
    textAlign: "center",
    padding: "70px 20px",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "15px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "20px",
  },

  emptyText: {
    color: "#8f9bad",
    fontSize: "14px",
    margin: "10px auto 20px",
    maxWidth: "500px",
  },

  locationButton: {
    padding: "11px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#1976d2",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default Events;