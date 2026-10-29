
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwRP3J7iQnHE9BOAN1b6Ixklx2H2A4bO2bnNOsjJGcMPg737aRz8pwlOCOqUFRQo5o/exec";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Método não permitido"
    });
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "GET",
      redirect: "follow",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Erro ao consultar a planilha");
    }

    const data = await response.json();

    if (!data.ok || !Array.isArray(data.items)) {
      throw new Error("Resposta inválida da planilha");
    }

    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      ok: true,
      items: data.items
    });

  } catch (error) {
    console.error("Erro ao carregar presentes:", error);

    return res.status(500).json({
      ok: false,
      error: "Não foi possível carregar os presentes."
    });
  }
}
