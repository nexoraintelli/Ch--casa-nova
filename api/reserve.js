
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwRP3J7iQnHE9BOAN1b6Ixklx2H2A4bO2bnNOsjJGcMPg737aRz8pwlOCOqUFRQo5o/exec";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Método não permitido"
    });
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const items = body?.items;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 20 ||
      items.some(
        item =>
          typeof item !== "string" ||
          item.length > 150
      ) ||
      new Set(items).size !== items.length
    ) {
      return res.status(400).json({
        ok: false,
        error: "Seleção de presentes inválida."
      });
    }

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "reserve",
        items
      })
    });

    if (!response.ok) {
      throw new Error("Erro ao registrar a seleção.");
    }

    const data = await response.json();

    if (!data.ok) {
      return res.status(409).json({
        ok: false,
        error: data.error ||
          "Um dos presentes já foi selecionado."
      });
    }

    if (!Array.isArray(data.items)) {
      throw new Error("Resposta inválida do servidor.");
    }

    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      ok: true,
      items: data.items
    });

  } catch (error) {
    console.error("Erro ao reservar:", error);

    return res.status(500).json({
      ok: false,
      error: "Não foi possível confirmar a seleção."
    });
  }
}
