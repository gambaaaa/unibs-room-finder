import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import RoomPage from "./RoomPage";
import edifici from "./data/edifici";
import docenti from "./data/docenti/docenti.json";
import "./App.css";
import "./Wipeout.css";

const API_URL =
  "https://unibs-public.prod.up.cineca.it/api/Impegni/getImpegniPublic";

// FACOLTÀ E RELATIVI EDIFICI
const facolta = [
  {
    id: "ingegneria",
    nome: "Ingegneria",
    descrizione: "Edifici e aule della facoltà di Ingegneria",
    icona: "⚙️",
  },
  {
    id: "medicina",
    nome: "Medicina",
    descrizione: "Edifici e aule della facoltà di Medicina",
    icona: "⚕️",
  },
  {
    id: "economia",
    nome: "Economia",
    descrizione: "Edifici e aule della facoltà di Economia",
    icona: "📊",
  },
  {
    id: "giurisprudenza",
    nome: "Giurisprudenza",
    descrizione: "Edifici e aule della facoltà di Giurisprudenza",
    icona: "⚖️",
  },
];

// CLASSIFICAZIONE DEGLI EDIFICI
function appartieneAllaFacolta(codice, facoltaId) {
  switch (facoltaId) {
    case "ingegneria":
      return (
        /^ING[1-6]$/.test(codice) ||
        codice === "DICATAM"
      );

    case "medicina":
      return (
        /^MED-0?[1-9]$/.test(codice) ||
        codice === "MADONNALINO" ||
        codice === "SPEDCIV01"
      );

    case "economia":
      return (
        /^AMM[1-2]$/.test(codice) ||
        /^ECO[1-4]$/.test(codice) ||
        codice === "ANGUILLA"
      );

    case "giurisprudenza":
      return (
        /^JUS-[1-2]$/.test(codice) ||
        codice === "ANGUILLA"
      );

    default:
      return false;
  }
}

// PAGINA PRINCIPALE: SCELTA FACOLTÀ
function HomePage() {
  return (
    <main className="container">
      <header className="header home-header">
        <h1>UniBS Room Finder</h1>
        <p>
          Ricerca e consultazione delle aule
          dell'Università degli Studi di Brescia.
        </p>
      </header>

      <section className="home-menu">
        <h2>Seleziona una facoltà o cerca un professore</h2>

        <div className="faculty-list">
          {facolta.map((item) => (
            <Link
              to={`/facolta/${item.id}`}
              className="faculty-list-item"
              key={item.id}
            >
              {item.nome}
            </Link>
          ))}

          <Link
            to="/professori"
            className="faculty-list-item"
          >
            Ricerca Professore
          </Link>
        </div>
      </section>
    </main>
  );
}

// PAGINA FACOLTÀ: ELENCO EDIFICI
function FacultyPage() {
  const navigate = useNavigate();
  const { facultyId } = useParams();

  const selezionata = facolta.find(
    (item) => item.id === facultyId
  );

  const edificiFacolta = useMemo(() => {
    return edifici
      .filter((edificio) =>
        appartieneAllaFacolta(edificio.codice, facultyId)
      )
      .sort((a, b) => a.codice.localeCompare(b.codice));
  }, [facultyId]);

  if (!selezionata) {
    return (
      <main className="container">
        <h1>Facoltà non trovata</h1>
        <Link to="/">Torna alla pagina principale</Link>
      </main>
    );
  }

  return (
    <main className="container faculty-page">
      <header className="header">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
        >
          ←
      </button>

        <h1>{selezionata.nome}</h1>
        <p>{selezionata.descrizione}</p>
      </header>

      <section className="panel">
        <div className="section-heading">
          <h2>Edifici disponibili</h2>
        </div>

        <div className="building-list wipeout-buildings">
          {edificiFacolta.map((edificio) => (
            <Link
              to={`/edificio/${edificio.id}`}
              className="building-card wipeout-building"
              key={edificio.id}
            >
              <div className="wipeout-building-symbol">
                <svg
                  className="wipeout-arrow-down"
                  viewBox="0 0 80 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 2 V27 H72 M61 16 L72 27 L61 38"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  />
                </svg>
              </div>

              <div className="wipeout-building-label">
                <strong>{edificio.codice}</strong>
                <span>{edificio.descrizione}</span>
              </div>
            </Link>
          ))}
        </div>

        {edificiFacolta.length === 0 && (
          <p className="empty">
            Nessun edificio disponibile per questa facoltà.
          </p>
        )}
      </section>
    </main>
  );
}

