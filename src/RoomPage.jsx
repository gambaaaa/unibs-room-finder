
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import edifici from "./data/edifici";
import { useIndietro } from "./useIndietro";

const API_URL =
  "https://unibs-public.prod.up.cineca.it/api/Impegni/getImpegniPublic";

// Data locale nel formato YYYY-MM-DD
function dataLocale(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Offset del fuso orario locale
function offsetLocale(date) {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const minutes = String(Math.abs(offset) % 60).padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
}

function formatOra(timestamp) {
  return new Date(timestamp).toLocaleTimeString("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNomeInsegnamento(impegno) {
  const dettagli = impegno.evento?.dettagliDidattici;

  let nome = "";

  if (dettagli?.length > 0) {
    nome = dettagli
      .map((dettaglio) => dettaglio.nome)
      .find(Boolean) || "";
  }

  if (!nome) {
    nome = impegno.evento?.nome || "Insegnamento non disponibile";
  }

  nome = nome.trim().toLocaleLowerCase("it-IT");

  return nome.charAt(0).toLocaleUpperCase("it-IT") + nome.slice(1);
}

function formatNomePersona(nome) {
  return (nome || "")
    .trim()
    .toLocaleLowerCase("it-IT")
    .replace(/\b\p{L}/gu, (lettera) =>
      lettera.toLocaleUpperCase("it-IT")
    );
}

function getDocenti(impegno) {
  const docenti = impegno.docenti || [];

  const nomiUnici = [
    ...new Set(
      docenti
        .map((docente) => {
          const nome = formatNomePersona(docente.nome);
          const cognome = formatNomePersona(docente.cognome);

          return `${nome} ${cognome}`.trim();
        })
        .filter((nome) => nome !== "")
    ),
  ];

  return nomiUnici.length > 0
    ? nomiUnici.map((nome) => `Prof. ${nome}`).join(", ")
    : "Docente non disponibile";
}

function RoomPage() {
  const { roomId } = useParams();

  const [data, setData] = useState(dataLocale(new Date()));
  const [impegni, setImpegni] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  const cambiaGiorno = (giorni) => {
    const nuovaData = new Date(`${data}T12:00:00`);
    nuovaData.setDate(nuovaData.getDate() + giorni);
    setData(dataLocale(nuovaData));
  };
  
  // Cerca l'aula e il relativo edificio nei JSON locali
  let edificio = null;
  let aula = null;

  for (const item of edifici) {
    const trovata = item.aule.find((room) => room.id === roomId);

    if (trovata) {
      edificio = item;
      aula = trovata;
      break;
    }
  }

  // Freccia indietro: se la pagina è aperta da link diretto, va all'edificio
  const indietro = useIndietro(
    edificio ? `/edificio/${edificio.id}` : "/"
  );

  useEffect(() => {
    if (!edificio) return;

    async function recuperaImpegni() {
      setLoading(true);
      setErrore("");
      setImpegni(null);

      try {
        const inizio = new Date(`${data}T00:00:00`);
        const fine = new Date(`${data}T00:00:00`);
        fine.setDate(fine.getDate() + 1);

        const params = new URLSearchParams({
          edificio: edificio.id,
          dataInizio: `${data}T00:00:00${offsetLocale(inizio)}`,
          dataFine: `${dataLocale(fine)}T00:00:00${offsetLocale(fine)}`,
        });

        const response = await fetch(
          `${API_URL}?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`Errore HTTP ${response.status}`);
        }

        const result = await response.json();


        const impegniAula = result.filter((impegno) =>
            impegno.aule?.some((spazio) => spazio.id === roomId)
        );

        // Elimina i duplicati dello stesso insegnamento e orario
        const impegniUnici = [
        ...new Map(
            impegniAula.map((impegno) => {
            const chiave = [
                impegno.eventoId,
                impegno.dataInizio,
                impegno.dataFine,
                roomId,
            ].join("|");

            return [chiave, impegno];
            })
        ).values(),
        ];

        setImpegni(impegniUnici);

      } catch (error) {

      } finally {
        setLoading(false);
      }
    }

    recuperaImpegni();
  }, [data, edificio?.id, roomId]);

  if (!aula) {
    return <Navigate to="/404" replace />;
  }

  return (
    <main className="container">
      <header className="room-header">
        <button
            type="button"
            className="back-link"
            onClick={indietro}
        >
            ←
        </button>

        <h1>{aula.descrizione}</h1>
        <p>{aula.codice} : {aula.capienza}</p>
      </header>

      <section className="schedule-container">

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
                id="data"
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

        {loading}

        {errore}

        {impegni !== null && (
    <div className="schedule">

        {impegni.length === 0 ? (
        <p className="no-events">
            
        </p>
        ) : (
        <div className="lesson-list">
        {impegni
            .sort(
            (a, b) =>
                new Date(a.dataInizio) - new Date(b.dataInizio)
            )
            .map((impegno) => (
            <article className="lesson" key={impegno.id}>
                <div className="lesson-row">
                <span className="lesson-time">
                    {formatOra(impegno.dataInizio)}
                </span>

                <span className="lesson-course">
                    {getNomeInsegnamento(impegno)}
                </span>
                </div>

                <div className="lesson-row">
                <span className="lesson-time">
                    {formatOra(impegno.dataFine)}
                </span>

                <span className="lesson-professor">
                    {getDocenti(impegno)}
                </span>
                </div>

                {impegno.indisponibilita && (
                <span className="unavailable">
                    Aula non disponibile
                </span>
                )}
            </article>
            ))}
        </div>
        )}
    </div>
    )}
      </section>
    </main>
  );
}

export default RoomPage;
