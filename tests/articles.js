const test = require('ava');
const agent = require('supertest');
const createApp = require('../app');
const app = agent(createApp);
const issueToken = require('./helpers/issueToken');

const nullArticle = '5ba12e9b154a5a0d2c0b9c5d';
const authLine = `Bearer ${issueToken({ id: '5ba77f98cd2ab042b4879800' })}`;
let articleId = '';

test('User can get all articles', async t => {
	let res = await app.get('/api/articles').set('Authorization', authLine);
	t.is(res.status, 200);
});

test('User can create article', async t => {
	let res = await app
		.post('/api/articles')
		.field('text', 'TEST ARTICLE TEXT. TEST ARTICLE TEXT. TEST ARTICLE TEXT.')
		.field('title', 'TEST ARTICLE TITLE')
		.set('Authorization', authLine);
	articleId = res.body.article._id;
	t.is(res.status, 200);
});

test('User recives: 400 | if missed some filed', async t => {
	let res = await app
		.post('/api/articles')
		.field('title', 'Test Artcile title')
		.set('Authorization', authLine);
	t.is(res.status, 400);
});

test('User can get article by id', async t => {
	let res = await app.get(`/api/articles/${articleId}`).set('Authorization', authLine);
	t.is(res.status, 200);
	t.truthy(!!res.body._id);
	t.log(res.body);
});

test('User recives: 404 | if article not found', async t => {
	let res = await app.get(`/api/articles/${nullArticle}`).set('Authorization', authLine);
	t.is(res.status, 404);
});

test('User can comment article', async t => {
	let res = await app
		.post(`/api/articles/${articleId}/comment`)
		.send({
			comment: 'TEST COMMENT'
		})
		.set('Authorization', authLine);
	t.is(res.status, 200);
});

test('User can like article', async t => {
	let res = await app.post(`/api/articles/${articleId}/like`).set('Authorization', authLine);
	t.is(res.status, 200);
});

test('Permission denied: 403 | if user not author', async t => {
	let res = await app
		.delete(`/api/articles/${articleId}`)
		.set('Authorization', `Bearer ${issueToken({ id: nullArticle })}`);
	t.is(res.status, 403);
});

test('Author can update article', async t => {
	let res = await app
		.patch(`/api/articles/${articleId}`)
		.send({
			title: 'UPDATED TITLE',
			text: 'UPDATED TEXT>UPDATED TEXT>UPDATED TEXT>UPDATED TEXT'
		})
		.set('Authorization', authLine);
	t.is(res.status, 200);
});

test('Author can remove article', async t => {
	let res = await app.delete(`/api/articles/${articleId}`).set('Authorization', authLine);
	t.is(res.status, 200);
});
