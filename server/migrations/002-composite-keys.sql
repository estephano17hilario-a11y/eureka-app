-- Mazos y tarjetas pasan a identificarse por (user_id, id): cada cuenta tiene su propio espacio de IDs.
-- Antes el id era clave global, asi que los mazos de demostracion (IDs fijos) de cada invitado chocaban con
-- los de otra cuenta y sus cambios no se guardaban (o pisaban los de otro).
-- Idempotente: se puede ejecutar mas de una vez.
BEGIN;

ALTER TABLE eureka_flashcards DROP CONSTRAINT IF EXISTS eureka_flashcards_deck_id_fkey;
ALTER TABLE eureka_flashcards DROP CONSTRAINT IF EXISTS eureka_flashcards_deck_fkey;
ALTER TABLE eureka_decks DROP CONSTRAINT IF EXISTS eureka_decks_pkey;
ALTER TABLE eureka_flashcards DROP CONSTRAINT IF EXISTS eureka_flashcards_pkey;

ALTER TABLE eureka_decks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE eureka_flashcards ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE eureka_decks ADD CONSTRAINT eureka_decks_pkey PRIMARY KEY (user_id, id);
ALTER TABLE eureka_flashcards ADD CONSTRAINT eureka_flashcards_pkey PRIMARY KEY (user_id, id);

-- Tarjetas cuyo mazo estaba registrado a nombre de otra cuenta: se crea el mazo propio copiando los metadatos
INSERT INTO eureka_decks (id, user_id, parent_id, name, description, icon, is_folder, color, settings, is_archived, created_at, updated_at)
SELECT DISTINCT ON (c.user_id, c.deck_id)
       c.deck_id, c.user_id, d.parent_id, d.name, d.description, d.icon, d.is_folder, d.color, d.settings, d.is_archived, d.created_at, d.updated_at
FROM eureka_flashcards c
JOIN eureka_decks d ON d.id = c.deck_id
WHERE NOT EXISTS (SELECT 1 FROM eureka_decks x WHERE x.id = c.deck_id AND x.user_id = c.user_id)
ORDER BY c.user_id, c.deck_id, d.updated_at DESC NULLS LAST;

ALTER TABLE eureka_flashcards
  ADD CONSTRAINT eureka_flashcards_deck_fkey
  FOREIGN KEY (user_id, deck_id) REFERENCES eureka_decks (user_id, id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS eureka_flashcards_user_deck_idx ON eureka_flashcards (user_id, deck_id);
CREATE INDEX IF NOT EXISTS eureka_decks_id_idx ON eureka_decks (id);
CREATE INDEX IF NOT EXISTS eureka_flashcards_id_idx ON eureka_flashcards (id);

COMMIT;
