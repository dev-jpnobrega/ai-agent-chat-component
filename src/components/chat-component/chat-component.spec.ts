import { newSpecPage } from '@stencil/core/testing';
import { ChatComponent } from './chat-component';

describe('chat-component', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [ChatComponent],
      html: '<chat-component></chat-component>',
    });
    expect(root).toEqualHtml(`
      <chat-component>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </chat-component>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [ChatComponent],
      html: `<chat-component first="Stencil" last="'Don't call me a framework' JS"></chat-component>`,
    });
    expect(root).toEqualHtml(`
      <chat-component first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </chat-component>
    `);
  });
});
