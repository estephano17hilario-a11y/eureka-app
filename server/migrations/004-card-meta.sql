-- Etiquetas, favorita, pausada, archivada, pista, pospuesta y crédito de foto ahora viajan con la tarjeta
-- (antes eran solo del dispositivo). server.js ejecuta esto solo al arrancar; este archivo es la referencia.
-- Idempotente y aditivo.
ALTER TABLE eureka_flashcards ADD COLUMN IF NOT EXISTS meta jsonb;
