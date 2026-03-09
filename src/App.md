### Understand what each part does:
```
<BrowserRouter>
→ Wraps the whole app
→ Enables URL-based navigation

<Routes>
→ Container for all route definitions
→ Renders only the FIRST matching route

<Route path="/login" element={<LoginPage />} />
→ When URL is /login → render LoginPage component

<Navigate to="/login" />
→ Redirects / to /login automatically
→ So visiting localhost:5173 takes you to login
```

---

### Test your routes in the browser:
```
http://localhost:5173/        → redirects to /login
http://localhost:5173/login   → shows "Login Page"
http://localhost:5173/dashboard → shows "Dashboard Page"
http://localhost:5173/interviews → shows "Interviews Page"

```
### Test it:
```
1. Visit http://localhost:5173/dashboard
   → Should redirect to /login (not logged in yet)

2. Visit http://localhost:5173/interviews
   → Should redirect to /login