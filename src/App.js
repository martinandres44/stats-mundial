import React, { useState, useEffect, useMemo } from "react";

export default function App() {
  // Ahora "datos" arranca vacío y lo llenamos desde GitHub
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true); // Pantalla de carga

  // Estados para los filtros
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroEquipo, setFiltroEquipo] = useState("");
  const [filtroJugador, setFiltroJugador] = useState("");

  // Efecto que corre una sola vez al cargar la página
  useEffect(() => {
    const fetchDatosHistoricos = async () => {
      // Todos los años en los que se jugó un mundial (incluyendo 2026)
      const anios = [
        1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982,
        1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026,
      ];

      let todosLosGoles = [];
      let idCounter = 1;

      // Hacemos fetch (llamada de red) a cada JSON directamente desde el raw de GitHub
      const promesas = anios.map((anio) =>
        fetch(
          `https://raw.githubusercontent.com/openfootball/worldcup.json/master/${anio}/worldcup.json`
        )
          .then((res) => {
            if (!res.ok) return null; // Si no hay datos (ej: el mundial no terminó), lo salta
            return res.json();
          })
          .catch(() => null)
      );

      // Esperamos a que se descarguen los datos de TODAS las ediciones
      const resultados = await Promise.all(promesas);

      // Limpiamos y estructuramos la información
      resultados.forEach((mundial, index) => {
        if (!mundial || !mundial.matches) return;
        const anio = anios[index];

        mundial.matches.forEach((partido) => {
          // Extraer los goles del equipo 1
          if (Array.isArray(partido.goals1)) {
            partido.goals1.forEach((gol) => {
              todosLosGoles.push({
                id: idCounter++,
                anio: anio,
                jugador: gol.name,
                equipo: partido.team1,
                rival: partido.team2,
                minuto: gol.minute,
                detalle: gol.penalty
                  ? "Penal"
                  : gol.owngoal
                  ? "En contra"
                  : "Jugada",
              });
            });
          }
          // Extraer los goles del equipo 2
          if (Array.isArray(partido.goals2)) {
            partido.goals2.forEach((gol) => {
              todosLosGoles.push({
                id: idCounter++,
                anio: anio,
                jugador: gol.name,
                equipo: partido.team2,
                rival: partido.team1,
                minuto: gol.minute,
                detalle: gol.penalty
                  ? "Penal"
                  : gol.owngoal
                  ? "En contra"
                  : "Jugada",
              });
            });
          }
        });
      });

      // Guardamos la base de datos gigante y quitamos la pantalla de carga
      setDatos(todosLosGoles);
      setCargando(false);
    };

    fetchDatosHistoricos();
  }, []);

  // Extraemos dinámicamente qué equipos y años existen en la base descargada
  const aniosDisponibles = [...new Set(datos.map((d) => d.anio))].sort(
    (a, b) => b - a
  );
  const equiposDisponibles = [...new Set(datos.map((d) => d.equipo))].sort();

  // Lógica de filtrado en tiempo real
  const eventosFiltrados = useMemo(() => {
    return datos.filter((evento) => {
      const matchAnio =
        filtroAnio === "" || evento.anio === parseInt(filtroAnio);
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

  // Pantalla de carga mientras trae los archivos de GitHub
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
        <h2 style={{ color: "#007bff" }}>⏳ Conectando con GitHub...</h2>
        <p>Descargando la base de datos de todos los mundiales (1930 - 2026)</p>
      </div>
    );
  }

  // Interfaz principal
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      <h2>⚽ Dashboard de Goles Históricos del Mundial</h2>

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
          Goles encontrados: {eventosFiltrados.length}
        </h3>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
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
