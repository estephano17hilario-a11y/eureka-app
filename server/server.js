import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3050;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://eureka@127.0.0.1:5434/eureka';

// --- GESTOR DE ALMACENAMIENTO PERSISTENTE RESILIENTE (FALLBACK LOCAL) ---
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'eureka_store.json');

class ResilientStore {
  constructor() {
    this.data = {
      users: [],
      decks: [],
      cards: [],
      settings: {},
      study_logs: []
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        try {
          this.data = { ...this.data, ...JSON.parse(raw) };
        } catch (parseErr) {
          // Nunca perder un JSON ilegible: se conserva una copia antes de seguir
          const corrupt = path.join(DATA_DIR, `eureka_store.corrupt-${Date.now()}.json`);
          fs.copyFileSync(STORE_FILE, corrupt);
          console.warn('[ResilientStore] JSON ilegible, copia conservada en', corrupt);
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('[ResilientStore] Error al inicializar almacenamiento local:', err.message);
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      // Escritura atómica: temporal + rename, para no dejar el archivo a medias si el proceso muere
      const tmp = STORE_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmp, STORE_FILE);
    } catch (err) {
      console.warn('[ResilientStore] Error al guardar datos locales:', err.message);
    }
  }

  findUser(term) {
    const clean = (term || '').toLowerCase().trim();
    return this.data.users.find(u => 
      u.id === clean || 
      (u.device_id && u.device_id.toLowerCase() === clean) || 
      (u.username && u.username.toLowerCase() === clean)
    ) || null;
  }

