import { h, r as registerInstance, a as createEvent } from './index-4882c95f.js';

class FetchRequestError extends Error {
    constructor(originalError) {
        const detailedError = originalError.cause
            ? originalError.cause
            : originalError;
        let { message, code } = detailedError;
        if (originalError.name === 'AbortError') {
            message = 'Request timeout';
            code = 'ETIMEDOUT';
        }
        super(message);
        this.name = detailedError.name;
        this.code = code;
        this.originalStack = detailedError.stack;
    }
}
function configureTimeout({ timeout, abortController = new AbortController() }) {
    let timeoutId = null;
    const { signal } = abortController;
    if (timeout) {
        timeoutId = setTimeout(() => {
            abortController.abort();
        }, timeout);
    }
    return { signal, timeoutId };
}
function tryParseJSON(value) {
    try {
        return JSON.parse(value);
    }
    catch (error) {
        return value;
    }
}
;
/* eslint-disable-next-line max-lines-per-function */
async function formatResponse(response, returnStream) {
    const body = returnStream
        ? response.body
        : tryParseJSON(await response.text());
    const responseHeaders = {};
    Array.from(response.headers.keys()).forEach((key) => {
        responseHeaders[key] = response.headers.get(key);
    });
    const formattedResponse = {
        body,
        response: {
            body,
            headers: responseHeaders,
            ok: response.ok,
            statusCode: response.status,
            statusText: response.statusText,
        },
    };
    return response.ok
        ? formattedResponse
        : Promise.reject(formattedResponse);
}
/**
 * Sends a fetch request.
 *
 * @param {Object} options - The options for the fetch request.
 * @param {string} options.uri - The URI to request.
 * @param {Object} options.headers - The headers to include in the request.
 * @param {Object} options.body - The body of the request.
 * @param {Object} options.params - The query parameters to include in the request.
 * @param {boolean} returnStream - Whether to return the response body as a stream.
 * @returns {Promise<Object>} The response from the fetch request.
 *
 * @throws {Promise<Object>} If the fetch request fails, it throws a Promise
 *  that rejects with the response of a instance of FetchRequestError.
 */
/* eslint-disable-next-line max-lines-per-function, max-statements */
async function fetchRequest(options = {}, returnStream = false) {
    try {
        const abortSignal = configureTimeout(options);
        const reqHeaders = Object.assign({ 'Content-Type': 'application/json' }, options.headers);
        const uri = new URL(options.uri);
        const { params = {} } = options;
        Object.keys(params).forEach((key) => {
            uri.searchParams.append(key, params[key]);
        });
        const response = await fetch(uri, Object.assign(Object.assign({}, options), { body: JSON.stringify(options.body), headers: reqHeaders, signal: abortSignal.signal }));
        clearTimeout(abortSignal.timeoutId);
        return formatResponse(response, returnStream);
    }
    catch (error) {
        const fetchRequestError = new FetchRequestError(error);
        console.error({
            details: fetchRequestError,
            error: fetchRequestError.name,
            message: `[COMMONS-FETCH-REQUEST]-ERROR: ${fetchRequestError.name} - ${fetchRequestError.message}`,
        });
        throw fetchRequestError;
    }
}
;

class AIEnterpriseService {
    constructor(settings) {
        this.settings = settings;
    }
    async getAgent(agentIdentify) {
        try {
            const result = await fetchRequest({
                method: `GET`,
                headers: {
                    'x-api-key': this.settings.xApiKey,
                },
                uri: `${this.settings.url}/workout/v1/agent/${agentIdentify}`,
            });
            return result.body;
        }
        catch (error) {
            console.error(error);
        }
    }
    async sendMessage(sendMessageBody) {
        try {
            const result = await fetchRequest({
                method: `POST`,
                uri: `${this.settings.url}/workout/v1/chat`,
                body: {
                    body: Object.assign({}, sendMessageBody),
                },
            });
            return result.body;
        }
        catch (error) {
            console.error(error);
        }
    }
}

const enTranslations = {
    'button.send': 'Send',
    'text.placeholder': 'Type your message here...',
};

const ptBrTranslations = {
    'button.send': 'Enviar',
    'text.placeholder': 'Digite uma mensagem...',
};

const translations = {
    'en': enTranslations,
    'pt-br': ptBrTranslations,
};
class TranslationUtils {
    static async fetchTranslations(lang = `en`) {
        const existingTranslations = JSON.parse(sessionStorage.getItem(`i18n.${lang}`));
        if (existingTranslations && Object.keys(existingTranslations).length > 0) {
            return existingTranslations;
        }
        try {
            const translateSelected = translations[lang];
            sessionStorage.setItem(`i18n.${lang}`, JSON.stringify(translateSelected));
            return translateSelected;
        }
        catch (exception) {
            console.error(`Error loading locale: ${lang}`, exception);
            return undefined;
        }
    }
}

