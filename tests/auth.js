const test = require('ava');
const agent = require('supertest');
const createApp = require('../app');
const config = require('../configs/config');
const issueToken = require('./helpers/issueToken');
const refreshTokenDB = require('../models/RefreshToken');

const app = agent(createApp);

const dbExistCreds = {
	id: '5ba77f98cd2ab042b4879800',
	email: 'vasya@bk.ru',
	password: '123456'
};
let userRefreshToken = '';

test('Login success', async t => {
	t.log('secret: ', config.secret);
	const res = await app.post('/api/auth/login').send({
		email: dbExistCreds.email,
		password: dbExistCreds.password
	});
	t.is(res.status, 200);
	t.truthy(!!res.body.token);
	t.truthy(!!res.body.refreshToken);
	t.log(res.body);
	userRefreshToken = res.body.refreshToken;
});

test('Login: 401 | if missed some fileds', async t => {
	const res = await app.post('/api/auth/login').send({
		email: dbExistCreds.email
	});
	t.is(res.status, 401);
});

test('Login: 401 | if credentials invalid', async t => {
	const res = await app.post('/api/auth/login').send({
		email: dbExistCreds.email,
		password: 'dsdassdd123'
	});
	t.is(res.status, 401);
});

test('Login: 404 | if user not exist', async t => {
	const res = await app.post('/api/auth/login').send({
		email: 'petia@bk.ru',
		password: dbExistCreds.password
	});
	t.is(res.status, 404);
});

test('User receives 401 | if access token expired', async t => {
	const expiredToken = issueToken({ id: dbExistCreds.id }, { expiresIn: '1ms' });
	const res = await app.get('/api/users').set('Authorization', `Bearer ${expiredToken}`);
	t.is(res.status, 401);
});

test('User receives 404 | if refresh token invalid', async t => {
	const res = await app.post('/api/auth/refresh').send({
		refreshToken: 'INVALID_REFRESH_TOKEN'
	});
	t.is(res.status, 404);
});

test('User can get new access token through refresh token', async t => {
	const res = await app.post('/api/auth/refresh').send({
		refreshToken: userRefreshToken
	});
	t.is(res.status, 200);
	t.truthy(!!res.body.token);
	t.truthy(!!res.body.refreshToken);
	t.log(res.body);
});

test('User can use refresh token only once', async t => {
	const res = await app.post('/api/auth/refresh').send({
		refreshToken: userRefreshToken
	});
	t.is(res.status, 404);
});

test('Refresh tokens become invaild after logout', async t => {
	const newRefToken = issueToken({ id: dbExistCreds.id });
	await refreshTokenDB.findOneAndUpdate(
		{ userId: dbExistCreds.id },
		{ $set: { token: 'TEST_REFRESH_TOKEN' } }
	);
	const resLogout = await app.post('/api/auth/logout').set('Authorization', `Bearer ${newRefToken}`);
	t.is(resLogout.status, 200);

	const resRefresh = await app.post('/api/auth/refresh').send({
		refreshToken: 'TEST_REFRESH_TOKEN'
	});
	t.is(resRefresh.status, 404);
});

test('Multiple refresh tokens are valid', async t => {
	const resLogin1 = await app.post('/api/auth/login').send({
		email: dbExistCreds.email,
		password: dbExistCreds.password
	});
	const resLogin2 = await app.post('/api/auth/login').send({
		email: dbExistCreds.email,
		password: dbExistCreds.password
	});
	t.is(resLogin1.status, 200);
	t.is(resLogin2.status, 200);

	const resRefresh1 = await app.post('/api/auth/refresh').send({
		refreshToken: resLogin1.body.refreshToken
	});
	t.is(resRefresh1.status, 200);
	t.truthy(!!resRefresh1.body.token);
	t.truthy(!!resRefresh1.body.refreshToken);

	const resRefresh2 = await app.post('/api/auth/refresh').send({
		refreshToken: resLogin2.body.refreshToken
	});
	t.is(resRefresh2.status, 200);
	t.truthy(!!resRefresh2.body.token);
	t.truthy(!!resRefresh2.body.refreshToken);
});