  upsertUser(user) {
    const idx = this.data.users.findIndex(u => u.id === user.id || (u.device_id && u.device_id.toLowerCase() === (user.device_id || '').toLowerCase()));
    const now = new Date().toISOString();
    const cleanUser = {
      id: user.id,
      device_id: user.device_id || user.email || user.id,
      username: user.username || 'Estudiante',
      avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(user.username || 'User')}`,
      xp: Number(user.xp) || 0,
      level: Number(user.level) || 1,
      streak_days: Number(user.streak_days) || 1,
      created_at: user.created_at || now,
      updated_at: now
    };

    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...cleanUser, updated_at: now };
    } else {
      this.data.users.push(cleanUser);
    }
    this.save();
    return cleanUser;
  }

  getAccounts() {
    return this.data.users.map(u => {
      const deckCount = this.data.decks.filter(d => d.user_id === u.id && !d.is_archived).length;
      return {
        id: u.id,
        email: u.device_id,
        username: u.username,
        avatar_url: u.avatar_url,
        xp: u.xp,
        level: u.level,
        streak_days: u.streak_days,
        updated_at: u.updated_at,
        deck_count: deckCount
      };
    }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  getDecks(userId) {
    return this.data.decks
      .filter(d => d.user_id === userId)
      .sort((a, b) => Number(b.updated_at || 0) - Number(a.updated_at || 0));
  }

  syncDecks(userId, incomingDecks) {
    for (const d of incomingDecks) {
      const idx = this.data.decks.findIndex(x => x.id === d.id && x.user_id === userId);
      const item = {
        id: d.id,
        user_id: userId,
        parent_id: d.parent_id || null,
        name: d.name,
        description: d.description || '',
        icon: d.icon || 'deck',
        is_folder: Boolean(d.is_folder),
        color: d.color || '#10b981',
        settings: d.settings || {},
        is_archived: Boolean(d.is_archived),
        created_at: Number(d.created_at) || Date.now(),
        updated_at: Number(d.updated_at) || Date.now()
      };
      if (idx >= 0) {
        this.data.decks[idx] = item;
      } else {
        this.data.decks.push(item);
      }
    }
    this.save();
  }

  deleteDeck(userId, deckId) {
    this.data.decks = this.data.decks.filter(d => !(d.user_id === userId && d.id === deckId));
    this.data.cards = this.data.cards.filter(c => !(c.user_id === userId && c.deck_id === deckId));
    this.save();
  }

  deleteDecks(userId, deckIds) {
    const set = new Set(deckIds);
    this.data.decks = this.data.decks.filter(d => !(d.user_id === userId && set.has(d.id)));
    this.data.cards = this.data.cards.filter(c => !(c.user_id === userId && set.has(c.deck_id)));
    this.save();
  }

  getCards(userId) {
    return this.data.cards.filter(c => c.user_id === userId);
  }

  syncCards(userId, incomingCards) {
    for (const c of incomingCards) {
      // Asegurar que el deck exista
      if (c.deck_id && !this.data.decks.some(d => d.id === c.deck_id)) {
        this.data.decks.push({
          id: c.deck_id,
          user_id: userId,
          parent_id: null,
          name: 'Mazo de Estudio',
          description: '',
          icon: 'deck',
          is_folder: false,
          color: '#10b981',
          settings: {},
          is_archived: false,
          created_at: Date.now(),
          updated_at: Date.now()
        });
      }

      const idx = this.data.cards.findIndex(x => x.id === c.id && x.user_id === userId);
      const item = {
        id: c.id,
        deck_id: c.deck_id,
        user_id: userId,
        type: c.type || 'standard',
        front: c.front,
        back: c.back,
        front_image: c.front_image || null,
        back_image: c.back_image || null,
        occlusion_image: c.occlusion_image || null,
        occlusion_masks: c.occlusion_masks || null,
        active_mask_id: c.active_mask_id || null,
        occlusion_mode: c.occlusion_mode || null,
        audio_lang: c.audio_lang || null,
        audio_text: c.audio_text || null,
        is_inverted: Boolean(c.is_inverted),
        group_id: c.group_id || null,
        group_title: c.group_title || null,
        group_role: c.group_role || null,
        state: c.state || 'new',
        step_index: c.step_index || 0,
        interval_minutes: c.interval_minutes || 0,
        ease_factor: c.ease_factor || 2.5,
        lapses: c.lapses || 0,
        reps: c.reps || 0,
        due_date: Number(c.due_date) || Date.now(),
        last_review_date: c.last_review_date ? Number(c.last_review_date) : null,
        created_at: Number(c.created_at) || Date.now(),
        updated_at: Number(c.updated_at) || Date.now()
      };

      if (idx >= 0) {
        this.data.cards[idx] = item;
      } else {
        this.data.cards.push(item);
      }
    }
    this.save();
  }

  deleteCard(userId, cardId) {
    this.data.cards = this.data.cards.filter(c => !(c.user_id === userId && c.id === cardId));
    this.save();
  }

  deleteCards(userId, cardIds) {
    const set = new Set(cardIds);
    this.data.cards = this.data.cards.filter(c => !(c.user_id === userId && set.has(c.id)));
    this.save();
  }

  getSettings(userId) {
    return this.data.settings[userId] || null;
  }

  hydrateSettings(userId, value) {
    this.data.settings[userId] = value;
  }

  saveSettings(userId, settings) {
    const existing = this.data.settings[userId] || {};
    const merged = {
      ...existing,
      ...settings,
      settingsJson: {
        ...(existing.settingsJson || {}),
        ...(settings.settingsJson || {})
      }
    };
    this.data.settings[userId] = merged;
    this.save();
    return merged;
  }

  saveStudyLog(log) {
    this.data.study_logs.push({
      id: log.id,
      user_id: log.user_id,
      card_id: log.card_id,
      deck_id: log.deck_id,
      rating: log.rating,
      time_spent_ms: log.time_spent_ms || 0,
      reviewed_at: log.reviewed_at || new Date().toISOString()
    });
    if (this.data.study_logs.length > 5000) {
      this.data.study_logs = this.data.study_logs.slice(-5000);
    }
    this.save();
  }

  getVersion(userId) {
    const userDecks = this.data.decks.filter(d => d.user_id === userId);
    const userCards = this.data.cards.filter(c => c.user_id === userId);
    const userSettings = this.data.settings[userId];

    const maxDecks = userDecks.length ? Math.max(...userDecks.map(d => Number(d.updated_at) || 0)) : 0;
    const maxCards = userCards.length ? Math.max(...userCards.map(c => Number(c.updated_at) || 0)) : 0;
    const maxSettings = userSettings ? (userSettings.updated_at || Date.now()) : 0;

    return {
      decksUpdatedAt: maxDecks,
      cardsUpdatedAt: maxCards,
      settingsUpdatedAt: typeof maxSettings === 'number' ? maxSettings : new Date(maxSettings).getTime()
    };
  }
}

const store = new ResilientStore();

// --- POOL POSTGRESQL CON MANEJO DE ERRORES RESILIENTE ---
const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000
});

let isPgHealthy = false;
let reconciling = false;
let lastReconcile = null;

pool.on('error', (err) => {
  isPgHealthy = false;
  console.warn('[PostgreSQL Pool Warning]:', err.message);
});

const CONN_ERROR_CODES = new Set([
  'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ENOTFOUND',
  '57P01', '57P02', '57P03', '08000', '08001', '08003', '08004', '08006'
]);

// Solo un fallo de conexión marca PostgreSQL como caído. Un error de fila (tipo, constraint...) no debe
// abortar el resto ni desviar las lecturas al almacenamiento local.
function isConnError(err) {
  if (!err) return false;
  if (CONN_ERROR_CODES.has(err.code)) return true;
  return /terminated unexpectedly|Connection terminated|timeout exceeded when trying to connect|ECONNREFUSED/i.test(err.message || '');
}

function pgFail(err) {
  if (isConnError(err)) {
    isPgHealthy = false;
  } else if (err) {
    console.warn('[PostgreSQL Query Warning]:', err.message);
  }
}

// Ejecuta fn por fila; una fila defectuosa se omite y se registra, una caída de conexión se propaga.
async function pgEachRow(items, fn, label) {
  const failedIds = [];
  for (const item of items) {
    try {
      await fn(item);
    } catch (err) {
      if (isConnError(err)) throw err;
      failedIds.push(item && item.id);
      console.warn(`[${label}] fila omitida (${item && item.id}):`, err.message);
    }
  }
  return failedIds;
}

// Mazos y tarjetas se identifican por (user_id, id): cada cuenta tiene su propio espacio de IDs, asi los mazos
// de demostracion (IDs fijos) de un invitado nunca chocan con los de otra cuenta.
// onlyIfNewer se usa al reconciliar el JSON local: nunca pisa algo mas nuevo.
function deckUpsertSql(onlyIfNewer) {
  return `
    INSERT INTO eureka_decks (id, user_id, parent_id, name, description, icon, is_folder, color, settings, is_archived, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12)
    ON CONFLICT (user_id, id) DO UPDATE SET
      parent_id = EXCLUDED.parent_id,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      is_folder = EXCLUDED.is_folder,
      color = EXCLUDED.color,
      settings = EXCLUDED.settings,
      is_archived = EXCLUDED.is_archived,
      updated_at = EXCLUDED.updated_at
    ${onlyIfNewer ? 'WHERE EXCLUDED.updated_at > COALESCE(eureka_decks.updated_at, 0)' : ''};
  `;
}

function deckParams(userId, d) {
  return [
    d.id, userId, d.parent_id || null, d.name, d.description || '', d.icon || 'deck',
    Boolean(d.is_folder), d.color || '#10b981', JSON.stringify(d.settings || {}),
    Boolean(d.is_archived), Number(d.created_at) || Date.now(), Number(d.updated_at) || Date.now()
  ];
}

function cardUpsertSql(onlyIfNewer) {
  return `
    INSERT INTO eureka_flashcards (
      id, deck_id, user_id, type, front, back, front_image, back_image,
      occlusion_image, occlusion_masks, active_mask_id, occlusion_mode,
      audio_lang, audio_text, is_inverted, group_id, group_title, group_role,
      state, step_index, interval_minutes, ease_factor, lapses, reps,
      due_date, last_review_date, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
    ON CONFLICT (user_id, id) DO UPDATE SET
      deck_id = EXCLUDED.deck_id,
      type = EXCLUDED.type,
      front = EXCLUDED.front,
      back = EXCLUDED.back,
      front_image = EXCLUDED.front_image,
      back_image = EXCLUDED.back_image,
      occlusion_image = EXCLUDED.occlusion_image,
      occlusion_masks = EXCLUDED.occlusion_masks,
      active_mask_id = EXCLUDED.active_mask_id,
      occlusion_mode = EXCLUDED.occlusion_mode,
      audio_lang = EXCLUDED.audio_lang,
      audio_text = EXCLUDED.audio_text,
      is_inverted = EXCLUDED.is_inverted,
      group_id = EXCLUDED.group_id,
      group_title = EXCLUDED.group_title,
      group_role = EXCLUDED.group_role,
      state = EXCLUDED.state,
      step_index = EXCLUDED.step_index,
      interval_minutes = EXCLUDED.interval_minutes,
      ease_factor = EXCLUDED.ease_factor,
      lapses = EXCLUDED.lapses,
      reps = EXCLUDED.reps,
      due_date = EXCLUDED.due_date,
      last_review_date = EXCLUDED.last_review_date,
      updated_at = EXCLUDED.updated_at
    ${onlyIfNewer ? 'WHERE EXCLUDED.updated_at > COALESCE(eureka_flashcards.updated_at, 0)' : ''};
  `;
}

function cardParams(userId, c) {
  return [
    c.id, c.deck_id, userId, c.type || 'standard', c.front, c.back,
    c.front_image || null, c.back_image || null, c.occlusion_image || null,
    JSON.stringify(c.occlusion_masks || null), c.active_mask_id || null, c.occlusion_mode || null,
    c.audio_lang || null, c.audio_text || null, Boolean(c.is_inverted),
    c.group_id || null, c.group_title || null, c.group_role || null,
    c.state || 'new', c.step_index || 0, c.interval_minutes || 0, c.ease_factor || 2.5,
    c.lapses || 0, c.reps || 0, Number(c.due_date) || Date.now(), c.last_review_date ? Number(c.last_review_date) : null,
    Number(c.created_at) || Date.now(), Number(c.updated_at) || Date.now()
  ];
}

async function ensurePlaceholderDeck(deckId, userId) {
  await pool.query(`
    INSERT INTO eureka_decks (id, user_id, name, created_at, updated_at)
    VALUES ($1, $2, 'Mazo de Estudio', $3, $4)
    ON CONFLICT (user_id, id) DO NOTHING;
  `, [deckId, userId, Date.now(), Date.now()]);
}

// Devuelve a PostgreSQL todo lo que quedo solo en el JSON local (caidas de conexion, cuentas creadas en
// fallback...). Nunca pisa datos mas nuevos ni de otro usuario, nunca borra, y es idempotente.
async function reconcileStoreToPg() {
  if (reconciling || !isPgHealthy) return;
  reconciling = true;
  const sum = { users: 0, decks: 0, cards: 0, settings: 0, logs: 0, failed: 0 };
  try {
    const d = store.data;

    sum.failed += (await pgEachRow(d.users, async (u) => {
      const r = await pool.query(`
        INSERT INTO eureka_users (id, device_id, username, avatar_url, xp, level, streak_days, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, NOW()), COALESCE($9::timestamptz, NOW()))
        ON CONFLICT DO NOTHING;
      `, [u.id, u.device_id || null, u.username || 'Estudiante', u.avatar_url || null, u.xp || 0, u.level || 1, u.streak_days || 1, u.created_at || null, u.updated_at || null]);
      sum.users += r.rowCount;
    }, 'Reconcile users')).length;

    sum.failed += (await pgEachRow(d.decks, async (x) => {
      const r = await pool.query(deckUpsertSql(true), deckParams(x.user_id, x));
      sum.decks += r.rowCount;
    }, 'Reconcile decks')).length;

    sum.failed += (await pgEachRow(d.cards, async (x) => {
      if (x.deck_id) await ensurePlaceholderDeck(x.deck_id, x.user_id);
      const r = await pool.query(cardUpsertSql(true), cardParams(x.user_id, x));
      sum.cards += r.rowCount;
    }, 'Reconcile cards')).length;

    sum.failed += (await pgEachRow(Object.entries(d.settings || {}).map(([id, v]) => ({ id, v })), async ({ id, v }) => {
      const r = await pool.query(`
        INSERT INTO eureka_user_settings (user_id, settings_json, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (user_id) DO NOTHING;
      `, [id, JSON.stringify(v)]);
      sum.settings += r.rowCount;
    }, 'Reconcile settings')).length;

    sum.failed += (await pgEachRow(d.study_logs || [], async (l) => {
      const r = await pool.query(`
        INSERT INTO eureka_study_logs (id, user_id, deck_id, card_id, rating, time_spent_ms, reviewed_at)
        VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, NOW()))
        ON CONFLICT (id) DO NOTHING;
      `, [l.id, l.user_id, l.deck_id || null, l.card_id || null, l.rating || null, l.time_spent_ms || 0, l.reviewed_at || null]);
      sum.logs += r.rowCount;
    }, 'Reconcile logs')).length;

    lastReconcile = { at: new Date().toISOString(), ...sum };
    console.log('🔁 Reconciliación JSON → PostgreSQL:', JSON.stringify(sum));
  } catch (err) {
    pgFail(err);
    console.warn('[Reconcile] interrumpida:', err.message);
  } finally {
    reconciling = false;
  }
}

// Comprobación de salud en segundo plano para PostgreSQL
async function checkPgHealth() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    if (!isPgHealthy) {
      console.log('✅ Conexión con PostgreSQL restablecida y operativa.');
      isPgHealthy = true;
      reconcileStoreToPg();
    }
  } catch (err) {
    if (isPgHealthy) {
      console.warn('⚠️ Conexión con PostgreSQL interrumpida (' + err.message + '). Activando fallback local resiliente.');
    }
    isPgHealthy = false;
  }
}

// Iniciar comprobación periódica cada 15 segundos
checkPgHealth();
setInterval(checkPgHealth, 15000);
// Red de seguridad: reconciliar cada 30 min por si algo quedo solo en el JSON
setInterval(reconcileStoreToPg, 30 * 60 * 1000);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// Helper de consulta que no rompe ni tira 500 al cliente si PostgreSQL falla
async function tryPgQuery(sql, params) {
  if (!isPgHealthy) return null;
  try {
    return await pool.query(sql, params);
  } catch (err) {
    pgFail(err);
    console.warn('[tryPgQuery Warning]: ' + err.message + '. Derivando a ResilientStore.');
    return null;
  }
}

// --- HEALTH CHECK ---
app.get('/health', async (req, res) => {
  let dbStatus = 'resilient_storage';
  let serverTime = new Date().toISOString();

  if (isPgHealthy) {
    try {
      const result = await pool.query('SELECT NOW()');
      dbStatus = 'postgresql';
      serverTime = result.rows[0].now;
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    serverTime,
    service: 'Eureka VPS API',
    uptime: process.uptime(),
    lastReconcile
  });
});

// --- AUTENTICACIÓN / USUARIOS ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password: _password, username } = req.body;
  const term = (email || username || '').toLowerCase().trim();
  if (!term) return res.status(400).json({ error: 'Email o nombre requerido' });

  const cleanUsername = username?.trim() || (email ? email.split('@')[0] : term);
  const cleanEmail = email?.toLowerCase().trim() || term;
  const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(cleanUsername)}`;
  const userId = 'usr_' + Buffer.from(cleanEmail).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

