require("dotenv").config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const professions = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'professions.json'), 'utf-8')
).professions;

const normalize = (text) => text.toLowerCase().trim().replace(/\s+/g, ' ');

const analysisCache = new Map();
const MIN_CACHE_CHARS = 150;

app.post('/api/check-job', (req, res) => {
  const { profession } = req.body;

  if (!profession || profession.trim() === '') {
    return res.status(400).json({ error: 'Profesión requerida' });
  }

  const normalizedInput = normalize(profession);

  // Búsqueda exacta
  let result = professions.find(
    p => normalize(p.name) === normalizedInput
  );

  // Búsqueda parcial si no hay match exacto
  if (!result) {
    result = professions.find(
      p => normalize(p.name).includes(normalizedInput) ||
           normalizedInput.includes(normalize(p.name))
    );
  }

  if (result) {
    return res.json({
      profession: result.name,
      years_remaining: result.years_remaining,
      reason: result.reason,
      examples: result.examples,
      message: `Tu profesión tiene aproximadamente ${result.years_remaining} año${result.years_remaining !== 1 ? 's' : ''} antes de ser automatizada.`
    });
  }

  res.status(404).json({
    error: 'Profesión no encontrada',
    message: 'Intenta con otra profesión o búsqueda similar',
    suggestions: professions.slice(0, 5).map(p => p.name)
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', jobs_available: professions.length });
});

// Get all professions (para populate autocomplete)
app.get('/api/professions', (req, res) => {
  res.json({ professions: professions.map(p => ({ name: p.name, years: p.years_remaining })) });
});

app.post('/api/analyze', async (req, res) => {
  const { profesion } = req.body;
  if (!profesion || profesion.trim() === '') {
    return res.status(400).json({ error: 'Profesión requerida' });
  }

  const key = normalize(profesion);

  if (analysisCache.has(key)) {
    return res.json(analysisCache.get(key));
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: 'Eres un analista brutal y honesto sobre el futuro del trabajo. Da estimaciones DURAS y REALES, no reconfortes. La mayoria de profesiones tienen menos de 10 anos. Conductores 5 anos, contables 3 anos, cajeros 2 anos. Responde SOLO JSON sin markdown: profesion (string), años_restantes (numero 1-15), riesgo_porcentaje (numero 50-95), nivel_riesgo (alto/medio/bajo), resumen (2-3 frases duras sobre el peligro real), tareas_en_riesgo (array 5-7 strings), tareas_seguras (array 2-3 strings maximo), consejo (string urgente y directo)',
        messages: [{ role: 'user', content: profesion }]
      })
    });
    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    const result = JSON.parse(text.replace(/```json|```/g, '').trim());

    if (JSON.stringify(result).length >= MIN_CACHE_CHARS) {
      analysisCache.set(key, result);
    }

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Error al consultar Claude', detail: e.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Job Expiration API corriendo en http://localhost:${PORT}`);
    console.log(`📊 ${professions.length} profesiones disponibles`);
  });
}

module.exports = app;
