import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import i18n from './i18n'
import { readLanguage } from './services/profile'

// Initialize language from profile
(async () => {
  try {
    const lang = await readLanguage();
    i18n.changeLanguage(lang);
  } catch (error) {
    console.log("Could not load language preference, using default");
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