// Palette dei colori
const paletteAule = [
  "#087E9B", "#F4C51B", "#EF315B", "#F28B17",
  "#68B9D9", "#B43D75", "#F5A4C1", "#D72B25",
  "#7B9E45", "#E5B93F", "#5145A0", "#00B8A9",
  "#E85D04", "#FFBA08", "#3A86FF", "#8338EC",
  "#D1495B", "#00798C", "#6A994E", "#BC4749",
  "#00A6A6", "#FF6B35", "#7B2CBF", "#90BE6D",
  "#F72585", "#4361EE", "#F9C74F", "#577590",
  "#43AA8B", "#F94144", "#277DA1", "#F3722C"
];

// Generazione delle coppie distinte
function generaColoriAule(numeroAule) {
  const coppie = [];

  for (let i = 0; i < paletteAule.length; i++) {
    for (let j = i + 1; j < paletteAule.length; j++) {
      coppie.push([paletteAule[i], paletteAule[j]]);
    }
  }

  const coloriAssegnati = new Map();

  const tutteLeAule = edifici
    .flatMap((edificio) => edificio.aule)
    .sort((a, b) =>
      String(a.id || a.codice).localeCompare(
        String(b.id || b.codice),
        "it",
        { numeric: true }
      )
    );

  tutteLeAule.slice(0, numeroAule).forEach((aula, index) => {
    coloriAssegnati.set(
      aula.id || aula.codice,
      coppie[index % coppie.length]
    );
  });

  return coloriAssegnati;
}

