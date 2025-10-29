# Backup Scheduling Examples

## Linux (cron)

Edit crontab:

```
# Backup DB daily at 2:00 AM
0 2 * * * bash /path/to/repo/tools/backup/backup-db.sh >> /var/log/studio360-backup.log 2>&1

# Backup uploads daily at 2:15 AM
15 2 * * * bash /path/to/repo/tools/backup/backup-uploads.sh >> /var/log/studio360-backup.log 2>&1
```

Environment variable DATABASE_URL must be set for pg_dump.

## Windows (Task Scheduler)

- Create Basic Task: "Studio360 DB Backup"
- Trigger: Daily 2:00 AM
- Action: Start a Program
  - Program/script: powershell.exe
  - Arguments: -ExecutionPolicy Bypass -Command "& 'C:\\path\\to\\repo\\tools\\backup\\backup-db.bat'"

Repeat for uploads at 2:15 AM with backup-uploads.bat.

## NPM scripts (optional)

Add to backend/package.json:

```
{
  "scripts": {
    "backup:db": "bash ../tools/backup/backup-db.sh || tools\\backup\\backup-db.bat",
    "backup:uploads": "bash ../tools/backup/backup-uploads.sh || tools\\backup\\backup-uploads.bat",
    "backup:all": "npm run backup:db && npm run backup:uploads"
  }
}
```

Adjust relative paths per your deployment layout.