  // Intentar con PostgreSQL
  if (isPgHealthy) {
    try {
      const existing = await pool.query(
        'SELECT * FROM eureka_users WHERE LOWER(device_id) = $1 OR LOWER(username) = $2 OR id = $3 LIMIT 1',
        [cleanEmail, cleanUsername.toLowerCase(), userId]
      );

      if (existing.rows.length > 0) {
        const user = existing.rows[0];
        const updated = await pool.query(`
          UPDATE eureka_users 
          SET username = $1, avatar_url = $2, updated_at = NOW() 
          WHERE id = $3 
          RETURNING *;
        `, [cleanUsername, avatarUrl, user.id]);
        store.upsertUser(updated.rows[0]);
        return res.json({ user: updated.rows[0] });
      }

      const query = `
        INSERT INTO eureka_users (id, device_id, username, avatar_url, xp, level, streak_days, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 0, 1, 1, NOW(), NOW())
        RETURNING *;
      `;
      const result = await pool.query(query, [userId, cleanEmail, cleanUsername, avatarUrl]);
      store.upsertUser(result.rows[0]);
      return res.json({ user: result.rows[0] });
    } catch (err) {
      pgFail(err);
      console.warn('[Register PG Error, using store]:', err.message);
    }
  }

  // Fallback Resiliente en Almacenamiento Local
  const localUser = store.upsertUser({
    id: userId,
    device_id: cleanEmail,
    username: cleanUsername,
    avatar_url: avatarUrl,
    xp: 0,
    level: 1,
    streak_days: 1
  });
  return res.json({ user: localUser });
});

