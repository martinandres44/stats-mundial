import React, { useState, useEffect, useMemo } from "react";

export default function App() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para los filtros
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroEquipo, setFiltroEquipo] = useState("");
  const [filtroJugador, setFiltroJugador] = useState("");

  useEffect(() => {
    const fetchDatosMaestros = async () => {
      try {
        // Lee el archivo directamente desde la carpeta "public"
        const respuesta = await fetch("/data-mundiales.json");
        const dataBruta = await respuesta.json();

        // MAPEO DE DATOS:
        // Acá adaptamos los nombres de las columnas de tu JSON a los que usa la app.
        // Cambiá "item.Year", "item.Goalscorer", etc., según cómo se llamen en tu archivo.
        const dataFormateada = dataBruta.map((item, index) => ({
          id: index,
          anio: item.Year || item.anio || item.year,
          jugador:
            item.Goalscorer || item.Player || item.jugador || "Desconocido",
          equipo: item.Team || item.equipo || "Desconocido",
          rival: item.Opponent || item.rival || "-",
          minuto: item.Minute || item.minuto || "-",
          detalle: item.Action || item.Type || item.detalle || "Gol",
        }));

        // Filtramos aquellos registros que no tengan un año válido por las dudas
        const dataLimpia = dataFormateada.filter((d) => d.anio);

        setDatos(dataLimpia);
        setCargando(false);
      } catch (error) {
        console.error("Error cargando la base de datos local:", error);
        setCargando(false);
      }
    };

    fetchDatosMaestros();
  }, []);

  // Extraemos dinámicamente qué equipos y años existen en tu nueva base
  const aniosDisponibles = [...new Set(datos.map((d) => d.anio))].sort(
    (a, b) => b - a
  );
  const equiposDisponibles = [...new Set(datos.map((d) => d.equipo))].sort();

  // Lógica de filtrado en tiempo real
  const eventosFiltrados = useMemo(() => {
    return datos.filter((evento) => {
      const matchAnio =
        filtroAnio === "" || parseInt(evento.anio) === parseInt(filtroAnio);
      const matchEquipo =
        filtroEquipo === "" ||
        evento.equipo === filtroEquipo ||
        evento.rival === filtroEquipo;
      const matchJugador =
        filtroJugador === "" ||
        evento.jugador.toLowerCase().includes(filtroJugador.toLowerCase());

      return matchAnio && matchEquipo && matchJugador;
    });
  }, [datos, filtroAnio, filtroEquipo, filtroJugador]);

  if (cargando) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f4f6f9",
        }}
      >
        <h2 style={{ color: "#007bff" }}>
          ⏳ Cargando base de datos maestra...
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      <h2>🏆 Estadísticas Históricas del Mundial</h2>

      {/* Contenedor de Filtros */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Año / Edición:
          </label>
          <select
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px" }}
          >
            <option value="">Todos</option>
            {aniosDisponibles.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Equipo o Rival:
          </label>
          <select
            value={filtroEquipo}
            onChange={(e) => setFiltroEquipo(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px" }}
          >
            <option value="">Todos</option>
            {equiposDisponibles.map((equipo) => (
              <option key={equipo} value={equipo}>
                {equipo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Buscar Jugador:
          </label>
          <input
            type="text"
            placeholder="Ej: Messi, Pelé, Klose..."
            value={filtroJugador}
            onChange={(e) => setFiltroJugador(e.target.value)}
            style={{
              padding: "7px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={() => {
              setFiltroAnio("");
              setFiltroEquipo("");
              setFiltroJugador("");
            }}
            style={{
              padding: "8px 12px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#28a745",
          color: "#fff",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        <h3 style={{ margin: 0 }}>
          Registros encontrados: {eventosFiltrados.length}
        </h3>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            minWidth: "600px",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "2px solid #dee2e6",
                backgroundColor: "#f8f9fa",
              }}
            >
              <th style={{ padding: "12px" }}>Año</th>
              <th style={{ padding: "12px" }}>Jugador</th>
              <th style={{ padding: "12px" }}>País</th>
              <th style={{ padding: "12px" }}>Rival</th>
              <th style={{ padding: "12px" }}>Minuto</th>
              <th style={{ padding: "12px" }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {eventosFiltrados.length > 0 ? (
              eventosFiltrados.map((evento) => (
                <tr
                  key={evento.id}
                  style={{ borderBottom: "1px solid #dee2e6" }}
                >
                  <td style={{ padding: "12px" }}>{evento.anio}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    {evento.jugador}
                  </td>
                  <td style={{ padding: "12px" }}>{evento.equipo}</td>
                  <td style={{ padding: "12px" }}>{evento.rival}</td>
                  <td style={{ padding: "12px" }}>{evento.minuto}'</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        backgroundColor: "#17a2b8",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {evento.detalle}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#6c757d",
                  }}
                >
                  Sin resultados con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
