# Job Expiration ⏰

Una API viral que te dice cuántos años quedan antes de que tu profesión sea reemplazada por IA.

## Quick Start

### Backend

```bash
cd backend
npm install
npm start
```

El servidor estará en `http://localhost:3001`

### Frontend

Abre `frontend/index.html` directamente en tu navegador:

```bash
open frontend/index.html
```

O con un servidor simple:

```bash
cd frontend
python3 -m http.server 8000
# Luego abre http://localhost:8000
```

## API Endpoints

### POST `/api/check-job`

Consulta cuándo será automatizada una profesión.

**Request:**
```json
{
  "profession": "abogado"
}
```

**Response:**
```json
{
  "profession": "abogado",
  "years_remaining": 5,
  "reason": "AI ya genera contratos básicos y analiza jurisprudencia",
  "examples": "ChatGPT Premium, LawGeex",
  "message": "Tu profesión tiene aproximadamente 5 años antes de ser automatizada."
}
```

### GET `/api/professions`

Lista todas las profesiones disponibles.

### GET `/api/health`

Health check del servidor.

## Cómo es viral

- ✅ Simple y directa: una pregunta, una respuesta impactante
- ✅ Compartible: botones para Twitter, WhatsApp, copiar enlace
- ✅ Personalizabile: cada usuario ve su propia profesión
- ✅ Provocativa: "¿Cuántos años quedan para tu trabajo?"

## Datos

Las profesiones y años estimados están en `backend/professions.json`. Puedes:

- Agregar nuevas profesiones
- Actualizar años según cambios en el mercado
- Agregar más ejemplos

## Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML + CSS + JavaScript vanilla
- **Datos**: JSON

## Deployment

Para producción:

1. Subir el backend a Vercel, Heroku o tu servidor preferido
2. Actualizar `API_URL` en `frontend/index.html` a la URL del servidor
3. Hosting del frontend en Netlify, GitHub Pages, etc.

## Ideas para expandir

- [ ] Integrar Claude API para respuestas más personalizadas
- [ ] Base de datos con más profesiones
- [ ] Gráficos que muestren tendencias
- [ ] Encuestas para validar predicciones
- [ ] Versión en otros idiomas
- [ ] Mobile app

Deja que sea viral primero 🚀