app.get('/api/auth/primary-account', async (req, res) => {
  if (isPgHealthy) {
    try {
      const result = await pool.query('SELECT * FROM eureka_users ORDER BY updated_at DESC LIMIT 1');
      if (result.rows.length > 0) {
        return res.json({ user: result.rows[0] });
      }
    } catch (err) {
      pgFail(err);
    }
  }

  const accounts = store.getAccounts();
  res.json({ user: accounts.length > 0 ? accounts[0] : null });
});

app.get('/api/auth/accounts', async (req, res) => {
  if (isPgHealthy) {
    try {
      const result = await pool.query(`
        SELECT 
          u.id, 
          u.device_id as email, 
          u.username, 
          u.avatar_url, 
          u.xp, 
          u.level, 
          u.streak_days, 
          u.updated_at,
          COALESCE(d.deck_count, 0)::int as deck_count
        FROM eureka_users u
        LEFT JOIN (
          SELECT user_id, COUNT(*) as deck_count 
          FROM eureka_decks 
          WHERE is_archived = false 
          GROUP BY user_id
        ) d ON d.user_id = u.id
        ORDER BY u.updated_at DESC;
      `);
      return res.json({ accounts: result.rows });
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({ accounts: store.getAccounts() });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, username } = req.body;
  const term = (email || username || '').toLowerCase().trim();
  if (!term) return res.status(400).json({ error: 'Email o nombre de usuario requerido' });

  if (isPgHealthy) {
    try {
      const result = await pool.query(
        'SELECT * FROM eureka_users WHERE LOWER(device_id) = $1 OR LOWER(username) = $1 OR id = $1 LIMIT 1',
        [term]
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        await pool.query('UPDATE eureka_users SET updated_at = NOW() WHERE id = $1', [user.id]).catch(() => {});
        store.upsertUser(user);
        return res.json({ user });
      }

      // No existe: se crea directamente en PostgreSQL para que la cuenta no quede solo en el JSON local
      const newName = term.includes('@') ? term.split('@')[0] : term;
      const newId = 'usr_' + Buffer.from(term).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      await pool.query(`
        INSERT INTO eureka_users (id, device_id, username, avatar_url, xp, level, streak_days, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 0, 1, 1, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `, [newId, term, newName, `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(newName)}`]);
      const created = await pool.query('SELECT * FROM eureka_users WHERE id = $1 OR LOWER(device_id) = $2 LIMIT 1', [newId, term]);
      if (created.rows.length > 0) {
        store.upsertUser(created.rows[0]);
        return res.json({ user: created.rows[0] });
      }
    } catch (err) {
      pgFail(err);
    }
  }

  // Fallback Resiliente
  let user = store.findUser(term);
  if (!user) {
    // Si no existe, crear la cuenta para garantizar acceso inmediato sin bloqueos
    const cleanUsername = term.includes('@') ? term.split('@')[0] : term;
    const userId = 'usr_' + Buffer.from(term).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    user = store.upsertUser({
      id: userId,
      device_id: term,
      username: cleanUsername,
      avatar_url: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(cleanUsername)}`,
      xp: 0,
      level: 1,
      streak_days: 1
    });
  }

  res.json({ user });
});

app.get('/api/sync/version', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  if (isPgHealthy) {
    try {
      const [decksRes, cardsRes, settingsRes] = await Promise.all([
        pool.query('SELECT MAX(updated_at) as max_decks FROM eureka_decks WHERE user_id = $1', [userId]),
        pool.query('SELECT MAX(updated_at) as max_cards FROM eureka_flashcards WHERE user_id = $1', [userId]),
        pool.query('SELECT updated_at as max_settings FROM eureka_user_settings WHERE user_id = $1 LIMIT 1', [userId])
      ]);
      return res.json({
        decksUpdatedAt: Number(decksRes.rows[0]?.max_decks) || 0,
        cardsUpdatedAt: Number(cardsRes.rows[0]?.max_cards) || 0,
        settingsUpdatedAt: settingsRes.rows[0]?.max_settings ? new Date(settingsRes.rows[0].max_settings).getTime() : 0
      });
    } catch (err) {
      pgFail(err);
    }
  }

  res.json(store.getVersion(userId));
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// --- MAZOS (DECKS) ---
app.get('/api/decks', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  if (isPgHealthy) {
    try {
      const result = await pool.query('SELECT * FROM eureka_decks WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
      return res.json(result.rows);
    } catch (err) {
      pgFail(err);
    }
  }

  res.json(store.getDecks(userId));
});

app.post('/api/decks/sync', async (req, res) => {
  const { userId, decks } = req.body;
  if (!userId || !Array.isArray(decks)) return res.status(400).json({ error: 'Datos inválidos' });

  // Guardar siempre en store local resiliente
  store.syncDecks(userId, decks);

  let failedIds = [];
  if (isPgHealthy) {
    try {
      failedIds = await pgEachRow(decks, (d) => pool.query(deckUpsertSql(false), deckParams(userId, d)), 'Decks Sync');
    } catch (err) {
      pgFail(err);
      console.warn('[Decks Sync PG Warning]:', err.message);
    }
  }

  res.json({ success: true, count: decks.length, failed: failedIds.length, failedIds });
});

app.delete('/api/decks/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  store.deleteDeck(userId, id);

  if (isPgHealthy) {
    try {
      await pool.query('DELETE FROM eureka_decks WHERE id = $1 AND user_id = $2', [id, userId]);
      await pool.query('DELETE FROM eureka_flashcards WHERE deck_id = $1 AND user_id = $2', [id, userId]);
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({ success: true });
});

app.post('/api/decks/batch-delete', async (req, res) => {
  const { userId, deckIds } = req.body;
  if (!userId || !Array.isArray(deckIds) || deckIds.length === 0) return res.json({ success: true });

  store.deleteDecks(userId, deckIds);

  if (isPgHealthy) {
    try {
      await pool.query('DELETE FROM eureka_decks WHERE user_id = $1 AND id = ANY($2)', [userId, deckIds]);
      await pool.query('DELETE FROM eureka_flashcards WHERE user_id = $1 AND deck_id = ANY($2)', [userId, deckIds]);
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({ success: true });
});

// --- TARJETAS (FLASHCARDS) ---
app.get('/api/cards', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  if (isPgHealthy) {
    try {
      const result = await pool.query('SELECT * FROM eureka_flashcards WHERE user_id = $1', [userId]);
      return res.json(result.rows);
    } catch (err) {
      pgFail(err);
    }
  }

  res.json(store.getCards(userId));
});

app.post('/api/cards/sync', async (req, res) => {
  const { userId, cards } = req.body;
  if (!userId || !Array.isArray(cards)) return res.status(400).json({ error: 'Datos inválidos' });

  store.syncCards(userId, cards);

  let failedIds = [];
  if (isPgHealthy) {
    try {
      failedIds = await pgEachRow(cards, async (c) => {
        if (c.deck_id) await ensurePlaceholderDeck(c.deck_id, userId);
        await pool.query(cardUpsertSql(false), cardParams(userId, c));
      }, 'Cards Sync');
    } catch (err) {
      pgFail(err);
      console.warn('[Cards Sync PG Warning]:', err.message);
    }
  }

  res.json({ success: true, count: cards.length, failed: failedIds.length, failedIds });
});

app.delete('/api/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  store.deleteCard(userId, id);

  if (isPgHealthy) {
    try {
      await pool.query('DELETE FROM eureka_flashcards WHERE id = $1 AND user_id = $2', [id, userId]);
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({ success: true });
});

app.post('/api/cards/batch-delete', async (req, res) => {
  const { userId, cardIds } = req.body;
  if (!userId || !Array.isArray(cardIds) || cardIds.length === 0) return res.json({ success: true });

  store.deleteCards(userId, cardIds);

  if (isPgHealthy) {
    try {
      await pool.query('DELETE FROM eureka_flashcards WHERE user_id = $1 AND id = ANY($2)', [userId, cardIds]);
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({ success: true });
});

// --- PERFIL DE USUARIO ---
app.post('/api/profile', async (req, res) => {
  const { id, username, avatarUrl, xp, level, streakDays } = req.body;
  if (!id) return res.status(400).json({ error: 'id requerido' });

  store.upsertUser({
    id,
    username,
    avatar_url: avatarUrl,
    xp,
    level,
    streak_days: streakDays
  });

  if (isPgHealthy) {
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
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({ success: true });
});

// --- AJUSTES Y CUADERNOS DE USUARIO ---
app.get('/api/settings', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  if (isPgHealthy) {
    try {
      const result = await pool.query('SELECT settings_json FROM eureka_user_settings WHERE user_id = $1 LIMIT 1', [userId]);
      if (result.rows.length > 0 && result.rows[0].settings_json) {
        return res.json({ settings: result.rows[0].settings_json });
      }
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({ settings: store.getSettings(userId) });
});

app.post('/api/settings', async (req, res) => {
  const { userId, settings } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  // El JSON local puede ir por detras de PostgreSQL (p. ej. tras migrar): se fusiona SIEMPRE sobre lo que ya hay en PG
  if (isPgHealthy) {
    try {
      const cur = await pool.query('SELECT settings_json FROM eureka_user_settings WHERE user_id = $1 LIMIT 1', [userId]);
      if (cur.rows.length > 0 && cur.rows[0].settings_json) store.hydrateSettings(userId, cur.rows[0].settings_json);
    } catch (err) {
      pgFail(err);
    }
  }

  const merged = store.saveSettings(userId, settings || {});

  if (isPgHealthy) {
    try {
      const q = `
        INSERT INTO eureka_user_settings (user_id, settings_json, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          settings_json = EXCLUDED.settings_json,
          updated_at = NOW();
      `;
      await pool.query(q, [userId, JSON.stringify(merged)]);
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({ success: true, settings: merged });
});

// --- DATOS AJENOS ---
// El cliente pregunta cuales de sus ids sin confirmar pertenecen en realidad a OTRA cuenta (copias que una
// version anterior pudo arrastrar al cambiar de cuenta). Solo devuelve ids, nunca contenido.
app.post('/api/ids/foreign', async (req, res) => {
  const { userId, deckIds, cardIds } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId requerido' });
  const decks = Array.isArray(deckIds) ? deckIds.slice(0, 20000) : [];
  const cards = Array.isArray(cardIds) ? cardIds.slice(0, 50000) : [];

  if (isPgHealthy) {
    try {
      const d = decks.length
        ? await pool.query(`
            SELECT DISTINCT o.id FROM eureka_decks o
            WHERE o.id = ANY($2) AND o.user_id <> $1
              AND NOT EXISTS (SELECT 1 FROM eureka_decks m WHERE m.id = o.id AND m.user_id = $1)`, [userId, decks])
        : { rows: [] };
      const c = cards.length
        ? await pool.query(`
            SELECT DISTINCT o.id FROM eureka_flashcards o
            WHERE o.id = ANY($2) AND o.user_id <> $1
              AND NOT EXISTS (SELECT 1 FROM eureka_flashcards m WHERE m.id = o.id AND m.user_id = $1)`, [userId, cards])
        : { rows: [] };
      return res.json({ checked: true, deckIds: d.rows.map(r => r.id), cardIds: c.rows.map(r => r.id) });
    } catch (err) {
      pgFail(err);
    }
  }
  res.json({ checked: false, deckIds: [], cardIds: [] });
});

// --- REGISTRO DE REPASOS (STUDY LOGS) ---
app.post('/api/study-logs', async (req, res) => {
  const { id, user_id, card_id, deck_id, rating, review_duration_ms, reviewDurationMs } = req.body;
  const timeSpent = review_duration_ms || reviewDurationMs || 0;

  // El mismo ID en JSON y en PostgreSQL (antes un log sin id fallaba en PG con NOT NULL)
  const logId = id || crypto.randomUUID();

  store.saveStudyLog({
    id: logId,
    user_id,
    card_id,
    deck_id,
    rating,
    time_spent_ms: timeSpent
  });

  if (isPgHealthy) {
    try {
      const q = `
        INSERT INTO eureka_study_logs (id, user_id, card_id, deck_id, rating, time_spent_ms, reviewed_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO NOTHING;
      `;
      await pool.query(q, [logId, user_id, card_id, deck_id, rating, timeSpent]);
    } catch (err) {
      pgFail(err);
    }
  }

  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Eureka VPS API escuchando en http://0.0.0.0:${PORT}`);
  console.log(`📦 Almacenamiento resiliente activado en: ${STORE_FILE}`);
  console.log(`🔌 Conexión PostgreSQL configurada en: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
});
