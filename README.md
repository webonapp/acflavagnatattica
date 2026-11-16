# Lavagna tattica — copia privata

Pacchetto del sito attualmente in uso, con sorgenti, risorse, funzioni e backup dei dati live.

## Contenuto
- `dist/`: sito e worker pubblicati
- `worker/`, `drizzle/`, `scripts/`: sorgenti e migrazioni
- `backup/current_database.sql`: utenti con hash e salt delle password, impostazioni e schemi dell'archivio

Il backup non contiene password in chiaro, segreti di sessione o tentativi di accesso temporanei. Conserva il repository GitHub come **privato**: il backup include dati personali e credenziali sotto forma di hash.

## Ripristino
1. Crea un database D1 nuovo e applica le migrazioni in `drizzle/`.
2. Importa `backup/current_database.sql` nel database D1.
3. Configura il binding D1 `DB` e imposta un nuovo segreto `SESSION_SECRET` nell'ambiente di hosting.
4. Pubblica il worker e i file di `dist/` su un hosting compatibile.

GitHub conserva il codice ma non ospita da solo l'applicazione né il database: per mantenere accessi e archivio condiviso tra dispositivi serve collegare un servizio backend/database. Non riutilizzare il backup in un repository pubblico.
