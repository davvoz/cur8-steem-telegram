import { displayResult } from "../components/dialog.js";

const toolbar = document.getElementById('toolbar');
const buttons = [
  { style: 'bold', text: 'B', title: 'Bold' },
  { style: 'italic', text: 'I', title: 'Italic' },
  { style: 'heading', text: 'H', title: 'Heading' },
  { style: 'underline', text: 'U', title: 'Underline' },
  { style: 'strikethrough', text: 'S', title: 'Strikethrough' },
  { style: 'quote', text: '"', title: 'Quote' },
  { style: 'orderedList', text: '1.', title: 'Ordered List' },
  { style: 'unorderedList', text: '•', title: 'Unordered List' },
  { style: 'image', text: '🖼️', title: 'Insert Image' },
  { style: 'link', text: '🔗', title: 'Insert Link' },
  { style: 'table', text: '☷', title: 'Insert Table' },
  { style: 'code', text: '⟨⟩', title: 'Code' },
  { style: 'help', text: '?', title: 'Help' }
];

document.addEventListener('DOMContentLoaded', initializeButtons);

function initializeButtons() {
  buttons.forEach(({ style, text, title }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.onclick = () => textFormatter.applyStyle(style);
    button.title = title;
    button.innerHTML = text;
    toolbar.appendChild(button);
  });

  const chevron = document.createElement('span');
  chevron.className = 'chevron';
  chevron.innerHTML = '❮';
  chevron.onclick = toggleToolbar;

  const toolbarContainer = document.getElementById('toolbarContainer');
  toolbarContainer.appendChild(toolbar);

  const chevronContainer = document.getElementById('chevronContainer');
  const textChevron = document.createElement('span');
  textChevron.className = 'textChevron';
  textChevron.innerHTML = 'Markdown Toolbar';
  chevronContainer.appendChild(textChevron);

  toolbarContainer.appendChild(chevron);
  toolbar.style.display = 'none';

}

class TextFormatter {
  constructor(postBody) {
    this.postBody = postBody;
    this.styleMap = {
      bold: this.formatBold,
      italic: this.formatItalic,
      heading: this.formatHeading,
      underline: this.formatUnderline,
      strikethrough: this.formatStrikethrough,
      quote: this.formatQuote,
      orderedList: this.formatOrderedList,
      unorderedList: this.formatUnorderedList,
      image: this.insertImage,
      link: this.insertLink,
      table: this.insertTable,
      code: this.formatCode,
      help: this.showHelp
    };
  }

  applyStyle(style) {
    const formatFunction = this.styleMap[style];
    if (formatFunction) {
      formatFunction.call(this);
    }
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
    const { start, end } = this.getSelectedText();
    this.postBody.value = this.postBody.value.substring(0, start) + replacement + this.postBody.value.substring(end);
    this.postBody.focus();
  }

  formatBold() {
    const { selection } = this.getSelectedText();
    this.replaceSelection(`**${selection}**`);
  }

  formatItalic() {
    const { selection } = this.getSelectedText();
    this.replaceSelection(`*${selection}*`);
  }

  formatHeading() {
    const { selection } = this.getSelectedText();
    this.replaceSelection(`# ${selection}`);
  }

  formatUnderline() {
    const { selection } = this.getSelectedText();
    this.replaceSelection(`<u>${selection}</u>`);
  }

  formatStrikethrough() {
    const { selection } = this.getSelectedText();
    this.replaceSelection(`~~${selection}~~`);
  }

  formatQuote() {
    const { selection } = this.getSelectedText();
    this.replaceSelection(`> ${selection}`);
  }

  formatOrderedList() {
    const { selection } = this.getSelectedText();
    this.replaceSelection(`1. ${selection}`);
  }

  formatUnorderedList() {
    const { selection } = this.getSelectedText();
    this.replaceSelection(`- ${selection}`);
  }

  insertImage() {
    const { selection } = this.getSelectedText();
    const imageUrl = prompt("Enter image URL:");
    if (imageUrl) {
      this.replaceSelection(`![${selection || 'Image description'}](${imageUrl})`);
    }
  }

  insertLink() {
    const { selection } = this.getSelectedText();
    Swal.fire({
      title: 'Insert link',
      html: `
        <input type="text" id="linkText" class="swal2-input" placeholder="Link Text" value="${selection || ''}">
        <input type="text" id="linkUrl" class="swal2-input" placeholder="URL">
      `,
      showCancelButton: true,
      confirmButtonText: 'Insert',
      background: 'var(--background)',
      preConfirm: () => {
        const linkText = document.getElementById('linkText').value;
        const linkUrl = document.getElementById('linkUrl').value;
        if (!linkText || !linkUrl) {
          Swal.showValidationMessage('Please fill in both fields');
        }
        return { linkText, linkUrl };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { linkText, linkUrl } = result.value;
        this.replaceSelection(`[${linkText}](${linkUrl})`);
      }
    });
  }

  showHelp() {
    const helpTitle = 'Markdown Cheat Sheet';
    const helpItems = [
      { testo: '**Bold** or __Bold__', bottone: 'B' },
      { testo: '*Italic* or _Italic_', bottone: 'I' },
      { testo: '# Heading 1', bottone: 'H' },
      { testo: '## Heading 2', bottone: 'H' },
      { testo: '> Blockquote', bottone: '"' },
      { testo: '- Unordered list', bottone: '•' },
      { testo: '1. Ordered list', bottone: '1.' },
      { testo: '[Link](url)', bottone: '🔗' },
      { testo: '![Image](image-url)', bottone: '🖼️' },
      { testo: '`Inline code`', bottone: '⟨⟩' },
      { testo: '```<br>Code block<br>```', bottone: '⟨⟩' },
      { testo: '| Table | Header |<br>|-------|--------|<br>| Cell  | Cell   |', bottone: '☷' }

    ];
    const helpMessage = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; ">
        ${helpItems.map(({ testo, bottone }) => `
          <div style="flex: 1 1 25%; border: 2px solid var(--primary-color); border-radius: 10px; background: var(--background); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 1.2em; margin-bottom: 10px; text-align: center;">
              <span style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background: var(--primary-color); color: white; font-weight: bold; font-size: 1em;">
                ${bottone}
              </span>
            </p>
            <p style="text-align: center; font-size: 0.8em; color: var(--on-background);">
              ${testo}
            </p>
          </div>
        `).join('')}
      </div>
    `;
    displayResult({ title: helpTitle, message: helpMessage, neverClose: true }, 'custom', true, () => { });
  }

  insertTable() {
    this.replaceSelection(`| Header | Header |\n|--------|--------|\n| Cell   | Cell   |`);
  }

  formatCode() {
    const { selection } = this.getSelectedText();
    const replacement = selection.includes('\n') ? `\`\`\`\n${selection}\n\`\`\`` : `\`${selection}\``;
    this.replaceSelection(replacement);
  }
}

const textFormatter = new TextFormatter(document.getElementById('postBody'));


export function toggleToolbar() {
  const chevron = document.querySelector('.chevron');
  toolbar.classList.toggle('expanded');
  chevron.classList.toggle('rotated');
  chevron.innerHTML = toolbar.classList.contains('expanded') ? '❯' : '❮';

  //nascondiamo la toolbar se è aperta se no la mostriamo
  if (toolbar.classList.contains('expanded')) {
    toolbar.style.display = 'flex';
    //il testo scompare 
    document.querySelector('.textChevron').style.display = 'none';

  } else {
    toolbar.style.display = 'none';
    document.querySelector('.textChevron').style.display = 'block';
  }

}