function format(first, middle, last) {
    return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}
function idGeneration() {
    return Math.random().toString(36).substring(7);
}

const chatComponentCss = "*,*::before,*::after{box-sizing:border-box}html,body{height:100%;margin:0}body{background:linear-gradient(135deg, #044f48, #2a7561);background-size:cover;font-family:\"Segoe UI, Helvetica Neue, Helvetica, Lucida Grande, Arial, Ubuntu, Cantarell, Fira Sans\", sans-serif;font-size:12px;line-height:1.3;overflow:hidden}.bg{width:100%;height:100%;top:0;left:0;z-index:1;filter:blur(80px);transform:scale(1.2)}.chat{font-family:\"Segoe UI, Helvetica Neue, Helvetica, Lucida Grande, Arial, Ubuntu, Cantarell, Fira Sans\", sans-serif;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);min-height:100%;min-width:100%;overflow:hidden;box-shadow:0 5px 30px rgba(0, 0, 0, 0.2);background:url(\"https://cloudfronttestebucket.s3.amazonaws.com/bg.png\") repeat 0 0;border-radius:20px;display:flex;justify-content:space-between;flex-direction:column}.chat-title{flex:0 1 45px;position:relative;z-index:2;background:#F0F2F5;color:#000;text-align:left;padding:15px 10px 10px 67px;margin-bottom:10px}.chat-title h1,.chat-title h2{font-weight:normal;font-size:15px;margin:0;padding:1px}.chat-title h2{color:rgb(99, 95, 95);font-size:13px;margin-top:1px}.chat-title .avatar{position:absolute;z-index:1;top:8px;left:9px;border-radius:30px;width:50px;height:50px;overflow:hidden;margin:0;padding:0;border:2px solid rgba(255, 255, 255, 0.24)}.chat-title .avatar img{width:100%;height:100%}.messages{flex:1 1 auto;overflow:auto;position:relative;width:100%}.messages .messages-content{position:absolute;top:0;left:0;height:101%;width:100%}.messages .message{clear:both;float:left;padding:6px 10px 7px;border-radius:10px 10px 10px 0;background:rgb(255, 255, 255);margin:8px 0;font-size:11px;line-height:1.4;margin-left:35px;position:relative}.messages .message .timestamp{float:right;align-content:end;bottom:-15px;font-size:9px;z-index:3;color:rgba(2, 2, 2, 0.3)}.messages .message::before{content:\"\";position:absolute;bottom:-6px;border-top:6px solid rgb(255, 255, 255);left:0;border-right:7px solid transparent}.messages .message .avatar{position:absolute;z-index:1;bottom:-15px;left:-35px;border-radius:30px;width:30px;height:30px;overflow:hidden;margin:0;padding:0}.messages .message .avatar img{width:100%;height:90%}.messages .message.message-personal{float:right;text-align:right;background:linear-gradient(120deg, #E1F6CA, #E1F6CA);border-radius:10px 10px 0 10px}.messages .message.message-personal::before{left:auto;right:0;border-right:none;border-left:5px solid transparent;border-top:4px solid #E1F6CA;bottom:-4px}.messages .message:last-child{margin-bottom:30px}.messages .message.new{transform:scale(0);transform-origin:0 0;animation:bounce 500ms linear both}.messages .message.loading::before{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);content:\"\";display:block;width:3px;height:3px;border-radius:50%;background:rgba(0, 0, 0, 0.5);z-index:2;margin-top:4px;animation:ball 0.45s cubic-bezier(0, 0, 0.15, 1) alternate infinite;border:none;animation-delay:0.15s}.messages .message.loading span{display:block;font-size:0;width:20px;height:10px;position:relative}.messages .message.loading span::before{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);content:\"\";display:block;width:3px;height:3px;border-radius:50%;background:rgba(0, 0, 0, 0.5);z-index:2;margin-top:4px;animation:ball 0.45s cubic-bezier(0, 0, 0.15, 1) alternate infinite;margin-left:-7px}.messages .message.loading span::after{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);content:\"\";display:block;width:3px;height:3px;border-radius:50%;background:rgba(0, 0, 0, 0.5);z-index:2;margin-top:4px;animation:ball 0.45s cubic-bezier(0, 0, 0.15, 1) alternate infinite;margin-left:7px;animation-delay:0.3s}.message-box{flex:0 1 40px;width:100%;background:#F0F2F5;padding:10px;position:relative}.message-box .message-input{background:none;border:none;outline:none !important;resize:none;color:rgb(12, 12, 12);font-size:11px;height:17px;margin:0;padding-right:20px;width:265px}.message-box textarea:focus:-webkit-placeholder{color:transparent}.message-box .message-submit{position:absolute;z-index:1;top:9px;right:10px;color:#fff;border:none;background:#248A52;font-size:10px;text-transform:uppercase;line-height:1;padding:6px 10px;border-radius:10px;outline:none !important;transition:background 0.2s ease}.message-box .message-submit:hover{background:#1D7745}.message-box .message-submit:disabled{position:absolute;z-index:1;top:9px;right:10px;color:#fff;border:none;background:#CCCCCC;font-size:10px;text-transform:uppercase;line-height:1;padding:6px 10px;border-radius:10px}::-webkit-scrollbar{width:0.3em;opacity:0}::-webkit-scrollbar-track{box-shadow:inset 0 0 5px #F0F2F5;opacity:0}::-webkit-scrollbar-thumb{background-color:rgba(192, 185, 185, 0.5) !important;opacity:0}::-webkit-scrollbar-thumb:hover{background-color:rgba(192, 185, 185, 0.5) !important;margin:1px -3px 1px 0;opacity:0}.mCSB_scrollTools{margin:1px -3px 1px 0;opacity:0}.mCSB_inside>.mCSB_container{margin-right:0px;padding:0 10px}.mCSB_scrollTools .mCSB_dragger .mCSB_dragger_bar{background-color:rgba(192, 185, 185, 0.5) !important}@keyframes bounce{0%{transform:matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}4.7%{transform:matrix3d(0.45, 0, 0, 0, 0, 0.45, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}9.41%{transform:matrix3d(0.883, 0, 0, 0, 0, 0.883, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}14.11%{transform:matrix3d(1.141, 0, 0, 0, 0, 1.141, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}18.72%{transform:matrix3d(1.212, 0, 0, 0, 0, 1.212, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}24.32%{transform:matrix3d(1.151, 0, 0, 0, 0, 1.151, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}29.93%{transform:matrix3d(1.048, 0, 0, 0, 0, 1.048, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}35.54%{transform:matrix3d(0.979, 0, 0, 0, 0, 0.979, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}41.04%{transform:matrix3d(0.961, 0, 0, 0, 0, 0.961, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}52.15%{transform:matrix3d(0.991, 0, 0, 0, 0, 0.991, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}63.26%{transform:matrix3d(1.007, 0, 0, 0, 0, 1.007, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}85.49%{transform:matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}100%{transform:matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)}}@keyframes ball{from{transform:translateY(0) scaleY(0.8)}to{transform:translateY(-10px)}}";

