/*
 * Känguru-Antwortbogen
 * Die Aufgaben selbst sind urheberrechtlich geschützt (© Verein Känguru Schweiz)
 * und werden hier NUR verlinkt. Gespeichert sind nur die offiziellen Lösungsbuchstaben.
 * Quelle: https://www.kaenguru-schweiz.ch/wettbewerb/aufgaben-archiv/
 *
 * points: Punktwert pro Aufgabe (3, 4 oder 5), gleiche Reihenfolge wie answers.
 * labels: Bezeichnung der Aufgabe wie im PDF.
 */
(function () {
  const U = "https://www.kaenguru-schweiz.ch/wp-content/uploads/";
  const KS = "https://www.kangourou-suisse.ch/wp-content/uploads/";

  // 18 Aufgaben: 6x3, 6x4, 6x5 Punkte (Stufe 3/4 ab 2023)
  const p18 = [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5];
  // 24 Aufgaben: 8x3, 8x4, 8x5 Punkte
  const p24 = [3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5];
  const nums = (n) => Array.from({ length: n }, (_, i) => String(i + 1));
  const abc8 = ["A", "B", "C"].flatMap((g) => [1, 2, 3, 4, 5, 6, 7, 8].map((i) => g + i));

  const split = (s) => s.replace(/\s+/g, "").split("");

  window.KAENGURU = [
    // ---------- 2026 ----------
    {
      id: "2026-34", year: 2026, level: "3/4",
      pdf: { de: U + "2026_34_deu.pdf", en: U + "2026_34_eng.pdf" },
      solutions: U + "Loesungsbuchstaben-Kaenguru-2026.pdf",
      labels: nums(18), points: p18,
      answers: split("BDDBAC ACBEDB DACEDA"),
    },
    {
      id: "2026-56", year: 2026, level: "5/6",
      pdf: { de: U + "2026_56_deu.pdf", en: U + "2026_56_eng.pdf" },
      solutions: U + "Loesungsbuchstaben-Kaenguru-2026.pdf",
      labels: nums(24), points: p24,
      answers: split("CBEBDCAC ABEDEACB DDBEBACD"),
    },
    // ---------- 2025 ----------
    {
      id: "2025-34", year: 2025, level: "3/4",
      pdf: { de: U + "34_ch_red.pdf", en: U + "2025_34_eng.pdf" },
      solutions: U + "Loesungsbuchstaben-25-1.pdf",
      labels: nums(18), points: p18,
      answers: split("DCAEAB EEACBD BBCCAC"),
    },
    {
      id: "2025-56", year: 2025, level: "5/6",
      pdf: { de: U + "56_ch.pdf", en: U + "2025_56_eng.pdf" },
      solutions: U + "Loesungsbuchstaben-25-1.pdf",
      labels: nums(24), points: p24,
      answers: split("EBDAABBC BEDDBCDA CCBEDADB"),
    },
    // ---------- 2024 ----------
    {
      id: "2024-34", year: 2024, level: "3/4",
      pdf: { de: U + "34_ch_reduziert-24.pdf", en: U + "34_ch_eng_reduziert-24.pdf" },
      solutions: KS + "Loesungsbuchstaben-24.pdf",
      labels: nums(18), points: p18,
      answers: split("ADCACB BAAEED BEDBCA"),
    },
    {
      id: "2024-56", year: 2024, level: "5/6",
      pdf: { de: U + "56_ch-24.pdf", en: U + "56_ch_eng-24.pdf" },
      solutions: KS + "Loesungsbuchstaben-24.pdf",
      labels: nums(24), points: p24,
      answers: split("BCAEDBDC EABBDCEC DDCAEBED"),
    },
    // ---------- 2023 ----------
    {
      id: "2023-34", year: 2023, level: "3/4",
      pdf: { de: U + "Aufgabenblatt_34_deu-23.pdf", en: U + "Aufgabenblatt_34_eng-23.pdf" },
      solutions: U + "Loesungsbuchstaben-de-23.pdf",
      labels: nums(18), points: p18,
      answers: split("DECACB ACEBAE DBADEE"),
    },
    {
      id: "2023-56", year: 2023, level: "5/6",
      pdf: { de: U + "Aufgabenblatt_56_deu-23.pdf", en: U + "Aufgabenblatt_56_eng-23.pdf" },
      solutions: U + "Loesungsbuchstaben-de-23.pdf",
      labels: nums(24), points: p24,
      answers: split("ADCBABEB ECBCADEA AECDCBCD"),
    },
    // ---------- 2022 ----------
    {
      id: "2022-34", year: 2022, level: "3/4",
      pdf: { de: U + "34-22.pdf", en: U + "34_en-22.pdf" },
      solutions: U + "Loesungsbuchstaben-22.pdf",
      labels: abc8, points: p24,
      answers: split("ACDCEBED BBACADCC EDBAEBDD"),
    },
    {
      id: "2022-56", year: 2022, level: "5/6",
      pdf: { de: U + "56-22.pdf", en: U + "56_en-22.pdf" },
      solutions: U + "Loesungsbuchstaben-22.pdf",
      labels: abc8, points: p24,
      answers: split("EEDBCAEB BBCBDACA DBBEAECD"),
    },
  ];
})();
