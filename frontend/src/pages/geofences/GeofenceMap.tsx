import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Circle,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import api from "../../services/api";

import "leaflet/dist/leaflet.css";

interface GeofencePoint {
  id: number;
  latitude: number;
  longitude: number;
  point_order: number;
}

interface Geofence {
  id: number;
  name: string;
  description?: string | null;
  geofence_type: "CIRCLE" | "POLYGON";
  center_latitude?: number | null;
  center_longitude?: number | null;
  radius?: number | null;
  is_active: boolean;
  points?: GeofencePoint[];
}

const DEFAULT_CENTER: [number, number] = [
  11.0168,
  76.9558,
];

const MapBounds = ({
  geofences,
}: {
  geofences: Geofence[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || geofences.length === 0) {
      return;
    }

    const bounds: [number, number][] = [];

    geofences.forEach((geofence) => {
      /* =========================
         CIRCLE GEOFENCE
         ========================= */

      if (
        geofence.geofence_type === "CIRCLE" &&
        geofence.center_latitude !== null &&
        geofence.center_latitude !== undefined &&
        geofence.center_longitude !== null &&
        geofence.center_longitude !== undefined &&
        geofence.radius !== null &&
        geofence.radius !== undefined
      ) {
        const latitude = geofence.center_latitude;
        const longitude = geofence.center_longitude;

        const radius = geofence.radius;

        /*
         * Approximate conversion:
         * 1 degree latitude ≈ 111,320 meters
         */

        const latitudeDelta =
          radius / 111320;

        /*
         * Longitude distance depends on latitude.
         */

        const longitudeDelta =
          radius /
          (111320 *
            Math.cos(
              (latitude * Math.PI) / 180
            ));

        bounds.push([
          latitude - latitudeDelta,
          longitude - longitudeDelta,
        ]);

        bounds.push([
          latitude + latitudeDelta,
          longitude + longitudeDelta,
        ]);
      }

      /* =========================
         POLYGON GEOFENCE
         ========================= */

      if (
        geofence.geofence_type === "POLYGON" &&
        geofence.points &&
        geofence.points.length > 0
      ) {
        geofence.points.forEach((point) => {
          bounds.push([
            point.latitude,
            point.longitude,
          ]);
        });
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 16,
      });
    }
  }, [map, geofences]);

  return null;
};

