import React, { useState, useEffect, useMemo } from "react";

export default function App() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para los filtros
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroEquipo, setFiltroEquipo] = useState("");
  const [filtroJugador, setFiltroJugador] = useState("");
  const [filtroTipoGol, setFiltroTipoGol] = useState(""); // <-- Nuevo estado

  useEffect(() => {
    const fetchDatosMaestros = async () => {
      try {
        const respuesta = await fetch("/data-mundiales.json");
        const dataBruta = await respuesta.json();

        let todosLosGoles = [];
        let idCounter = 1;

        // Analizamos partido por partido
        dataBruta.forEach((partido) => {
          const anio = partido.Year;
          const equipoLocal = partido.home_team;
          const equipoVisitante = partido.away_team;

          const procesarGolesJugada = (strGoles, equipo, rival) => {
            if (!strGoles || strGoles === '""') return;
            const regex = /'([^']+)'/g;
            let match;
            while ((match = regex.exec(strGoles)) !== null) {
              const partes = match[1].split("|");
              if (partes.length >= 3) {
                const minuto = partes[0].replace("&rsquor;", "");
                const jugador = partes[2].trim();

                todosLosGoles.push({
                  id: idCounter++,
                  anio: anio,
                  jugador: jugador,
                  equipo: equipo,
                  rival: rival,
                  minuto: minuto,
                  detalle: "Jugada",
                });
              }
            }
          };

          const procesarGolesEspeciales = (strGoles, equipo, rival, tipo) => {
            if (!strGoles || strGoles === "") return;
            const golesSeparados = strGoles.split("|");
            golesSeparados.forEach((golStr) => {
              const partes = golStr.split(" · ");
              if (partes.length === 2) {
                const jugador = partes[0]
                  .replace(" (P)", "")
                  .replace(" (OG)", "")
                  .trim();
                const minuto = partes[1].trim();

                todosLosGoles.push({
                  id: idCounter++,
                  anio: anio,
                  jugador: jugador,
                  equipo: equipo,
                  rival: rival,
                  minuto: minuto,
                  detalle: tipo,
                });
              }
            });
          };

          procesarGolesJugada(
            partido.home_goal_long,
            equipoLocal,
            equipoVisitante
          );
          procesarGolesEspeciales(
            partido.home_penalty_goal,
            equipoLocal,
            equipoVisitante,
            "Penal"
          );
          procesarGolesEspeciales(
            partido.home_own_goal,
            equipoLocal,
            equipoVisitante,
            "En contra"
          );

          procesarGolesJugada(
            partido.away_goal_long,
            equipoVisitante,
            equipoLocal
          );
          procesarGolesEspeciales(
            partido.away_penalty_goal,
            equipoVisitante,
            equipoLocal,
            "Penal"
          );
          procesarGolesEspeciales(
            partido.away_own_goal,
            equipoVisitante,
            equipoLocal,
            "En contra"
          );
        });

        todosLosGoles.sort((a, b) => b.anio - a.anio);
        setDatos(todosLosGoles);
        setCargando(false);
      } catch (error) {
        console.error("Error cargando o procesando la base de datos:", error);
        setCargando(false);
      }
    };

    fetchDatosMaestros();
  }, []);

  // Extraemos opciones dinámicas para los menús desplegables
  const aniosDisponibles = [...new Set(datos.map((d) => d.anio))].sort(
    (a, b) => b - a
  );
  const equiposDisponibles = [...new Set(datos.map((d) => d.equipo))].sort();
  const tiposDisponibles = [...new Set(datos.map((d) => d.detalle))].sort(); // <-- Nuevas opciones de tipo de gol

  // Lógica de filtrado actualizada
  const eventosFiltrados = useMemo(() => {
    return datos.filter((evento) => {
      const matchAnio =
        filtroAnio === "" || parseInt(evento.anio) === parseInt(filtroAnio);
      const matchEquipo = filtroEquipo === "" || evento.equipo === filtroEquipo;
      const matchJugador =
        filtroJugador === "" ||
        evento.jugador.toLowerCase().includes(filtroJugador.toLowerCase());
      const matchTipoGol =
        filtroTipoGol === "" || evento.detalle === filtroTipoGol; // <-- Filtro cruzado

      return matchAnio && matchEquipo && matchJugador && matchTipoGol;
    });
  }, [datos, filtroAnio, filtroEquipo, filtroJugador, filtroTipoGol]);

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
        <h2 style={{ color: "#007bff" }}>⏳ Procesando partidos...</h2>
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
            Equipo Anotador:
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

        {/* Nuevo menú desplegable para Tipo de Gol */}
        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Tipo de Gol:
          </label>
          <select
            value={filtroTipoGol}
            onChange={(e) => setFiltroTipoGol(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px" }}
          >
            <option value="">Todos</option>
            {tiposDisponibles.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
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
            placeholder="Ej: Messi, Mbappé..."
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
              setFiltroTipoGol("");
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
          Goles encontrados: {eventosFiltrados.length}
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
              <th style={{ padding: "12px" }}>País Anotador</th>
              <th style={{ padding: "12px" }}>Rival</th>
              <th style={{ padding: "12px" }}>Minuto</th>
              <th style={{ padding: "12px" }}>Tipo</th>
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
                        backgroundColor:
                          evento.detalle === "Penal"
                            ? "#ffc107"
                            : evento.detalle === "En contra"
                            ? "#dc3545"
                            : "#17a2b8",
                        color: evento.detalle === "Penal" ? "#000" : "#fff",
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