// PAGINA EDIFICIO: ELENCO AULE
function BuildingPage() {

  const numeroTotaleAule = edifici.reduce(
  (totale, edificio) => totale + edificio.aule.length,
  0
  );

  const coloriPerAula = generaColoriAule(numeroTotaleAule);

  const navigate = useNavigate();
  const { buildingId } = useParams();

  const edificio = edifici.find(
    (item) => item.id === buildingId
  );

  // ID delle aule occupate in questo momento
  const [auleOccupate, setAuleOccupate] = useState(() => new Set());

  useEffect(() => {
    if (!edificio) return;

    const controller = new AbortController();
    let impegni = [];

    // Ricalcola quali aule hanno un impegno in corso adesso
    const aggiornaOccupate = () => {
      const adesso = Date.now();
      const occupate = new Set();

      impegni.forEach((impegno) => {
        const inizio = new Date(impegno.dataInizio).getTime();
        const fine = new Date(impegno.dataFine).getTime();

        if (inizio <= adesso && adesso < fine) {
          (impegno.aule || []).forEach((aula) => occupate.add(aula.id));
        }
      });

      setAuleOccupate(occupate);
    };

    async function caricaImpegni() {
      try {
        const inizio = new Date();
        inizio.setHours(0, 0, 0, 0);

        const fine = new Date(inizio);
        fine.setDate(fine.getDate() + 1);

        const params = new URLSearchParams({
          edificio: edificio.id,
          dataInizio: formatDataApi(inizio),
          dataFine: formatDataApi(fine),
        });

        const response = await fetch(`${API_URL}?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Errore HTTP ${response.status}`);
        }

        const risultato = await response.json();
        impegni = Array.isArray(risultato) ? risultato : [];
        aggiornaOccupate();
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      }
    }

    caricaImpegni();

    // Aggiorna lo stato ogni 30 secondi senza rifare la richiesta
    const timer = setInterval(aggiornaOccupate, 30000);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [edificio?.id]);

  const auleOrdinate = useMemo(() => {
    if (!edificio) return [];

    return [...edificio.aule].sort((a, b) =>
      a.codice.localeCompare(b.codice, "it", {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [edificio]);

  if (!edificio) {
    return (
      <main className="container">
        <h1>Edificio non trovato</h1>
        <Link to="/">Torna alla pagina principale</Link>
      </main>
    );
  }

  const nomeEdificio = edificio.codice;
  const indirizzo = edificio.descrizione || "";

  return (
    <main className="container building-page">

      <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
        >
          ←
      </button>

      <div className="rooms wipeout-rooms">
        {auleOrdinate.map((aula) => {
          const colori = coloriPerAula.get(aula.id || aula.codice);
          const occupata = auleOccupate.has(aula.id);

          return (
            <Link
              to={`/aula/${aula.id}`}
              className={`room room-link wipeout-room${
                occupata ? " occupata" : ""
              }`}
              key={aula.id}
            >
              {/* Aula occupata: colori gestiti dal CSS (nero/grigio) */}
              <div className="wipeout-bars">
                <span
                  style={
                    occupata ? undefined : { backgroundColor: colori[0] }
                  }
                />
                <span
                  style={
                    occupata ? undefined : { backgroundColor: colori[1] }
                  }
                />
              </div>

              <div className="wipeout-room-label">
                <strong>{aula.descrizione}</strong>

                <span>
                  {aula.codice} : {aula.capienza}
                </span>

                {occupata && (
                  <span className="wipeout-room-status">Occupata</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

// PAGINA RICERCA PROFESSORE
function formatDataApi(date) {
  const pad = (value) => String(value).padStart(2, "0");

  const offset = -date.getTimezoneOffset();
  const segno = offset >= 0 ? "+" : "-";
  const oreOffset = pad(Math.floor(Math.abs(offset) / 60));
  const minutiOffset = pad(Math.abs(offset) % 60);

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${segno}${oreOffset}:${minutiOffset}`
  );
}

function formatOra(timestamp) {
  return new Date(timestamp).toLocaleTimeString("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dataLocale(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function ProfessorPage() {
  const navigate = useNavigate();

  const [ricerca, setRicerca] = useState("");
  const [docenteSelezionato, setDocenteSelezionato] = useState(null);
  const [data, setData] = useState(dataLocale(new Date()));

  const [impegni, setImpegni] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  const docentiFiltrati = useMemo(() => {
    const termine = ricerca.trim().toLowerCase();

    if (termine.length < 2 || docenteSelezionato) {
      return [];
    }

    return docenti
      .filter((docente) => {
        const nomeCompleto =
          `${docente.nome} ${docente.cognome}`.toLowerCase();

        const cognomeNome =
          `${docente.cognome} ${docente.nome}`.toLowerCase();

        return (
          nomeCompleto.includes(termine) ||
          cognomeNome.includes(termine) ||
          docente.matricola?.includes(termine)
        );
      })
      .slice(0, 10);
  }, [ricerca, docenteSelezionato]);

  const cambiaGiorno = (giorni) => {
    const nuovaData = new Date(`${data}T12:00:00`);
    nuovaData.setDate(nuovaData.getDate() + giorni);
    setData(dataLocale(nuovaData));
  };

  useEffect(() => {
    if (!docenteSelezionato) {
      setImpegni(null);
      setErrore("");
      return;
    }

    const controller = new AbortController();

    async function caricaImpegni() {
      setLoading(true);
      setErrore("");
      setImpegni(null);

      try {
        const inizio = new Date(`${data}T00:00:00`);
        const fine = new Date(inizio);
        fine.setDate(fine.getDate() + 1);

        const params = new URLSearchParams({
          ricerca: "docenti",
          annoAccademico: "65aa44f34b1d790019440311",
          docente: docenteSelezionato.id,
          dataInizio: formatDataApi(inizio),
          dataFine: formatDataApi(fine),
        });

        const response = await fetch(
          `https://unibs-public.prod.up.cineca.it/api/Impegni/getImpegniPublic?${params}`,
          {
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Errore HTTP ${response.status}`);
        }

        const risultati = await response.json();

        setImpegni(
          Array.isArray(risultati)
            ? risultati.sort(
                (a, b) =>
                  new Date(a.dataInizio) - new Date(b.dataInizio)
              )
            : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setErrore("Impossibile recuperare gli impegni del docente.");
          setImpegni([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    caricaImpegni();

    return () => controller.abort();
  }, [docenteSelezionato, data]);

  return (
    <main className="container professor-page">
      <header className="header">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <h1>Ricerca professore</h1>

        <p>
          Cerca un docente e consulta le sue lezioni.
        </p>
      </header>

      <section className="professor-search">

        <input
          type="text"
          value={ricerca}
          readOnly={!!docenteSelezionato}
          onChange={(event) => {
            setRicerca(event.target.value);
            setDocenteSelezionato(null);
          }}
        />

        {docentiFiltrati.length > 0 && (
          <div className="professor-results">
            {docentiFiltrati.map((docente) => (
              <button
                type="button"
                className="professor-result"
                key={docente.id}
                onClick={() => {
                  setDocenteSelezionato(docente);
                  setRicerca(
                    `${docente.nome} ${docente.cognome}`
                  );
                }}
              >
                <span>
                  {docente.nome} {docente.cognome}
                </span>

                <span className="professor-matricola">
                  {docente.matricola}
                </span>
              </button>
            ))}
          </div>
        )}

        {ricerca.trim().length >= 2 &&
          !docenteSelezionato &&
          docentiFiltrati.length === 0 && (
            <p className="professor-message">
              
            </p>
          )}
      </section>

      {docenteSelezionato && (
        <section className="schedule-container professor-schedule">
          <div className="date-selector">
            <button
              type="button"
              className="date-arrow"
              onClick={() => cambiaGiorno(-1)}
              aria-label="Giorno precedente"
            >
              ←
            </button>

            <input
              id="data-professore"
              type="date"
              value={data}
              onChange={(event) => setData(event.target.value)}
            />

            <button
              type="button"
              className="date-arrow"
              onClick={() => cambiaGiorno(1)}
              aria-label="Giorno successivo"
            >
              →
            </button>
            </div>

            {loading && (
              <p className="professor-message"></p>
            )}

            {errore && (
              <p className="error">{errore}</p>
            )}

            {impegni !== null && !loading && !errore && (
              <div className="lesson-list">
                {impegni.length === 0 ? (
                  <p className="no-events">
                    Nessun impegno trovato per questa data.
                  </p>
                ) : (
                  impegni
                    .sort(
                      (a, b) =>
                        new Date(a.dataInizio) - new Date(b.dataInizio)
                    )
                    .map((impegno) => {
                      const insegnamenti = [
                        ...new Set(
                          (impegno.evento?.dettagliDidattici || [])
                            .map((dettaglio) => dettaglio.nome?.trim())
                            .filter(Boolean)
                        ),
                      ];

                      const aule = impegno.aule || [];
                      const docentiImpegno = impegno.docenti || [];

                      return (
                        <article className="lesson" key={impegno.id}>
                          <div className="lesson-row">
                            <span className="lesson-time">
                              {formatOra(impegno.dataInizio)}
                              {" – "}
                              {formatOra(impegno.dataFine)}
                            </span>

                            <span className="lesson-course">
                              {insegnamenti.length > 0
                                ? insegnamenti.join(", ")
                                : impegno.evento?.nome || "Attività senza titolo"}
                            </span>
                          </div>

                          <div className="lesson-row">
                            <span className="lesson-time">
                              {impegno.evento?.tipoAttivita?.descrizione ||
                                "Attività"}
                            </span>

                            <span className="lesson-professor">
                              {aule.map((aula) => (
                                <span key={aula.id}>
                                  {aula.descrizione || aula.codice}
                                  {aula.edificio && (
                                    <>
                                      {" — "}
                                      {aula.edificio.codice}
                                      {" · "}
                                      {aula.edificio.descrizione}
                                    </>
                                  )}
                                </span>
                              ))}
                            </span>
                          </div>

                          {docentiImpegno.length > 1 && (
                            <div className="lesson-row">
                              <span className="lesson-professor">
                                {docentiImpegno
                                  .map(
                                    (persona) =>
                                      `${persona.nome} ${persona.cognome}`
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                        </article>
                      );
                    })
                )}
              </div>
            )}
        </section>
      )}
    </main>
  );
}

// APPLICAZIONE E GESTIONE TEMA
function App() {
  const [ora, setOra] = useState(() => new Date());

  useEffect(() => {
    document.body.dataset.theme = "wipeout";

    const timer = setInterval(() => {
      setOra(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dataSistema = ora
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  const oraSistema = ora.toLocaleTimeString("it-IT", {
    hour12: false,
  });

  const fusoOrario = Intl.DateTimeFormat()
    .resolvedOptions().timeZone;

  return (
    <div className="app-shell">
      <nav className="theme-bar">
        <span className="system-status">
          SYS.DATE // {dataSistema}
          {"  |  "}
          LOCAL.TIME // {oraSistema}
          {"  |  "}
          TZ // {fusoOrario}
        </span>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/facolta/:facultyId" element={<FacultyPage />} />
        <Route path="/edificio/:buildingId" element={<BuildingPage />} />
        <Route path="/aula/:roomId" element={<RoomPage />} />
        <Route path="/professori" element={<ProfessorPage />} />
      </Routes>

      <footer className="app-footer">
        <span className="app-footer-left">WIPEOUT THEME 1.0</span>
        <span className="app-footer-right">GAMBA 2026</span>
      </footer>
    </div>
  );
}

export default App;