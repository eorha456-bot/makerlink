# Server environment variables

Create `apps/api/.env`; do not commit it. Never put real values into `.env.example`.

```env
PORT=4000
WEB_ORIGIN=http://localhost:5173
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=makerlink
MYSQL_USER=root
MYSQL_PASSWORD=
KAKAO_REST_API_KEY=replace_with_your_rest_api_key
KAKAO_CLIENT_SECRET=replace_with_your_kakao_login_client_secret
KAKAO_REDIRECT_URI=http://localhost:4000/api/auth/kakao/callback
APP_SESSION_SECRET=replace_with_a_long_random_value
```

`APP_SESSION_SECRET` is a project-generated value, not a Kakao value. Generate it with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and keep it secret.
