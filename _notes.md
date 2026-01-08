> **Эта страница не для ИИ-агентов!**

# Запустить / остановить сервер на порту 8000
```bash
cd "/Users/sergeiklimenko/Cursor Projects/Ticketland Website" && python3 -m http.server 8000
```
```bash
lsof -i :8000
# Найди PID процесса и выполни:
kill -9 <PID>
```