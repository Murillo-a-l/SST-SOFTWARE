-- Liberar todos os advisory locks do PostgreSQL
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'occupational_health'
  AND pid <> pg_backend_pid()
  AND state = 'idle';

-- Verificar conexões restantes
SELECT pid, usename, state, query
FROM pg_stat_activity
WHERE datname = 'occupational_health';
