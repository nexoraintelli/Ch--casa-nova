
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwRP3J7iQnHE9BOAN1b6Ixklx2H2A4bO2bnNOsjJGcMPg737aRz8pwlOCOqUFRQo5o/exec";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Método não permitido."
    });
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body || {};

    const nome = body.nome;
    const presenca = body.presenca;
    const pessoas = body.pessoas;

    if (
      typeof nome !== "string" ||
      nome.trim().length < 2 ||
      nome.trim().length > 80 ||
      !["sim", "nao"].includes(presenca) ||
      !Number.isInteger(pessoas) ||
      (presenca === "sim"
        ? pessoas < 1 || pessoas > 5
        : pessoas !== 0)
    ) {
      return res.status(400).json({
        ok: false,
        error: "Confira os dados da confirmação."
      });
    }

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "rsvp",
        nome: nome.trim(),
        presenca,
        pessoas
      })
    });

    if (!response.ok) {
      throw new Error(
        "O Google não conseguiu processar a resposta."
      );
    }

    const result = await response.json();

    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error ||
          "Não foi possível registrar sua presença."
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Presença registrada com sucesso!"
    });

  } catch (error) {
    console.error("Erro RSVP:", error);

    return res.status(500).json({
      ok: false,
      error:
        "Não foi possível registrar a presença. Tente novamente."
    });
  }
}

