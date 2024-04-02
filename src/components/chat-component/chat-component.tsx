import { Event, Component, FunctionalComponent, Prop, h, EventEmitter, Listen, State } from '@stencil/core';
import AIEnterpriseService from '../../service/ai-enterprise.service';
import TranslationUtils from '../../utils/translation';

interface MessagesProps {
  messages: Message[];
}

interface Message {
  id?: string;
  content?: string;
  date: Date;
  sender: `AI` | `USER`;
  loading: boolean;
}

const Message: FunctionalComponent<Message> = ({ content, date, sender, loading }) => { 
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
          <img src="https://cloudfronttestebucket.s3.amazonaws.com/agent.jpg" />
        </figure>
        <div innerHTML={ message.content?.replace(/(?:\r\n|\r|\n)/g, '<br>') || '' }><span/></div>
        <div class="timestamp">{dateFormart}</div>
      </div>
    )
  }

  return sender === `AI` ? 
    MessageAI({ content, date, sender, loading }) : 
    MessageUser({ content, date, sender, loading });
};

const Messages: FunctionalComponent<MessagesProps> = ({ messages }) => { 
  return (
    <div class='messages-content'>
      { messages.map((message) => (
        <Message 
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
  key: 'my-key',
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
   * The language
   */
  @Prop() language?: string;
  
  @Event() send: EventEmitter;
  @Event() receiver: EventEmitter;

  @State() translations: any;
  @State() messages: Message[] = [];
  @State() content: string = '';
  @State() disableSend: boolean = true;

  async componentWillLoad() {
    const messageID = Math.random().toString(36).substring(7);

    this.translations = await TranslationUtils.fetchTranslations(this.language);

    this.receiver.emit({
      id: messageID,
      content: undefined,
      date: new Date(),
      loading: true,
      sender: 'AI'
    });

    service.send({ content: this.greetings || 'Hi' }, this.chatUid || '1', this.identifier)
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

    const messageID = Math.random().toString(36).substring(7);

    this.receiver.emit({
      id: messageID,
      date: new Date(),
      loading: true,
      sender: 'AI'
    });
  
    service.send(message, this.chatUid || '1', this.identifier)
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
      id: Math.random().toString(36).substring(7),
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
      <Messages messages={messages} />
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
      <div>
      <div class='chat'>
        <div class='chat-title'>
          <h1>BOT Lua</h1>
          <h2>Atendimento Global</h2>
          <figure class='avatar'>
            <img src='https://cloudfronttestebucket.s3.amazonaws.com/agent.jpg' />
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
            placeholder={ this.translations['text.placeholder'] }>
          </textarea>
          <button disabled={this.disableSend} type='submit' class='message-submit' onClick={ (e) => this.handleSend(e) }>
            { this.translations['button.send'] }
          </button>
        </div>
      </div> 
      <div class="bg"></div>
      </div>
    )
  }
}