const Message = ({ agent: agent, content, date, sender, loading }) => {
    const dateFormart = date.getHours() + ':' + date.getMinutes();
    const MessageUser = (message) => {
        var _a;
        return (h("div", { class: "message message-personal new" }, h("div", { innerHTML: ((_a = message.content) === null || _a === void 0 ? void 0 : _a.replace(/(?:\r\n|\r|\n)/g, '<br>')) || '' }, h("span", null)), h("div", { class: "timestamp" }, dateFormart)));
    };
    const MessageAI = (message) => {
        var _a;
        return (h("div", { class: `message ${!message.loading || `loading`} new` }, h("figure", { class: "avatar" }, h("img", { src: (agent === null || agent === void 0 ? void 0 : agent.urlImg) || 'https://cloudfronttestebucket.s3.amazonaws.com/agent.jpg' })), h("div", { innerHTML: ((_a = message.content) === null || _a === void 0 ? void 0 : _a.replace(/(?:\r\n|\r|\n)/g, '<br>')) || '' }, h("span", null)), h("div", { class: "timestamp" }, dateFormart)));
    };
    return sender === `AI` ?
        MessageAI({ agent, content, date, sender, loading }) :
        MessageUser({ agent, content, date, sender, loading });
};
const Messages = ({ agent, messages }) => {
    return (h("div", { class: 'messages-content' }, messages.map((message) => (h(Message, { agent: agent, content: message.content, date: message.date, sender: message.sender, loading: message.loading })))));
};
const service = new AIEnterpriseService({
    url: 'https://ai-enterprise-api.azurewebsites.net',
    xApiKey: 'my-key',
});
const ChatComponent = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.send = createEvent(this, "send", 7);
        this.receiver = createEvent(this, "receiver", 7);
        this.renderMessages = (messages) => {
            return (h(Messages, { messages: messages, agent: this.Agent }));
        };
        this.messagesContainer = null;
        this.greetings = undefined;
        this.identifier = undefined;
        this.chatUid = undefined;
        this.context = undefined;
        this.language = undefined;
        this.translations = undefined;
        this.messages = [];
        this.content = '';
        this.disableSend = true;
        this.Agent = undefined;
    }
    async componentWillLoad() {
        var _a;
        this.chatUid = this.chatUid || idGeneration();
        const messageID = idGeneration();
        this.translations = await TranslationUtils.fetchTranslations(this.language);
        const sendBody = {
            id: this.chatUid,
            agentUid: this.identifier,
            userId: this.chatUid,
            context: this.context || '',
            messages: [{ id: messageID, content: this.greetings || 'Hi' }],
        };
        this.receiver.emit({
            id: messageID,
            content: undefined,
            date: new Date(),
            loading: true,
            sender: 'AI'
        });
        if (!((_a = this.Agent) === null || _a === void 0 ? void 0 : _a.name)) {
            this.Agent = await service.getAgent(this.identifier);
        }
        console.warn('this.Agent', this.Agent);
        const response = await service.sendMessage(sendBody);
        this.receiver.emit({
            id: messageID,
            content: response,
            date: new Date(),
            loading: false,
            sender: 'AI'
        });
        this.disableSend = false;
    }
    componentDidRender() {
        this.onScroll(null);
    }
    sendHandler(event) {
        const message = event.detail;
        this.disableSend = true;
        this.receiver.emit(Object.assign({}, message));
        const messageID = idGeneration();
        this.receiver.emit({
            id: messageID,
            date: new Date(),
            loading: true,
            sender: 'AI'
        });
        const sendBody = {
            id: this.chatUid,
            agentUid: this.identifier,
            userId: this.chatUid,
            context: this.context || '',
            messages: [Object.assign({ id: messageID }, message)],
        };
        service.sendMessage(sendBody)
            .then((response) => {
            this.receiver.emit({
                id: messageID,
                content: response,
                date: new Date(),
                loading: false,
                sender: 'AI'
            });
            this.disableSend = false;
        })
            .catch((error) => {
            console.error(error);
        });
    }
    receiverHandler(event) {
        const message = event.detail;
        this.messages = [
            ...this.messages.filter(item => item.id !== message.id),
            message,
        ];
    }
    handleKeyDown(ev) {
        if (ev.key === 'Enter' && !this.disableSend) {
            this.handleSend(ev);
        }
    }
    handleSend(event) {
        event.preventDefault();
        if (!this.content)
            return;
        this.send.emit({
            id: idGeneration(),
            content: this.content,
            date: new Date(),
            loading: false,
            sender: 'USER'
        });
        this.content = '';
    }
    handleChange(event) {
        this.content = event.target.value;
    }
    onScroll(_e) {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTo({
                top: this.messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
    render() {
        var _a, _b, _c;
        return (h("div", { key: '919df2b21660baae6c9e47c410ba702c8b7e6436', class: 'chat' }, h("div", { key: 'c006495d81d58b67848daba76f45a701608c3da3', class: 'chat-title' }, h("h1", { key: 'a5e12fa1f84d0d5c3bdbeea9c04823d502b322e7' }, ((_a = this.Agent) === null || _a === void 0 ? void 0 : _a.name) || 'BOT'), h("h2", { key: '583d6b3e32aff74f95ad4a238700e1bb7e96227e' }, ((_b = this.Agent) === null || _b === void 0 ? void 0 : _b.description) || 'IA Assistent'), h("figure", { key: '02853eb9640dbbb3fd77d639d326afe5a2750811', class: 'avatar' }, h("img", { key: '7ab8dbb61ed3a087d8c2fe3b48272c98b2465ffe', src: ((_c = this.Agent) === null || _c === void 0 ? void 0 : _c.urlImg) || 'https://cloudfronttestebucket.s3.amazonaws.com/agent.jpg' }))), h("div", { key: '5210b60369b12b22c3fa55263e8891391724a8c1', class: 'messages', ref: el => this.messagesContainer = el }, this.renderMessages(this.messages)), h("div", { key: '25e6a2cdfce5c60a5d7c72647ad4a22ebf4b9db9', class: 'message-box' }, h("textarea", { key: '800be533aef8364301cdbeb658c18ff596137ea3', typeof: 'text', value: this.content, onInput: (event) => this.handleChange(event), class: 'message-input', placeholder: (this.translations) ? this.translations['text.placeholder'] : 'Digite sua mensagem ...' }), h("button", { key: 'b71d1fb523b66f85560f9f86a504636b74315e1e', disabled: this.disableSend, type: 'submit', class: 'message-submit', onClick: (e) => this.handleSend(e) }, (this.translations) ? this.translations['button.send'] : 'Enviar'))));
    }
};
ChatComponent.style = chatComponentCss;

export { ChatComponent as chat_component };

//# sourceMappingURL=chat-component.entry.js.map