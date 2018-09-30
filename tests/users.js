const test = require('ava');
const agent = require('supertest');
const createApp = require('../app');
const issueToken = require('./helpers/issueToken');
const User = require('../models/ApiUser');

const app = agent(createApp);

const nullUser = '5ba12e9b154a5a0d2c0b9c5d';
let userID = '';
let authLine = '';

test('Visitor can create user account', async t => {
	const res = await app.post('/api/users').send({
		name: 'testUser',
		email: 'testEmail@email.ru',
		password: '1asDaad3423rF_'
	});
	t.is(res.status, 200);
	t.truthy(!!res.body.user._id);
	t.log(res.body.user);
	userID = res.body.user._id;
	authLine = `Bearer ${issueToken({ id: userID })}`;
});

test('Visitor recives: 400 | if user already exist', async t => {
	const res = await app.post('/api/users').send({
		name: 'testUser',
		email: 'testEmail@email.ru',
		password: '1asDaad3423rF_'
	});
	t.is(res.status, 400);
});

test('Visitor recives: 400 | if he missed some fields', async t => {
	const res = await app.post('/api/users').send({
		name: 'pasha',
		email: 'asdasfdf@gmail.ru'
	});
	t.is(res.status, 400);
});

test('User can get users list', async t => {
	const res = await app.get('/api/users').set('Authorization', authLine);
	t.is(res.status, 200);
	t.truthy(Array.isArray(res.body));
});

test('User can get some user by id', async t => {
	const res = await app.get(`/api/users/${userID}`).set('Authorization', authLine);
	t.is(res.status, 200);
	t.is(res.body._id, userID);
});

test('User can update your credentials', async t => {
	const res = await app
		.patch(`/api/users/${userID}`)
		.set('Authorization', authLine)
		.send({ email: 'vasya@mail.ru', name: 'vasya' });
	t.is(res.status, 200);
	t.is(res.body.message, 'success');
});

test('Permission denied: 403 | if user not account holder', async t => {
	let res = await app
		.delete(`/api/users/${userID}`)
		.set('Authorization', `Bearer ${issueToken({ id: nullUser })}`);
	t.is(res.status, 403);
});

test('User can reset password without authorization', async t => {
	let resSendEmail = await app.post('/api/users/send-reset-password').send({
		email: 'testEmail@email.ru'
	});
	t.is(resSendEmail.status, 200);

	let user = await User.findById(userID);
	let resResetPass = await app.get(`/api/users/reset-password/${user.resetToken}`);
	t.is(resResetPass.status, 200);
	t.truthy(!!resResetPass.body.password);
});

test('User can remove your account', async t => {
	const res = await app.delete(`/api/users/${userID}`).set('Authorization', authLine);
	t.is(res.status, 200);
	t.is(res.body.message, 'success');
});

test('User recives 404 | if user not found', async t => {
	let res = await app.get(`/api/users/${nullUser}`).set('Authorization', authLine);
	t.is(res.status, 404);
	res = await app.patch(`/api/users/${nullUser}`).set('Authorization', authLine);
	t.is(res.status, 404);
	res = await app.delete(`/api/users/${nullUser}`).set('Authorization', authLine);
	t.is(res.status, 404);
});