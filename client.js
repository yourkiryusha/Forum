class Client {
	constructor(client) {
		this.clientVersion = 0;
		this.responseTime = 15;
		this.#addNameClient(client);
		this.#addNewTopic(client);
		this.#requestLongPolling();
	}

	#createElement({ elementType, className, textContent, attributes }) {
		const newElement = document.createElement(elementType);
		if (className) {
			newElement.classList.add(className);
		}
		if (textContent) {
			newElement.textContent = textContent;
		}
		if (attributes) {
			Object.entries(attributes).forEach(([key, value]) => newElement.setAttribute(key, value));
		}
		return newElement;
	}

	#addNameClient(client) {
		const yourNameBody = this.#createElement({
			elementType: 'div',
			className: 'your-name'
		});
		const yourNameLabel = this.#createElement({
			elementType: 'label',
			className: 'your-name-label',
			textContent: 'Your name:',
			attributes: { 'for': 'username' }
		});
		const yourNameInput = this.#createElement({
			elementType: 'input',
			className: 'your-name-input',
			attributes: { 'id': 'username', 'placeholder': 'Name', required: '' }
		});
		yourNameBody.append(yourNameLabel, yourNameInput);
		client.append(yourNameBody);
	}

	#addNewTopic(client) {
		const formTopic = this.#createElement({
			elementType: 'div',
			className: 'form-topic'
		});
		client.append(formTopic);
		const topicHeader = this.#createElement({
			elementType: 'header',
			className: 'form-topic-header'
		});
		const topicName = this.#createElement({
			elementType: 'h1',
			className: 'form-topic-name',
			textContent: 'Submit a talk'
		});
		topicHeader.append(topicName);
		const topicBody = this.#createElement({
			elementType: 'div',
			className: 'form-topic-body'
		});
		const topicTitle = this.#createElement({
			elementType: 'div',
			className: 'form-topic-title'
		});
		const titleLabel = this.#createElement({
			elementType: 'label',
			className: 'title-label',
			textContent: 'Title:',
			attributes: { 'for': 'title' }
		});
		const titleInput = this.#createElement({
			elementType: 'input',
			className: 'title-input',
			attributes: { 'id': 'title', 'placeholder': 'Title', required: '' }
		});
		topicTitle.append(titleLabel, titleInput);
		const topicSummary = this.#createElement({
			elementType: 'div',
			className: 'form-topic-summary'
		});
		const summaryLabel = this.#createElement({
			elementType: 'label',
			className: 'summary-label',
			textContent: 'Summary:',
			attributes: { 'for': 'summary' }
		});
		const summaryInput = this.#createElement({
			elementType: 'input',
			className: 'summary-input',
			attributes: { 'id': 'summary', 'placeholder': 'Summary', required: '' }
		});
		const formButtonSend = this.#createElement({
			elementType: 'button',
			className: 'form-button-send',
			attributes: { 'type': 'submit' }
		});
		formButtonSend.onclick = () => this.#requestToAddTopic();
		topicSummary.append(summaryLabel, summaryInput);
		topicBody.append(topicTitle, topicSummary, formButtonSend);
		formTopic.append(topicHeader, topicBody);
		const topics = this.#createElement({
			elementType: 'div',
			className: 'topics'
		});
		client.append(topics);
	}

	#getValuesForCreateTopic() {
		const nameClient = document.querySelector('.your-name-input');
		const titleTalk = document.querySelector('.title-input');
		const summaryTalk = document.querySelector('.summary-input');
		const dataArr = [nameClient, titleTalk, summaryTalk];
		let allFieldsFilled = true;

		dataArr.forEach(item => {
			if (item.value.trim() === '') {
				item.classList.add('valid');
				item.placeholder = 'This field can`t be empty';
				allFieldsFilled = false;
			} else {
				item.classList.remove('valid');
				item.placeholder = '';
			}
		});

		if (allFieldsFilled) {
			const dataClient = {
				author: nameClient.value.trim(),
				title: titleTalk.value.trim(),
				summary: summaryTalk.value.trim()
			};
			nameClient.value = '';
			titleTalk.value = '';
			summaryTalk.value = '';
			return dataClient;
		}
	}

	#createNewTopic(dataClient) {
		const topic = this.#createElement({
			elementType: 'div',
			className: 'topic',
			attributes: { 'id': dataClient.id }
		});
		const topicHeader = this.#createElement({
			elementType: 'header',
			className: 'topic-header'
		});
		const topicName = this.#createElement({
			elementType: 'div',
			className: 'topic-name'
		});
		const topicTitle = this.#createElement({
			elementType: 'h1',
			className: 'topic-title',
			textContent: dataClient.title
		});
		const topicButtonDelete = this.#createElement({
			elementType: 'button',
			className: 'topic-button-delete',
			attributes: { 'type': 'submit' }
		});
		topicButtonDelete.onclick = () => this.#requestToDeleteTopic(dataClient.id);
		topicName.append(topicTitle, topicButtonDelete);
		const topicAuthor = this.#createElement({
			elementType: 'h2',
			className: 'topic-author',
			textContent: `by ${dataClient.author}`
		});
		const topicSummary = this.#createElement({
			elementType: 'p',
			className: 'topic-summary',
			textContent: dataClient.summary
		});
		topicHeader.append(topicName, topicAuthor, topicSummary);
		const topicBody = this.#createElement({
			elementType: 'div',
			className: 'topic-body'
		});
		const topicBodyAuthor = this.#createElement({
			elementType: 'div',
			className: 'topic-author'
		});
		const topicAuthorLabel = this.#createElement({
			elementType: 'label',
			className: 'topic-author-label',
			textContent: 'Author:'
		});
		const topicAuthorInput = this.#createElement({
			elementType: 'input',
			className: 'topic-author-input',
			attributes: { 'placeholder': 'Author', required: '', 'id': dataClient.id }
		});
		topicBodyAuthor.append(topicAuthorLabel, topicAuthorInput);
		const topicBodyCommentary = this.#createElement({
			elementType: 'div',
			className: 'topic-commentary'
		});
		const topicCommentaryLabel = this.#createElement({
			elementType: 'label',
			className: 'topic-commentary-label',
			textContent: 'Commentary:'
		});
		const topicCommentaryInput = this.#createElement({
			elementType: 'input',
			className: 'topic-input',
			attributes: { 'placeholder': 'Commentary', required: '', 'id': dataClient.id }
		});
		topicBodyCommentary.append(topicCommentaryLabel, topicCommentaryInput);
		const topicButtonAdd = this.#createElement({
			elementType: 'button',
			className: 'topic-button-add',
			attributes: { 'type': 'submit' }
		});
		const topicCommentary  = this.#createElement({
			elementType: 'div',
			className: 'topic-commentary'
		});
		const comments = this.#createElement({
			elementType: 'div',
			className: 'comments',
			attributes: { 'id': dataClient.id }
		});
		topicCommentary.append(comments);
		topicButtonAdd.onclick = () => this.#requestToAddComment(dataClient.id);
		topicBody.append(topicBodyAuthor, topicBodyCommentary, topicButtonAdd);
		topic.append(topicHeader, topicCommentary, topicBody);
		document.querySelector('.topics').append(topic);
	}

	#getValuesForCreateComment(topicId) {
		const commentaryAuthor = document.querySelector(`.topic-author-input[id="${topicId}"]`);
		const commentaryMessage = document.querySelector(`.topic-input[id="${topicId}"]`);
		const commentaryArr = [commentaryAuthor, commentaryMessage];
		let allFieldsFilled = true;

		commentaryArr.forEach(item => {
			if (item.value.trim() === '') {
				item.classList.add('valid');
				item.placeholder = 'This field can`t be empty';
				allFieldsFilled = false;
			} else {
				item.classList.remove('valid');
				item.placeholder = '';
			}
		});

		if (allFieldsFilled) {
			const dataMessage = {
				author: commentaryAuthor.value.trim(),
				message: commentaryMessage.value.trim()
			};
			commentaryAuthor.value = '';
			commentaryMessage.value = '';
			return dataMessage;
		}
	}

	#createNewComment(dataMessage, topicId) {
		const commentary = this.#createElement({
			elementType: 'div',
			className: 'commentary',
			attributes: { 'id': dataMessage.id }
		});
		const commentaryAuthor = this.#createElement({
			elementType: 'div',
			className: 'commentary-author',
			textContent: `${dataMessage.author}:`
		});
		const commentaryMessage = this.#createElement({
			elementType: 'div',
			className: 'commentary-message',
			textContent: dataMessage.message
		});
		commentary.append(commentaryAuthor, commentaryMessage);
		document.querySelector(`.comments[id="${topicId}"]`).append(commentary);
	}

	async #request(options) {
		const response = await fetch(options.pathname, {
			method: options.method,
			headers: {
				'Content-Type': 'application/json' || 'text/plain'
			},
			body: options.body ? JSON.stringify(options.body) : null
		});
		if (!response.ok) {
			throw new Error('Request failed: ' + response.statusText);
		}
		if (options.method === 'GET') {
			return response.json();
		} else {
			return response.text();
		}
	}

	#reportError(error) {
		if (error) {
			alert(error.toString());
		}
	}

	async #requestToAddTopic() {
		const dataClient = this.#getValuesForCreateTopic();
		if (!dataClient) {
			return;
		}
		try {
			await this.#request({
				method: 'POST',
				pathname: '/topics',
				body: dataClient
			});
		} catch (error) {
			this.#reportError(error);
		}
	}

	async #requestToAddComment(topicId) {
		const dataMessage = this.#getValuesForCreateComment(topicId);
		if (!dataMessage) {
			return;
		}
		try {
			await this.#request({
				method: 'POST',
				pathname: `/topics/${topicId}/comment`,
				body: dataMessage
			});
		} catch (error) {
			this.#reportError(error);
		}
	}

	async #requestToDeleteTopic(topicId) {
		try {
			await this.#request({
				method: 'DELETE',
				pathname: `/topics/${topicId}`
			});
		} catch (error) {
			this.#reportError(error);
		}
	}

	async #requestToGetTopics() {
		try {
			const currentTopics = await this.#request({
				method: 'GET',
				pathname: '/topics'
			});
			currentTopics.forEach((topic) => {
				this.#createNewTopic(topic);
				if (topic.comments.length > 0) {
					topic.comments.forEach((comment) => {
						this.#createNewComment(comment, topic.id);
					});
				}
			});
			return currentTopics;
		} catch (error) {
			this.#reportError(error);
		}
	}

	async #requestLongPolling() {
		let defaultTopics = await this.#requestToGetTopics();
		const longPolling = async () => {
			try {
				const currentTopics = await this.#request({
					method: 'GET',
					pathname: `/longPolling?responseTime=${this.responseTime}&clientVersion=${this.clientVersion}`
				});
				if (currentTopics.currentVersion > this.clientVersion) {
					this.#isChangeTopics(defaultTopics, currentTopics.topics);
					defaultTopics = [...currentTopics.topics];
					this.clientVersion = currentTopics.currentVersion;
				}
				await longPolling();
			} catch (err) {
				setTimeout(longPolling, 1000);
			}
		};
		await longPolling();
	}

	#isChangeTopics(defaultTopics, currentTopics) {
		const defaultMap = new Map(defaultTopics.map(topic => [topic.id, topic]));
		const currentMap = new Map(currentTopics.map(topic => [topic.id, topic]));

		currentTopics.forEach((currentTopic) => {
			const defaultTopic = defaultMap.get(currentTopic.id);
			if (!defaultTopic) {
				this.#createNewTopic(currentTopic);
				if (currentTopic.comments.length > 0) {
					currentTopic.comments.forEach((comment) => {
						this.#createNewComment(comment, currentTopic.id);
					});
				}
			} else if (JSON.stringify(defaultTopic) !== JSON.stringify(currentTopic)) {
				const defaultComments = defaultTopic.comments;
				const currentComments = currentTopic.comments;

				currentComments.forEach(currentComment => {
					const isNew = !defaultComments.some(defaultComment => {
						return JSON.stringify(defaultComment) === JSON.stringify(currentComment);
					});
					if (isNew) {
						this.#createNewComment(currentComment, currentTopic.id);
					}
				});
			}
		});

		defaultTopics.forEach((defaultTopic) => {
			if (!currentMap.has(defaultTopic.id)) {
				document.getElementById(`${defaultTopic.id}`).remove();
			}
		});
	}
}

new Client(document.querySelector('.forum'));