const MARKDOWN_FORMATS = {
  bold: {
    text: 'B',
    title: 'Bold',
    format: (text) => `**${text}**`,
    example: '**Bold** or __Bold__'
  },
  italic: {
    text: 'I',
    title: 'Italic',
    format: (text) => `*${text}*`,
    example: '*Italic* or _Italic_'
  },
  heading: {
    text: 'H',
    title: 'Heading',
    format: (text) => `# ${text}`,
    example: '# Heading 1\n## Heading 2'
  },
  underline: {
    text: 'U',
    title: 'Underline',
    format: (text) => `<u>${text}</u>`,
    example: '<u>Underlined text</u>'
  },
  strikethrough: {
    text: 'S',
    title: 'Strikethrough',
    format: (text) => `~~${text}~~`,
    example: '~~Strikethrough~~'
  },
  quote: {
    text: '"',
    title: 'Quote',
    format: (text) => `> ${text}`,
    example: '> Blockquote'
  },
  orderedList: {
    text: '1.',
    title: 'Ordered List',
    format: (text) => `1. ${text}`,
    example: '1. First item\n2. Second item'
  },
  unorderedList: {
    text: '•',
    title: 'Unordered List',
    format: (text) => `- ${text}`,
    example: '- First item\n- Second item'
  },
  image: {
    text: '🖼️',
    title: 'Insert Image',
    format: async (text) => {
      const dialog = document.createElement('dialog');
      dialog.classList.add('dialog');
      dialog.innerHTML = `
        <form method="dialog">
          <label for="imageUrl">Image URL:</label>
          <input type="url" id="imageUrl" name="imageUrl">
          <menu>
        <button value="cancel" class="action-btn">Cancel</button>
        <button value="submit" class="action-btn">Insert</button>
          </menu>
        </form>
      `;
      document.body.appendChild(dialog);
      dialog.showModal();

      return new Promise((resolve) => {
        dialog.addEventListener('close', () => {
          const imageUrl = dialog.querySelector('#imageUrl').value;
          dialog.remove();

          if (dialog.returnValue === 'cancel' || !imageUrl) {
        resolve(text);
          } else {
        resolve(`![${text || 'Image description'}](${imageUrl})`);
          }
        });
      });
    },
    example: '![Image description](image-url)'
  },
  link: {
    text: '🔗',
    title: 'Insert Link',
    format: async (text) => {
      const dialog = document.createElement('dialog');
      dialog.classList.add('dialog');
      dialog.innerHTML = `
        <form method="dialog">
          <label for="linkText">Link Text:</label>
          <input type="text" id="linkText" name="linkText" value="${text || ''}">
          <label for="linkUrl">URL:</label>
          <input type="url" id="linkUrl" name="linkUrl">
          <menu>
        <button value="cancel" class="action-btn">Cancel</button>
        <button value="submit" class="action-btn">Insert</button>
          </menu>
        </form>
      `;
      document.body.appendChild(dialog);
      dialog.showModal();

      return new Promise((resolve) => {
        dialog.addEventListener('close', () => {
          const linkText = dialog.querySelector('#linkText').value;
          const linkUrl = dialog.querySelector('#linkUrl').value;
          dialog.remove();

          if (dialog.returnValue === 'cancel' || !linkText || !linkUrl) {
        resolve(text);
          } else {
        resolve(`[${linkText}](${linkUrl})`);
          }
        });
      });
    },
    example: '[Link text](url)'
  },
  table: {
    text: '☷',
    title: 'Insert Table',
    format: () => `| Header | Header |\n|--------|--------|\n| Cell   | Cell   |`,
    example: '| Header | Header |\n|--------|--------|\n| Cell   | Cell   |'
  },
  code: {
    text: '⟨⟩',
    title: 'Code',
    format: (text) => text.includes('\n') ? `\`\`\`\n${text}\n\`\`\`` : `\`${text}\``,
    example: '`Inline code`\n```\nCode block\n```'
  },
  help: {
    text: '?',
    title: 'Help',
    format: () => {
      showMarkdownHelp();
      return null;
    },
    example: 'Shows this help dialog'
  }
};

class TextFormatter {
  constructor(postBody) {
    this.postBody = postBody;
  }

  getSelectedText() {
    const start = this.postBody.selectionStart;
    const end = this.postBody.selectionEnd;
    return {
      start,
      end,
      selection: this.postBody.value.substring(start, end)
    };
  }

  replaceSelection(replacement) {
    if (replacement === null) return; // Per gestire azioni come "help" che non modificano il testo

    const { start, end } = this.getSelectedText();
    this.postBody.value = this.postBody.value.substring(0, start) + replacement + this.postBody.value.substring(end);
    this.postBody.focus();
  }

  async applyFormat(formatKey) {
    const format = MARKDOWN_FORMATS[formatKey];
    if (!format) return;

    const { selection } = this.getSelectedText();
    const formattedText = await format.format(selection);
    this.replaceSelection(formattedText);
  }
}

