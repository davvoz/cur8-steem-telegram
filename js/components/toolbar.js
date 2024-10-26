export function applyStyle(style) {
    const start = postBody.selectionStart;
    const end = postBody.selectionEnd;
    const selection = postBody.value.substring(start, end);

    let replacement = '';
    switch(style) {
      case 'bold':
        replacement = `**${selection}**`;
        break;
      case 'italic':
        replacement = `*${selection}*`;
        break;
      case 'heading':
        replacement = `# ${selection}`;
        break;
      case 'underline':
        replacement = `<u>${selection}</u>`;
        break;
      case 'strikethrough':
        replacement = `~~${selection}~~`;
        break;
      case 'quote':
        replacement = `> ${selection}`;
        break;
      case 'orderedList':
        replacement = `1. ${selection}`;
        break;
      case 'unorderedList':
        replacement = `- ${selection}`;
        break;
      case 'image':
        const imageUrl = prompt("Enter image URL:");
        if (imageUrl) {
          replacement = `![${selection || 'Image description'}](${imageUrl})`;
        }
        break;
      case 'link':
          Swal.fire({
            title: 'Insert link',
            html: `
                <input type="text" id="linkText" class="swal2-input" placeholder="Link Text" value="${selection || ''}">
                <input type="text" id="linkUrl" class="swal2-input" placeholder="URL">
            `,
            showCancelButton: true,
            confirmButtonText: 'Insert',
            cancelButtonText: 'Cancel',
            background: 'var(--background)',
            preConfirm: () => {
                const linkText = document.getElementById('linkText').value;
                const linkUrl = document.getElementById('linkUrl').value;
                if (!linkText || !linkUrl) {
                    Swal.showValidationMessage('Please fill in both fields');
                }
                return { linkText, linkUrl }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { linkText, linkUrl } = result.value;
                replacement = `[${linkText}](${linkUrl})`;
                postBody.value = postBody.value.substring(0, start) + replacement + postBody.value.substring(end);
                postBody.focus();
                // updatePreview();
            }
        });
        return;
      case 'table':
        replacement = `| Header | Header |\n|--------|--------|\n| Cell   | Cell   |`;
        break;
      case 'code':
        replacement = selection.includes('\n') ? 
          `\`\`\`\n${selection}\n\`\`\`` : 
          `\`${selection}\``;
        break;
    }

    if (replacement) {
      postBody.value = postBody.value.substring(0, start) + replacement + postBody.value.substring(end);
      postBody.focus();
      // updatePreview();
    }
  }

  export function showHelp() {
    alert(`Markdown Cheat Sheet:

**Bold** or __Bold__
*Italic* or _Italic_
# Heading 1
## Heading 2
> Blockquote
- Unordered list
1. Ordered list
[Link](url)
![Image](image-url)
\`Inline code\`
\`\`\`
Code block
\`\`\`
| Table | Header |
|-------|--------|
| Cell  | Cell   |`);
  }

  export function toggleToolbar() {
    const toolbar = document.getElementById('toolbar');
    const chevron = document.querySelector('.chevron');
    toolbar.classList.toggle('expanded');
    chevron.classList.toggle('rotated');
  }


window.applyStyle = applyStyle;
window.showHelp = showHelp;
window.toggleToolbar = toggleToolbar;