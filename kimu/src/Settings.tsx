export default function Settings() {
  return (
    <div className="settings-page">
      <section className="settings-section">
        <h2 className="settings-section-title">CLI Usage Guide</h2>
        <p className="settings-description">
          Use the Kimu CLI to inject secrets from your OS keychain into any command
          at runtime, keeping your <code>.env</code> files free of raw secrets.
        </p>

        <div className="settings-step">
          <h3>1. Store your secrets via the GUI</h3>
          <p className="settings-description">
            Use the Key Viewer to add secrets like <code>DB_PASSWORD</code> or <code>API_KEY</code>.
            They are stored securely in your OS keychain.
          </p>
        </div>

        <div className="settings-step">
          <h3>2. Reference secrets in your .env file</h3>
          <p className="settings-description">
            Instead of writing raw values, use the <code>{"SECRET{{KEY_NAME}}"}</code> placeholder syntax:
          </p>
          <pre className="code-block">
{`# .env
DATABASE_URL=postgres://user:SECRET{{DB_PASSWORD}}@localhost/mydb
API_KEY=SECRET{{STRIPE_KEY}}
NODE_ENV=development`}
          </pre>
        </div>

        <div className="settings-step">
          <h3>3. Run your command through Kimu</h3>
          <pre className="code-block">
{`# Basic usage
kimu run -- npm run dev

# With a custom .env path
kimu run --env-file .env.local -- npm run dev`}
          </pre>
          <p className="settings-description">
            Kimu reads the <code>.env</code> file, resolves each <code>{"SECRET{{...}}"}</code> placeholder
            from the OS keychain, and injects the real values as environment variables
            into the spawned process. The raw secrets never touch disk.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">About</h2>
        <div className="about-grid">
          <div className="about-item">
            <span className="about-label">Version</span>
            <span className="about-value">0.1.0</span>
          </div>
          <div className="about-item">
            <span className="about-label">Storage</span>
            <span className="about-value">OS Keychain</span>
          </div>
          <div className="about-item">
            <span className="about-label">Platform</span>
            <span className="about-value">Tauri v2</span>
          </div>
        </div>
      </section>
    </div>
  );
}
