import {registerUser, verifyUser} from '../controllers/auth.controllers.js'
import {checkRequestIntegrity} from '../middlewares/auth.middleware.js'
import {get_google_secret} from '../controllers/2fa.controllers.js'
import jwt from 'jsonwebtoken';
import db from '../db/db.js';

import dotenv from 'dotenv'
dotenv.config()

async function routes (fastify, options){
	// OAuth GitHub callback
	fastify.get('/oauth/callback', async (request, reply) => {
		const code = request.query.code;
		if (!code)
			return reply.status(400).send({error: 'No code provided'});

		try {
			// Exchange code for access token
			// const response = await fetch('https://github.com/login/oauth/access_token', {
			// 	method: 'POST',
			// 	headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
			// 	body: JSON.stringify({
			// 		client_id: process.env.GITHUB_CLIENT_ID,
			// 		client_secret: process.env.GITHUB_CLIENT_SECRET,
			// 		code,
			// 		redirect_uri: `https://localhost:8443/oauth/callback`
			// 	})
			// });
			
			const params = new URLSearchParams();
			params.append('client_id', process.env.GITHUB_CLIENT_ID);
			params.append('client_secret', process.env.GITHUB_CLIENT_SECRET);
			params.append('code', code);
			params.append('redirect_uri', 'https://localhost:8443/oauth/callback');

			const response = await fetch('https://github.com/login/oauth/access_token', {
			  method: 'POST',
			  headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			  },
			  body: params.toString()
			});

			const data = await response.json();
			console.log('GitHub token response:', data);
			const accessToken = data.access_token;

			if (!accessToken) {
				return reply.status(400).send({error: 'Failed to get access token'});
			}

			// Get GitHub user info
			const userRes = await fetch('https://api.github.com/user', {
				headers: { Authorization: `token ${accessToken}` }
			});
			const githubUser = await userRes.json();

			if (!githubUser || !githubUser.id) {
				return reply.status(400).send({error: 'Failed to get user info'});
			}

			// Get user email
			const emailRes = await fetch('https://api.github.com/user/emails', {
				headers: { Authorization: `token ${accessToken}` }
			});
			const emails = await emailRes.json();
			const primaryEmail = emails.find(e => e.primary)?.email || `${githubUser.login}@github.local`;

			// Check if user exists, if not create
			let user = db.prepare("SELECT * FROM users WHERE email = ?").get(primaryEmail);

			if (!user) {
				// Create new user from GitHub
				const stmt = db.prepare(
					"INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
				);
				const info = stmt.run(githubUser.login, primaryEmail, 'oauth_github');

				db.prepare("INSERT INTO users_stats (id, games_played, games_wins) VALUES (?, 0, 0)").run(info.lastInsertRowid);

				user = { id: info.lastInsertRowid, username: githubUser.login, email: primaryEmail };
			}

			// Create JWT
			const jwtToken = jwt.sign(
				{ id: user.id, username: user.username, email: user.email },
				process.env.JWT_SECRET,
				{ expiresIn: "1000h" }
			);

			// Redirect to frontend with token in URL hash
			return reply.redirect(`https://localhost:8443/#/oauth?token=${jwtToken}`);


		} catch (error) {
			console.error('OAuth error:', error);
			return reply.status(500).send({error: 'OAuth failed'});
		}
	})

	fastify.get('/', async (request, reply) => {
		return {status: 'Auth server running'};
	})

	fastify.post(
		'/register',
		{
			preHandler: checkRequestIntegrity(['email', 'password', 'username'])
		},
		(request, reply) => {
		registerUser(request, reply);
	})

	fastify.post(
	'/login',
	{
		preHandler: checkRequestIntegrity(['username', 'password', 'token'])

	},
	(request, reply) => {
		verifyUser(request, reply);
	})

	fastify.post(
		'/get-secret',
		{
			preHandler: checkRequestIntegrity(['username', 'password'])
		},
		(request, reply) => {
			get_google_secret(request, reply);
		}
	);
}

export default routes
