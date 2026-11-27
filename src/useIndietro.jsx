import { useNavigate } from "react-router-dom";

// Torna alla pagina precedente del sito. Se la pagina è stata aperta
// direttamente (link, nuova scheda), va invece alla pagina "padre".
export function useIndietro(percorsoPadre = "/") {
  const navigate = useNavigate();

  return () => {
    // React Router salva in history.state.idx la posizione nella cronologia:
    // 0 = pagina d'ingresso del sito, quindi dietro non c'è nulla del sito.
    // (Il replace non cambia l'indice, quindi funziona anche dopo il fallback.)
    const haPaginaPrecedente = (window.history.state?.idx ?? 0) > 0;

    if (haPaginaPrecedente) {
      navigate(-1);
    } else {
      navigate(percorsoPadre, { replace: true });
    }
  };
}