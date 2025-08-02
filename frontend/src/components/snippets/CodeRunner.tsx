import React from 'react';

interface CodeRunnerProps {
  code: string; // The HTML/JS from your snippet
  language: string;
}

const CodeRunner: React.FC<CodeRunnerProps> = ({ code, language }) => {
  // We'll construct a full HTML document to run the code
  const createDocument = () => {
    if (language === 'html') {
      return code;
    }
    // If it's just JavaScript, wrap it in a basic HTML structure with a script tag
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Snippet Runner</title>
        </head>
        <body>
          <script>${code}</script>
        </body>
      </html>
    `;
  };

  return (
    <iframe
      srcDoc={createDocument()}
      title="Code Snippet Output"
      sandbox="allow-scripts" // Allows scripts but blocks risky actions like top-level navigation
      width="100%"
      height="100%"
      style={{ border: 'none', backgroundColor: 'white' }}
    />
  );
};

export default CodeRunner;