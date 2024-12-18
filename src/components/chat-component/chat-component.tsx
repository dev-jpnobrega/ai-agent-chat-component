import { Event, Component, FunctionalComponent, Prop, h, EventEmitter, Listen, State } from '@stencil/core';
import { AIEnterpriseService, SendMessageBody, Agent } from '../../service/ai-enterprise.service';
import TranslationUtils from '../../helpers/translation';
import { idGeneration } from '../../helpers/helpers';


interface MessagesProps {
  agent: Agent;
  messages: Message[];
}

interface Message {
  id?: string;
  content?: string;
  date: Date;
  sender: `AI` | `USER`;
  loading: boolean;
  agent: Agent;
}

const Message: FunctionalComponent<Message> = ({ agent, content, date, sender, loading }) => { 
  const dateFormart = date.getHours() + ':' + date.getMinutes();

  const MessageUser = (message: Message) => {
    return (
      <div class="message message-personal new">
        <div innerHTML={ message.content?.replace(/(?:\r\n|\r|\n)/g, '<br>') || '' }><span/></div>
        <div class="timestamp">{dateFormart}</div>
      </div>
    )
  }

  const MessageAI = (message: Message) => {
    return (
      <div class={`message ${!message.loading || `loading`} new`}>
        <figure class="avatar">
          <img src={ agent?.urlImg || 'https://cloudfronttestebucket.s3.amazonaws.com/agent.jpg'} />
        </figure>
        <div innerHTML={ message.content?.replace(/(?:\r\n|\r|\n)/g, '<br>') || '' }><span/></div>
        <div class="timestamp">{dateFormart}</div>
      </div>
    )
  }

  return sender === `AI` ? 
    MessageAI({ agent, content, date, sender, loading }) : 
    MessageUser({ agent, content, date, sender, loading });
};

const Messages: FunctionalComponent<MessagesProps> = ({ agent, messages }) => { 
  return (
    <div class='messages-content'>
      { messages.map((message) => (
        <Message 
          agent={agent} 
          content={message.content} 
          date={message.date} 
          sender={message.sender} 
          loading={message.loading} />
      ))}
    </div>
  )
};

const service = new AIEnterpriseService({
  url: 'https://ai-enterprise-api.azurewebsites.net',
  xApiKey: '9cdda224-d676-48e2-a92d-8af19d0a1a21',
});

@Component({
  tag: 'chat-component',
  styleUrl: 'chat-component.scss',
  shadow: true,
})
export class ChatComponent {
  /**
   * The greetings
   */
  @Prop() greetings: string;
  /**
   * The Agent identifier
   */
  @Prop() identifier: string;
  /**
   * The Chat identifier
   */
  @Prop() chatUid?: string;
  /**
   * The Initial Context chat
   */
  @Prop() context?: string;
  /**
   * The language
   */
  @Prop() language?: string;
  /**
   * Event emitted when a message is sent.
   * 
   * @event send
   */
  @Event() send: EventEmitter;
  /**
   * Event emitter for the receiver event.
   * This event is triggered when a message is received.
   *
   * @event receiver
   */
  @Event() receiver: EventEmitter;

  @State() translations: any;
  @State() messages: Message[] = [];
  @State() content: string = '';
  @State() disableSend: boolean = true;
  @State() Agent: Agent; 

  async componentWillLoad() {
    this.chatUid = this.chatUid || idGeneration();
    const messageID =  idGeneration();
    
    this.translations = await TranslationUtils.fetchTranslations(this.language);

    if (!this.Agent?.name)
      this.Agent = await service.getAgent(this.identifier);

    const sendBody: SendMessageBody = {
      id: this.chatUid,
      agentUid: this.identifier,
      userId: this.chatUid,
      context: this.context || '',
      messages: [{ id: messageID, content: this.greetings || 'Hi' }],
    }

    this.receiver.emit({
      id: messageID,
      content: undefined,
      date: new Date(),
      loading: true,
      sender: 'AI'
    });

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

  @Listen('send')
  sendHandler(event: CustomEvent<Message>) {
    const message = event.detail as any;
    
    this.disableSend = true;

    this.receiver.emit({
      ...message,
    });

    const messageID = idGeneration();

    this.receiver.emit({
      id: messageID,
      date: new Date(),
      loading: true,
      sender: 'AI'
    });
  
    const sendBody: SendMessageBody = {
      id: this.chatUid,
      agentUid: this.identifier,
      userId: this.chatUid,
      context: this.context || '',
      messages: [{id: messageID, ...message}],
    }

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

  @Listen('receiver')
  receiverHandler(event: CustomEvent<Message>) {
    const message = event.detail;

    this.messages = [
      ...this.messages.filter(item => item.id !== message.id), 
      message,
    ];
  }

  @Listen('keydown')
  handleKeyDown(ev: KeyboardEvent){
    if (ev.key === 'Enter' && !this.disableSend){
      this.handleSend(ev);
    }
  }

  handleSend(event: Event) {
    event.preventDefault();

    if (!this.content) return;

    this.send.emit({
      id: idGeneration(),
      content: this.content,
      date: new Date(),
      loading: false,
      sender: 'USER'
    });

    this.content = '';
  }

  handleChange(event: Event) { 
    this.content = (event.target as HTMLInputElement).value;    
  }

  renderMessages = (messages: Message[]) => {
    return (
      <Messages messages={messages} agent={this.Agent} />
    )
  }

  private messagesContainer: HTMLDivElement = null;
  
  onScroll(_e) {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTo({
        top: this.messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  render() {
    return (
      <div class='chat'>
        <div class='chat-title'>
          <h1>{ this.Agent?.name || 'BOT' }</h1>
          <h2>{ this.Agent?.description || 'IA Assistent' }</h2>
          <figure class='avatar'>
            <img src={ this.Agent?.urlImg || 'https://cloudfronttestebucket.s3.amazonaws.com/agent.jpg' } />
          </figure>
        </div>
        <div class='messages' ref={ el => this.messagesContainer = el }>
          { this.renderMessages(this.messages) }
        </div>
        <div class='message-box'>
          <textarea
            typeof='text'
            value={ this.content } 
            onInput={ (event) => this.handleChange(event) } 
            class='message-input' 
            placeholder={ this.translations?.['text.placeholder'] || 'Digite sua mensagem ...' }>
          </textarea>
          <button disabled={ this.disableSend } type='submit' class='message-submit' onClick={ (e) => this.handleSend(e) }>
            { (this.translations) ? this.translations['button.send'] : 'Enviar' }
          </button>
        </div>
      </div>
    )
  }
}
