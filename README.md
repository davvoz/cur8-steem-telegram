# CUR8 Posting

CUR8 Posting is a web application that allows users to manage and publish posts to the Steem blockchain. It provides an interface for creating, editing, and scheduling posts, as well as managing drafts and user accounts.

## Features

- User authentication with Steem accounts
- Create and publish posts to the Steem blockchain
- Save and manage post drafts
- Schedule posts for future publication
- Select communities for posting
- Upload and embed images in posts
- Preview posts in Markdown format
- Manage multiple Steem accounts

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Telegram Web App API
- Marked.js for Markdown parsing
- DOMPurify for HTML sanitization

## Setup and Installation

1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser.
3. Ensure you have an active internet connection for API calls and external resources.

## Usage

1. Log in with your Steem account username and posting key.
2. Use the navigation buttons to switch between drafts, posting, and account management.
3. Create new posts by filling in the title, body, and tags fields.
4. Save drafts for later editing or publish directly to the Steem blockchain.
5. Schedule posts for future publication using the date picker.
6. Select a community for your post using the community autocomplete feature.
7. Upload images by dragging and dropping or clicking on the image upload area.
8. Preview your post in Markdown format before publishing.
9. Manage your Steem accounts in the Account page.

## API Integration

The application interacts with a backend API hosted at `https://imridd.eu.pythonanywhere.com`. The `ApiClient` class handles all API requests, including:

- User authentication
- Post creation and publication
- Draft management
- Account management
- Image uploading

## Security

- The application uses DOMPurify to sanitize HTML content and prevent XSS attacks.
- Sensitive operations require user authentication.
- Posting keys are not stored locally and are only used for the duration of the session.

## Telegram Integration

The application is designed to work within the Telegram Web App environment. It uses the Telegram Web App API to retrieve user information when available.

## Contributing

Contributions to CUR8 Posting are welcome. Please ensure you follow the existing code style and submit pull requests for any new features or bug fixes.

## License

[Insert chosen license information here]

## Contact

For support or inquiries, please contact [Insert contact information here].