const GeofenceMap = () => {
  const navigate = useNavigate();

  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     LOAD GEOFENCES
     ========================= */

  useEffect(() => {
    const loadGeofences = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("access_token");

        const response = await api.get(
          "/geofences/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setGeofences(response.data);
      } catch (err: any) {
        console.error(
          "Failed to load geofences:",
          err
        );

        if (err.response?.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          navigate("/login");

          return;
        }

        setError(
          err.response?.data?.detail ||
            "Failed to load geofences."
        );
      } finally {
        setLoading(false);
      }
    };

    loadGeofences();
  }, [navigate]);

  /* =========================
     ACTIVE GEOFENCES
     ========================= */

  const activeGeofences = useMemo(() => {
    return geofences.filter(
      (geofence) => geofence.is_active
    );
  }, [geofences]);

  return (
    <div
      style={{
        padding: "24px",
        color: "white",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* =========================
          HEADER
          ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            Geofence Map
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#94a3b8",
            }}
          >
            View active geofences on the map
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/geofences")
          }
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #334155",
            background: "#1e293b",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Geofences
        </button>
      </div>

      {/* =========================
          LOADING
          ========================= */}

      {loading && (
        <div
          style={{
            padding: "30px",
            background: "#111827",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          Loading geofences...
        </div>
      )}

      {/* =========================
          ERROR
          ========================= */}

      {!loading && error && (
        <div
          style={{
            padding: "20px",
            background: "#3f1d1d",
            border:
              "1px solid #ef4444",
            borderRadius: "12px",
            color: "#fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* =========================
          MAP
          ========================= */}

      {!loading && !error && (
        <div
          style={{
            position: "relative",
            width: "100%",
            height:
              "calc(100vh - 180px)",
            minHeight: "500px",
            borderRadius: "14px",
            overflow: "hidden",
            border:
              "1px solid #334155",
          }}
        >
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={13}
            scrollWheelZoom={true}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            {/* OpenStreetMap */}

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Automatically fit map */}

            <MapBounds
              geofences={activeGeofences}
            />

            {/* =========================
                CIRCLE GEOFENCES
                ========================= */}

            {activeGeofences.map(
              (geofence) => {
                if (
                  geofence.geofence_type !==
                    "CIRCLE" ||
                  geofence.center_latitude ===
                    null ||
                  geofence.center_latitude ===
                    undefined ||
                  geofence.center_longitude ===
                    null ||
                  geofence.center_longitude ===
                    undefined ||
                  geofence.radius === null ||
                  geofence.radius ===
                    undefined
                ) {
                  return null;
                }

                return (
                  <Circle
                    key={geofence.id}
                    center={[
                      geofence.center_latitude,
                      geofence.center_longitude,
                    ]}
                    radius={
                      geofence.radius
                    }
                    pathOptions={{
                      color: "#06b6d4",
                      fillColor:
                        "#06b6d4",
                      fillOpacity: 0.18,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <div
                        style={{
                          minWidth:
                            "180px",
                        }}
                      >
                        <h3
                          style={{
                            marginTop: 0,
                            marginBottom:
                              "8px",
                          }}
                        >
                          {geofence.name}
                        </h3>

                        <p>
                          <strong>
                            Type:
                          </strong>{" "}
                          Circle
                        </p>

                        <p>
                          <strong>
                            Radius:
                          </strong>{" "}
                          {
                            geofence.radius
                          }{" "}
                          m
                        </p>

                        {geofence.description && (
                          <p>
                            <strong>
                              Description:
                            </strong>{" "}
                            {
                              geofence.description
                            }
                          </p>
                        )}

                        <button
                          onClick={() =>
                            navigate(
                              `/geofences/${geofence.id}/rules`
                            )
                          }
                          style={{
                            padding:
                              "7px 12px",
                            border:
                              "none",
                            borderRadius:
                              "6px",
                            background:
                              "#2563eb",
                            color:
                              "white",
                            cursor:
                              "pointer",
                          }}
                        >
                          View Rules
                        </button>
                      </div>
                    </Popup>
                  </Circle>
                );
              }
            )}

            {/* =========================
                POLYGON GEOFENCES
                ========================= */}

            {activeGeofences.map(
              (geofence) => {
                if (
                  geofence.geofence_type !==
                    "POLYGON" ||
                  !geofence.points ||
                  geofence.points.length <
                    3
                ) {
                  return null;
                }

                const sortedPoints = [
                  ...geofence.points,
                ].sort(
                  (a, b) =>
                    a.point_order -
                    b.point_order
                );

                const polygonPositions: [
                  number,
                  number
                ][] =
                  sortedPoints.map(
                    (point) => [
                      point.latitude,
                      point.longitude,
                    ]
                  );

                return (
                  <Polygon
                    key={geofence.id}
                    positions={
                      polygonPositions
                    }
                    pathOptions={{
                      color: "#a855f7",
                      fillColor:
                        "#a855f7",
                      fillOpacity: 0.18,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <div
                        style={{
                          minWidth:
                            "180px",
                        }}
                      >
                        <h3
                          style={{
                            marginTop: 0,
                            marginBottom:
                              "8px",
                          }}
                        >
                          {geofence.name}
                        </h3>

                        <p>
                          <strong>
                            Type:
                          </strong>{" "}
                          Polygon
                        </p>

                        <p>
                          <strong>
                            Points:
                          </strong>{" "}
                          {
                            sortedPoints.length
                          }
                        </p>

                        {geofence.description && (
                          <p>
                            <strong>
                              Description:
                            </strong>{" "}
                            {
                              geofence.description
                            }
                          </p>
                        )}

                        <button
                          onClick={() =>
                            navigate(
                              `/geofences/${geofence.id}/rules`
                            )
                          }
                          style={{
                            padding:
                              "7px 12px",
                            border:
                              "none",
                            borderRadius:
                              "6px",
                            background:
                              "#2563eb",
                            color:
                              "white",
                            cursor:
                              "pointer",
                          }}
                        >
                          View Rules
                        </button>
                      </div>
                    </Popup>
                  </Polygon>
                );
              }
            )}
          </MapContainer>

          {/* =========================
              LEGEND
              ========================= */}

          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              zIndex: 1000,
              background:
                "rgba(15, 23, 42, 0.95)",
              border:
                "1px solid #334155",
              borderRadius: "10px",
              padding:
                "14px 16px",
              color: "white",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Legend
            </div>

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "8px",
                marginBottom:
                  "7px",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius:
                    "50%",
                  background:
                    "#06b6d4",
                  display:
                    "inline-block",
                }}
              />

              Circle Geofence
            </div>

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius:
                    "3px",
                  background:
                    "#a855f7",
                  display:
                    "inline-block",
                }}
              />

              Polygon Geofence
            </div>
          </div>
        </div>
      )}

      {/* =========================
          NO ACTIVE GEOFENCES
          ========================= */}

      {!loading &&
        !error &&
        activeGeofences.length ===
          0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background:
                "#111827",
              borderRadius:
                "12px",
              color:
                "#94a3b8",
            }}
          >
            No active geofences
            available.
          </div>
        )}
    </div>
  );
};

export default GeofenceMap;