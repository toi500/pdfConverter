# Text/Markdown to PDF Converter API

This project is a REST API that converts text or Markdown content into downloadable PDF files. The service provides both direct file downloads and shareable download links. Markdown input is automatically formatted in the PDF output with appropriate headings, text styles, and structure.

## Features

- Convert text and Markdown to downloadable PDF files
- Support for Markdown features:
  - Headers (H1, H2, H3)
  - Bold and italic text
  - Code blocks with proper formatting
  - Lists and blockquotes
- Simple REST API with two convenient endpoints
- Get either direct PDF download or a shareable download link
- Built using TypeScript and Express

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/text-to-pdf-converter.git
   ```

2. Navigate to the project directory:

   ```
   cd text-to-pdf-converter
   ```

3. Install the dependencies:

   ```
   npm install
   ```

### Usage

1. Start the server:

   ```
   npm start
   ```

2. The API will be available at `http://localhost:3000`

### PDF Storage and Retention

Generated PDFs are stored in:
- Local development: `/public/pdfs` directory
- Docker deployment: Volume mounted at `/app/public/pdfs`

**Important Notes:**
- PDFs are kept for 24 hours after generation
- Files are automatically cleaned up after this period
- Download links expire after 24 hours
- For permanent storage, download the PDF immediately or store it in your own system

### API Endpoints

1. **Direct PDF Download** - `/api/convert`
   
   Converts your text/Markdown and returns the PDF file immediately for download.

   ```json
   POST http://localhost:3000/api/convert
   Content-Type: application/json
   
   {
     "text": "# Your Markdown Title\n\nThis is a **bold** text and *italic* text.\n\n## Subtitle\n\nRegular paragraph text."
   }
   ```
   or
   ```json
   {
     "textInput": "# Your Markdown Title\n\nThis is a **bold** text and *italic* text."
   }
   ```
   Returns: PDF file directly for download

2. **Get Download Link** - `/api/convert-link`
   
   Converts your text/Markdown and returns a shareable download link for the PDF.

   ```json
   POST http://localhost:3000/api/convert-link
   Content-Type: application/json
   
   {
     "text": "# Your Markdown Title\n\nThis is a **bold** text and *italic* text."
   }
   ```
   Returns:
   ```json
   {
     "downloadLink": "http://localhost:3000/downloads/[unique-id].pdf"
   }
   ```

### Example Usage

Using fetch in JavaScript:
```javascript
// Direct PDF download
async function convertToPdf(text) {
  try {
    const response = await fetch('http://localhost:3000/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error('Failed to convert');
    
    const blob = await response.blob();
    // Use the blob as needed (download, display, etc.)
    return blob;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get download link
async function getDownloadLink(text) {
  try {
    const response = await fetch('http://localhost:3000/api/convert-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error('Failed to get download link');
    
    const data = await response.json();
    return data.downloadLink;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Docker Deployment

You can deploy this application using Docker in two ways:

#### Using Docker Compose (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Clone the repository
3. Run the following command:

```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`

#### Using Docker Directly

1. Build the Docker image:

```bash
docker build -t pdf-converter .
```

2. Run the container:

```bash
docker run -d -p 3000:3000 pdf-converter
```

The API will be available at `http://localhost:3000`

### License

This project is licensed under the MIT License. See the LICENSE file for more details.