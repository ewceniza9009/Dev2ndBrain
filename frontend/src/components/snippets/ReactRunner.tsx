/**
 * Creates a new browser window and runs the provided React (TSX) code within it.
 * It uses in-browser transpilation via Babel Standalone.
 * @param code The TSX code from the snippet. Must define a root component named 'App'.
 */
export const openReactRunnerWindow = (code: string) => {
  // Construct a full HTML document to host the React app
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>React Snippet Runner</title>
        <style>
          body { font-family: sans-serif; background-color: #f0f2f5; margin: 0; padding: 1.5rem; }
          #root { background-color: #fff; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        </style>
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      </head>
      <body>
        <div id="root"></div>

        <script type="text/babel" data-presets="react,typescript">
          // --- Your Snippet Code Starts Here ---
          ${code}
          // --- Your Snippet Code Ends Here ---

          // --- Bootstrap code to render the component ---
          // IMPORTANT: Your snippet must export a default component or define a component named 'App'.
          try {
            const container = document.getElementById('root');
            const root = ReactDOM.createRoot(container);
            
            // Check for a default export first, then a named 'App' component.
            const Component = typeof App !== 'undefined' ? App : null;
            if (Component) {
                 root.render(React.createElement(Component));
            } else {
                 container.innerHTML = '<h2>Error: Snippet must define a root component named "App".</h2><p>Example: <code>function App() { return <h1>Hello!</h1>; }</code></p>';
            }
          } catch (e) {
            const container = document.getElementById('root');
            container.innerHTML = '<h2>Runtime Error</h2><pre style="color:red;">' + e.message + '</pre>';
            console.error(e);
          }
        </script>
      </body>
    </html>
  `;

  const newWindow = window.open('about:blank', '_blank');

  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  } else {
    alert("Please disable your popup blocker to run the React sandbox.");
  }
};