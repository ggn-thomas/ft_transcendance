import Fastify from 'fastify';
import routes from './routes/auth.routes.js'
import pong_routes from './routes/pong.routes.js'
import {createDatabase} from './controllers/auth.controllers.js'
import {tick} from './controllers/pong.controllers.js'
import fs from 'fs'
import 'dotenv/config'
import cookie from '@fastify/cookie';

const APP_PORT = 3000
const API_PORT = 8000

createDatabase();

const httpsOptions = {
  key: fs.readFileSync('/certs/key.pem'),
  cert: fs.readFileSync('/certs/cert.pem')
};

// --- Serveur pour le login ---
const loginServer = Fastify({https: httpsOptions});
loginServer.register(routes);

await loginServer.register(cookie); 

loginServer.listen({ port: APP_PORT, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		loginServer.log.error(err);
		process.exit(1);
	}
	console.log(`Auth server running on ${address}`);
});

// --- Serveur pour l'API ---
const apiServer = Fastify({https: httpsOptions});
apiServer.register(pong_routes);
apiServer.listen({ port: API_PORT, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		apiServer.log.error(err);
		process.exit(1);
	}
	console.log(`API server running on ${address}`);
	tick();
})