function initializeToolbar() {
  const toolbar = document.getElementById('toolbar');

  Object.entries(MARKDOWN_FORMATS).forEach(([key, format]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.onclick = () => textFormatter.applyFormat(key);
    button.title = format.title;
    button.innerHTML = format.text;
    toolbar.appendChild(button);
  });

  createChevron();
}

function createChevron() {
  const chevron = document.createElement('span');
  chevron.className = 'chevron';
  chevron.innerHTML = '❮';
  chevron.onclick = toggleToolbar;

  const toolbarContainer = document.getElementById('toolbarContainer');
  const toolbar = document.getElementById('toolbar');
  toolbarContainer.appendChild(toolbar);

  const chevronContainer = document.getElementById('chevronContainer');
  const textChevron = document.createElement('span');
  textChevron.className = 'textChevron';
  textChevron.innerHTML = 'Markdown Toolbar';
  chevronContainer.appendChild(textChevron);

  toolbarContainer.appendChild(chevron);
  toolbar.style.display = 'none';
}


const helpStyles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1px'
  },
  card: {
    flex: '1 1 25%',
    border: '2px solid var(--primary-color)',
    borderRadius: '10px',
    background: 'var(--background)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  buttonContainer: {
    fontSize: '1.2em',
    marginBottom: '10px',
    textAlign: 'center'
  },
  button: {
    display: 'inline-block',
    width: '40px',
    height: '40px',
    lineHeight: '40px',
    borderRadius: '50%',
    background: 'var(--primary-color)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1em'
  },
  title: {
    textAlign: 'center',
    fontSize: '1em',
    color: 'var(--on-background)',
    marginBottom: '8px',
    fontWeight: 'bold'
  },
  example: {
    textAlign: 'center',
    fontSize: '0.8em',
    color: 'var(--on-background)',
    whiteSpace: 'pre-wrap'
  }
};

// Template per un singolo elemento dell'help
function createHelpItemTemplate({ testo, bottone, title }) {
  return {
    tag: 'div',
    styles: helpStyles.card,
    content: [
      {
        tag: 'p',
        styles: helpStyles.buttonContainer,
        content: [
          {
            tag: 'span',
            styles: helpStyles.button,
            content: bottone
          }
        ]
      },
      {
        tag: 'p',
        styles: helpStyles.title,
        content: title
      },
      {
        tag: 'p',
        styles: helpStyles.example,
        content: testo
      }
    ]
  };
}

// Funzione per convertire un oggetto stili in stringa CSS inline
function styleObjectToCss(styles) {
  return Object.entries(styles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
}

// Funzione ricorsiva per generare HTML da un template
function renderTemplate(template) {
  if (typeof template === 'string') return template;

  const { tag, styles, content } = template;
  const styleString = styles ? ` style="${styleObjectToCss(styles)}"` : '';

  const contentHtml = Array.isArray(content)
    ? content.map(item => renderTemplate(item)).join('')
    : content || '';

  return `<${tag}${styleString}>${contentHtml}</${tag}>`;
}

function showMarkdownHelp() {
  const helpTitle = 'Markdown Cheat Sheet';
  const helpItems = Object.entries(MARKDOWN_FORMATS)
    .filter(([key]) => key !== 'help')
    .map(([key, format]) => ({
      testo: format.example,
      bottone: format.text,
      title: format.title
    }));

  // Crea il template completo
  const helpTemplate = {
    tag: 'div',
    styles: helpStyles.container,
    content: helpItems.map(createHelpItemTemplate)
  };

  // Renderizza il template
  const helpMessage = renderTemplate(helpTemplate);

  // Crea una dialog con l'help
  const dialog = document.createElement('dialog');
  dialog.classList.add('dialog');
  dialog.innerHTML = `
    <h2>${helpTitle}</h2>
    ${helpMessage}
    <button class="close-button" aria-label="Chiudi">✕</button>

  `;
  //<button id="closeButton" class="action-btn">Chiudi</button>
  document.body.appendChild(dialog);
  dialog.classList.add('success');
  
  dialog.showModal();

  // Imposta lo scroll all'inizio
  dialog.scrollTop = 0;

  const closeButton = dialog.querySelector('.close-button');
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());
}

const textFormatter = new TextFormatter(document.getElementById('postBody'));
document.addEventListener('DOMContentLoaded', initializeToolbar);

function toggleToolbar() {
  const chevron = document.querySelector('.chevron');
  const toolbar = document.getElementById('toolbar');

  toolbar.classList.toggle('expanded');
  chevron.classList.toggle('rotated');
  chevron.innerHTML = toolbar.classList.contains('expanded') ? '❯' : '❮';

  if (toolbar.classList.contains('expanded')) {
    toolbar.style.display = 'flex';
    document.querySelector('.textChevron').style.display = 'none';
  } else {
    toolbar.style.display = 'none';
    document.querySelector('.textChevron').style.display = 'block';
  }
}