import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: "AI Coach belum dikonfigurasi. Tambahkan ANTHROPIC_API_KEY ke environment variables." });
  }

  const systemPrompt = `Anda adalah AI Coach keuangan pribadi yang membantu pengguna mengelola keuangan mereka dengan lebih baik. Anda berbicara dalam Bahasa Indonesia, ramah, informatif, dan memberikan saran praktis.

${context}

Berikan saran yang spesifik, actionable, dan berdasarkan data keuangan pengguna. Jangan terlalu panjang, maksimal 3-4 paragraf per jawaban.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await res.json();
    const reply = data.content?.[0]?.text ?? "Maaf, tidak ada respons dari AI.";
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ reply: "Terjadi kesalahan saat menghubungi AI." }, { status: 500 });
  }
}
