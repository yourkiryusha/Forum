import http from 'http';
import nodeStatic from 'node-static';
import url from 'url';
import fs from 'fs';

const port = 8080;
const filePath = new nodeStatic.Server('./');

class Router {
	constructor() {
		this.routes = [];
	}

	addRoute(method, pathnamePattern, handler) {
		this.routes.push({
			method: method,
			pathname: pathnamePattern,
			handler: handler
		});
	}

	resolve(request, response) {
		const path = url.parse(request.url).pathname;
		let isMethod = false;
		const currRoute = this.routes.find(route => {
			if (route.method === request.method) {
				isMethod = true;
				const match = route.pathname.exec(path);
				if (match) {
					route.handler(request, response, ...match.slice(1));
					return true;
				}
			}
			return false;
		});
		if (!currRoute) {
			if (isMethod) {
				this.respond(response, 400, 'Bad request');
			} else {
				this.respond(response, 405, 'Method not allowed');
			}
		}
	}

	respond(response, statusCode, data, type) {
		response.writeHead(statusCode, {
			'Content-Type': type || 'text/plain'
		});
		response.end(data);
	}

	respondJSON(response, statusCode, data) {
		this.respond(response, statusCode, JSON.stringify(data), 'application/json');
	}
}

const router = new Router();

const loadTopics = () => {
	try {
		const data = fs.readFileSync('./topics.json', 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		return [];
	}
};

const saveTopics = (topics) => {
	fs.writeFileSync('./topics.json', JSON.stringify(topics, null, 2), 'utf-8');
};

const topics = loadTopics();

router.addRoute('GET', /^\/topics\/?$/, (req, res) => {
	try {
		router.respondJSON(res, 200, topics);
	} catch (error) {
		router.respond(res, 500, 'Internal Server Error');
	}
});

router.addRoute('GET', /^\/topics\/(\d+)$/, (req, res, topicId) => {
	try {
		const currTopic = topics.find(currT => currT.id === +topicId);
		if (currTopic) {
			router.respondJSON(res, 200, currTopic);
		} else {
			router.respond(res, 404, 'Not found');
		}
	} catch (error) {
		router.respond(res, 500, 'Internal Server Error');
	}
});

let waitingClients = [];
let serverVersion = 0;

router.addRoute('POST', /^\/topics\/?$/, (req, res) => {
	let body = '';
	req.on('data', chunk => {
		body += chunk;
	});
	req.on('end', () => {
		try {
			const data = JSON.parse(body);
			const currId = topics.length > 0
				? Math.max(...topics.map(currTopic => currTopic.id))
				: 0;
			if (data.author && data.title && data.summary) {
				const topic = {
					id: currId + 1,
					author: data.author,
					title: data.title,
					summary: data.summary,
					comments: []
				};
				topics.push(topic);
				saveTopics(topics);
				serverVersion++;
				router.respond(res, 201, 'Created');
			} else {
				router.respond(res, 400, 'Bad request');
			}
		} catch (error) {
			router.respond(res, 500, 'Internal Server Error');
		}
	});
});

router.addRoute('POST', /^\/topics\/(\d+)\/comment$/, (req, res, topicId) => {
	let body = '';
	req.on('data', chunk => {
		body += chunk;
	});
	req.on('end', () => {
		try {
			const data = JSON.parse(body);
			const currTopic = topics.find(currT => currT.id === +topicId);
			if (currTopic && data.author && data.message) {
				const comment = {
					id: currTopic.comments.length + 1,
					author: data.author,
					message: data.message
				};
				currTopic.comments.push(comment);
				saveTopics(topics);
				serverVersion++;
				router.respond(res, 201, 'Created');
			} else {
				router.respond(res, 400, 'Bad request');
			}
		} catch (error) {
			router.respond(res, 500, 'Internal Server Error');
		}
	});
});

router.addRoute('DELETE', /^\/topics\/(\d+)$/, (req, res, topicId) => {
	try {
		const currTopicId = topics.findIndex(currT => currT.id === +topicId);
		if (currTopicId !== -1) {
			topics.splice(currTopicId, 1);
			saveTopics(topics);
			serverVersion++;
			router.respond(res, 200, 'OK');
		} else {
			router.respond(res, 404, 'Not found');
		}
	} catch (error) {
		router.respond(res, 500, 'Internal Server Error');
	}
});

router.addRoute('GET', /^\/longPolling\/?$/, (req, res) => {
	const { responseTime, clientVersion } = url.parse(req.url, true).query;

	const isValid = (parameter) => {
		const toNumber = +parameter;
		return !isNaN(toNumber) && toNumber >= 0;
	};

	if (!isValid(responseTime) || !isValid(clientVersion)) {
		return router.respond(res, 400, 'Bad request');
	}

	const client = { clientVersion: clientVersion, res };
	waitingClients.push(client);

	const waitUpdates = () => {
		if (client.clientVersion < serverVersion) {
			clearInterval(intervalId);
			clearTimeout(timeoutId);
			waitingClients = waitingClients.filter(currClient => currClient !== client);
			router.respondJSON(res, 200, { currentVersion: serverVersion, topics });
		}
	};

	const intervalId = setInterval(waitUpdates, 500);

	const timeoutId = setTimeout(() => {
		clearInterval(intervalId);
		waitingClients = waitingClients.filter(currClient => currClient !== client);
		router.respond(res, 304, 'Not Modified');
	}, responseTime * 1000);

	req.on('close', () => {
		clearInterval(intervalId);
		clearTimeout(timeoutId);
		waitingClients = waitingClients.filter(currClient => currClient !== client);
	});
});

http.createServer((req, res) => {
	if (req.url.startsWith('/topics') || req.url.startsWith('/longPolling')) {
		router.resolve(req, res);
	} else {
		filePath.serve(req, res, (err) => {
			if (err) {
				if (err.statusCode === 404) {
					router.respond(res, 404, 'Not Found');
				} else {
					router.respond(res, 500, 'Internal Server Error');
				}
			}
		});
	}
}).listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});