
### Understand the key concept — Axios Interceptors:
```
Interceptors run BEFORE every request or AFTER every response.

REQUEST interceptor:
→ Grabs token from localStorage
→ Adds it to Authorization header
→ You never manually add headers in components!

RESPONSE interceptor:
→ If any request returns 401 (token expired)
→ Clears localStorage
→ Redirects to /login automatically
→ Handles session expiry globally in ONE place