import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string | null;
  created_at: string;
}

const AuditLogs = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await api.get("/audit-logs/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const getActionStyle = (action: string) => {
    const value = action.toUpperCase();

    if (value.includes("CREATE")) {
      return {
        background: "rgba(46, 125, 50, 0.2)",
        color: "#81c784",
      };
    }

    if (value.includes("UPDATE")) {
      return {
        background: "rgba(25, 118, 210, 0.2)",
        color: "#64b5f6",
      };
    }

    if (value.includes("DELETE")) {
      return {
        background: "rgba(211, 47, 47, 0.2)",
        color: "#ef9a9a",
      };
    }

    return {
      background: "rgba(255,255,255,0.1)",
      color: "#c8d0dc",
    };
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Audit Logs</h1>
          <p style={styles.subtitle}>
            Track administrative actions performed in the system
          </p>
        </div>

        <div style={styles.headerButtons}>
          <button style={styles.refreshButton} onClick={fetchLogs}>
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
          Loading audit logs...
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Activity History</h2>
              <p style={styles.count}>
                {logs.length} log{logs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {logs.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📋</div>

              <h3 style={styles.emptyTitle}>
                No audit logs found
              </h3>

              <p style={styles.emptyText}>
                Administrative actions will appear here when they are
                performed.
              </p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Entity</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Date & Time</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={styles.td}>#{log.id}</td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...getActionStyle(log.action),
                          }}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {log.user_id !== null
                          ? `User #${log.user_id}`
                          : "System"}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.entity}>
                          <strong>{log.entity_type}</strong>

                          {log.entity_id !== null && (
                            <span>
                              #{log.entity_id}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.description}>
                          {log.description || "—"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {new Date(
                          log.created_at
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
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
  },

  entity: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  description: {
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
    marginTop: "10px",
  },
};

export default AuditLogs;