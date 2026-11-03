-- Red de seguridad a nivel de base de datos, independiente de lo que haga cualquier cliente:
--   1) historial de versiones de los ajustes/cuadernos (cada cambio guarda la versión anterior)
--   2) papelera: todo mazo o tarjeta borrado se copia aqui antes de desaparecer
-- Idempotente.
BEGIN;

CREATE TABLE IF NOT EXISTS eureka_settings_history (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  settings_json jsonb NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS eureka_settings_history_user_idx ON eureka_settings_history (user_id, id DESC);

CREATE OR REPLACE FUNCTION eureka_keep_settings_history() RETURNS trigger AS $$
BEGIN
  -- Solo cuenta un cambio de CONTENIDO (las marcas updatedAt cambian en cada sincronizacion)
  IF (OLD.settings_json #- '{updatedAt}' #- '{settingsJson,updatedAt}')
     IS DISTINCT FROM (NEW.settings_json #- '{updatedAt}' #- '{settingsJson,updatedAt}') THEN
    -- Como mucho una version por minuto y usuario: dentro de una rafaga se conserva la primera (la buena)
    IF NOT EXISTS (SELECT 1 FROM eureka_settings_history h WHERE h.user_id = OLD.user_id AND h.saved_at > now() - interval '1 minute') THEN
      INSERT INTO eureka_settings_history (user_id, settings_json) VALUES (OLD.user_id, OLD.settings_json);
      DELETE FROM eureka_settings_history h
       WHERE h.user_id = OLD.user_id
         AND h.id NOT IN (SELECT id FROM eureka_settings_history WHERE user_id = OLD.user_id ORDER BY id DESC LIMIT 40);
    END IF;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS eureka_settings_history_trg ON eureka_user_settings;
CREATE TRIGGER eureka_settings_history_trg BEFORE UPDATE ON eureka_user_settings
  FOR EACH ROW EXECUTE FUNCTION eureka_keep_settings_history();

CREATE TABLE IF NOT EXISTS eureka_trash (
  id bigserial PRIMARY KEY,
  kind text NOT NULL,
  user_id text,
  item_id text,
  data jsonb NOT NULL,
  deleted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS eureka_trash_user_idx ON eureka_trash (user_id, deleted_at DESC);

CREATE OR REPLACE FUNCTION eureka_trash_row() RETURNS trigger AS $$
BEGIN
  INSERT INTO eureka_trash (kind, user_id, item_id, data) VALUES (TG_ARGV[0], OLD.user_id, OLD.id, to_jsonb(OLD));
  RETURN OLD;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS eureka_decks_trash_trg ON eureka_decks;
CREATE TRIGGER eureka_decks_trash_trg BEFORE DELETE ON eureka_decks
  FOR EACH ROW EXECUTE FUNCTION eureka_trash_row('deck');
DROP TRIGGER IF EXISTS eureka_cards_trash_trg ON eureka_flashcards;
CREATE TRIGGER eureka_cards_trash_trg BEFORE DELETE ON eureka_flashcards
  FOR EACH ROW EXECUTE FUNCTION eureka_trash_row('card');

COMMIT;
