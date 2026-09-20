import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3050;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:vfZlTfp1qCDnVlngOb4FDDJsNKqUgKJb@127.0.0.1:5432/postgres';

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', serverTime: result.rows[0].now, service: 'Eureka VPS API' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- AUTENTICACIÓN / USUARIOS ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  const userId = 'usr_' + Buffer.from(email).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16) + '_' + Date.now().toString(36);
  const cleanUsername = username || email.split('@')[0];
  const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUsername}`;

  try {
    const query = `
      INSERT INTO eureka_users (id, device_id, username, avatar_url, xp, level, streak_days, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 0, 1, 1, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, avatar_url = EXCLUDED.avatar_url, updated_at = NOW()
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, email, cleanUsername, avatarUrl]);
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  try {
    const result = await pool.query('SELECT * FROM eureka_users WHERE device_id = $1 LIMIT 1', [email.toLowerCase().trim()]);
    if (result.rows.length > 0) {
      res.json({ user: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// --- MAZOS (DECKS) ---
app.get('/api/decks', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  try {
    const result = await pool.query('SELECT * FROM eureka_decks WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/decks/sync', async (req, res) => {
  const { userId, decks } = req.body;
  if (!userId || !Array.isArray(decks)) return res.status(400).json({ error: 'Datos inválidos' });

  try {
    for (const d of decks) {
      const q = `
        INSERT INTO eureka_decks (id, user_id, parent_id, name, description, icon, is_folder, color, settings, is_archived, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          is_folder = EXCLUDED.is_folder,
          color = EXCLUDED.color,
          settings = EXCLUDED.settings,
          is_archived = EXCLUDED.is_archived,
          updated_at = EXCLUDED.updated_at;
      `;
      await pool.query(q, [
        d.id, userId, d.parent_id || null, d.name, d.description || '', d.icon || 'deck',
        Boolean(d.is_folder), d.color || '#10b981', JSON.stringify(d.settings || {}),
        Boolean(d.is_archived), d.created_at || Date.now(), d.updated_at || Date.now()
      ]);
    }
    res.json({ success: true, count: decks.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/decks/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    await pool.query('DELETE FROM eureka_decks WHERE id = $1 AND user_id = $2', [id, userId]);
    await pool.query('DELETE FROM eureka_flashcards WHERE deck_id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/decks/batch-delete', async (req, res) => {
  const { userId, deckIds } = req.body;
  if (!userId || !Array.isArray(deckIds) || deckIds.length === 0) return res.json({ success: true });
  try {
    await pool.query('DELETE FROM eureka_decks WHERE user_id = $1 AND id = ANY($2)', [userId, deckIds]);
    await pool.query('DELETE FROM eureka_flashcards WHERE user_id = $1 AND deck_id = ANY($2)', [userId, deckIds]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TARJETAS (FLASHCARDS) ---
app.get('/api/cards', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  try {
    const result = await pool.query('SELECT * FROM eureka_flashcards WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cards/sync', async (req, res) => {
  const { userId, cards } = req.body;
  if (!userId || !Array.isArray(cards)) return res.status(400).json({ error: 'Datos inválidos' });

  try {
    for (const c of cards) {
      const q = `
        INSERT INTO eureka_flashcards (
          id, deck_id, user_id, type, front, back, front_image, back_image,
          occlusion_image, occlusion_masks, active_mask_id, occlusion_mode,
          audio_lang, audio_text, is_inverted, group_id, group_title, group_role,
          state, step_index, interval_minutes, ease_factor, lapses, reps,
          due_date, last_review_date, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        ON CONFLICT (id) DO UPDATE SET
          front = EXCLUDED.front,
          back = EXCLUDED.back,
          front_image = EXCLUDED.front_image,
          back_image = EXCLUDED.back_image,
          occlusion_image = EXCLUDED.occlusion_image,
          occlusion_masks = EXCLUDED.occlusion_masks,
          state = EXCLUDED.state,
          step_index = EXCLUDED.step_index,
          interval_minutes = EXCLUDED.interval_minutes,
          ease_factor = EXCLUDED.ease_factor,
          lapses = EXCLUDED.lapses,
          reps = EXCLUDED.reps,
          due_date = EXCLUDED.due_date,
          last_review_date = EXCLUDED.last_review_date,
          updated_at = EXCLUDED.updated_at;
      `;
      await pool.query(q, [
        c.id, c.deck_id, userId, c.type || 'standard', c.front, c.back,
        c.front_image || null, c.back_image || null, c.occlusion_image || null,
        JSON.stringify(c.occlusion_masks || null), c.active_mask_id || null, c.occlusion_mode || null,
        c.audio_lang || null, c.audio_text || null, Boolean(c.is_inverted),
        c.group_id || null, c.group_title || null, c.group_role || null,
        c.state || 'new', c.step_index || 0, c.interval_minutes || 0, c.ease_factor || 2.5,
        c.lapses || 0, c.reps || 0, c.due_date || Date.now(), c.last_review_date || null,
        c.created_at || Date.now(), c.updated_at || Date.now()
      ]);
    }
    res.json({ success: true, count: cards.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    await pool.query('DELETE FROM eureka_flashcards WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cards/batch-delete', async (req, res) => {
  const { userId, cardIds } = req.body;
  if (!userId || !Array.isArray(cardIds) || cardIds.length === 0) return res.json({ success: true });
  try {
    await pool.query('DELETE FROM eureka_flashcards WHERE user_id = $1 AND id = ANY($2)', [userId, cardIds]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PERFIL DE USUARIO ---
app.post('/api/profile', async (req, res) => {
  const { id, username, avatarUrl, xp, level, streakDays } = req.body;
  if (!id) return res.status(400).json({ error: 'id requerido' });
  try {
    const q = `
      INSERT INTO eureka_users (id, username, avatar_url, xp, level, streak_days, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        avatar_url = EXCLUDED.avatar_url,
        xp = EXCLUDED.xp,
        level = EXCLUDED.level,
        streak_days = EXCLUDED.streak_days,
        updated_at = NOW();
    `;
    await pool.query(q, [id, username || 'Estudiante', avatarUrl || null, xp || 0, level || 1, streakDays || 1]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AJUSTES DE USUARIO ---
app.get('/api/settings', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  try {
    const result = await pool.query('SELECT settings FROM eureka_user_settings WHERE user_id = $1 LIMIT 1', [userId]);
    if (result.rows.length > 0) {
      res.json({ settings: result.rows[0].settings });
    } else {
      res.json({ settings: null });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const { userId, settings, updatedAt } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  try {
    const q = `
      INSERT INTO eureka_user_settings (user_id, settings, updated_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = EXCLUDED.updated_at;
    `;
    await pool.query(q, [userId, JSON.stringify(settings || {}), updatedAt || Date.now()]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REGISTRO DE REPASOS (STUDY LOGS) ---
app.post('/api/study-logs', async (req, res) => {
  const { id, user_id, card_id, deck_id, rating, review_duration_ms, reviewed_at } = req.body;
  try {
    const q = `
      INSERT INTO eureka_study_logs (id, user_id, card_id, deck_id, rating, review_duration_ms, reviewed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING;
    `;
    await pool.query(q, [id, user_id, card_id, deck_id, rating, review_duration_ms || 0, reviewed_at || Date.now()]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Eureka VPS API escuchando en http://0.0.0.0:${PORT}`);
  console.log(`📦 Conectado a PostgreSQL en: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
});
