const express = require('express');
const { createOAuthState, createSessionToken, verifySessionToken, exchangeAuthorizationCode, fetchKakaoUser, upsertKakaoUser } = require('./auth.service');
const authRouter = express.Router();
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' };

authRouter.get('/kakao', (_request, response) => {
  if (!process.env.KAKAO_REDIRECT_URI || !process.env.WEB_ORIGIN) {
    return response.status(503).json({ message: '공개 도메인 설정 후 앱을 재배포해 주세요.' });
  }
  const state = createOAuthState();
  response.cookie('makerlink_oauth_state', state, { ...cookieOptions, maxAge: 600000 });
  const query = new URLSearchParams({ client_id: process.env.KAKAO_REST_API_KEY, redirect_uri: process.env.KAKAO_REDIRECT_URI, response_type: 'code', state, prompt: 'login' });
  response.redirect(`https://kauth.kakao.com/oauth/authorize?${query}`);
});
authRouter.get('/kakao/callback', async (request, response, next) => {
  try {
    const stateFromCookie = request.headers.cookie?.match(/makerlink_oauth_state=([^;]+)/)?.[1];
    if (request.query.error || !request.query.code || !stateFromCookie || request.query.state !== stateFromCookie) return response.status(401).json({ message: 'Kakao login verification failed.' });
    const tokens = await exchangeAuthorizationCode(request.query.code);
    const kakaoUser = await fetchKakaoUser(tokens.access_token);
    const user = await upsertKakaoUser(kakaoUser);
    response.clearCookie('makerlink_oauth_state', cookieOptions);
    response.cookie('makerlink_session', createSessionToken(user), { ...cookieOptions, maxAge: 28800000 });
    response.redirect(`${process.env.WEB_ORIGIN}/?login=success`);
  } catch (error) { next(error); }
});
authRouter.get('/session', (request, response) => {
  const token = request.headers.cookie?.match(/makerlink_session=([^;]+)/)?.[1];
  const session = verifySessionToken(token);
  if (!session) return response.status(401).json({ message: 'No active session.' });
  response.json({ userId: session.userId });
});
authRouter.post('/logout', (_request, response) => {
  response.clearCookie('makerlink_session', cookieOptions);
  response.status(204).end();
});
module.exports = { authRouter };
