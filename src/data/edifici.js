const files = import.meta.glob("./aule_per_edificio/*.json", {
  eager: true,
  import: "default",
});

const classificazione = {
  ingegneria: [
    "ING1",
    "ING2",
    "ING3",
    "ING4",
    "ING5",
    "ING6",
    "DICATAM",
  ],

  medicina: [
    "MED-1",
    "MED-2",
    "MED-3",
    "MED-04",
    "MED-05",
    "MED-06",
    "MED-07",
    "MED-08",
    "MED-09",
    "MADONNALINO",
    "SPEDCIV01",
  ],

  economia: [
    "AMM1",
    "AMM2",
    "ECO1",
    "ECO2",
    "ECO3",
    "ECO4",
    "ANGUILLA",
  ],

  giurisprudenza: [
    "JUS-1",
    "JUS-2",
    "CASA MERCANTI",
    "ANGUILLA",
  ],
};

const edifici = Object.values(files)
  .map((file) => {
    const facolta = Object.entries(classificazione).find(
      ([, codici]) => codici.includes(file.edificio.codice)
    )?.[0];

    return {
      id: file.edificio.id,
      codice: file.edificio.codice,
      descrizione: file.edificio.descrizione,
      aule: file.aule || [],
      facolta: facolta || null,
    };
  })
  .sort((a, b) => a.codice.localeCompare(b.codice));

export { classificazione };
export default edifici;