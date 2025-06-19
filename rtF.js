import { exec } from "https://cdn.jsdelivr.net/npm/fscss@1.1.6/e/xfscss.min.js";

const DEBUG = true;

// Collect all stylesheet URLs from <link> elements
const fscssStyleURL = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
  .map(link => {
    const href = link.getAttribute('href');
    if (DEBUG) {
      console.log(`🔍 Found stylesheet: ${href}`);
    }
    return href;
  })
  .filter(href => href); // Remove any null/undefined hrefs

function applyFSCSS({ type, content }) {
  if (!content || (Array.isArray(content) && content.length === 0)) {
    console.error("❌ No stylesheets provided to applyFSCSS");
    return;
  }

  // If content is an array (multiple URLs), process each
  const stylesheets = Array.isArray(content) ? content : [content];

  stylesheets.forEach((stylesheetUrl, index) => {
    if (DEBUG) {
      console.log(`🚀 Applying stylesheet ${index + 1}/${stylesheets.length}: ${stylesheetUrl}`);
    }

    exec({
      type,
      content: stylesheetUrl,
      onSuccess: (styleElement) => {
        if (DEBUG) {
          console.log(`✅ Successfully applied stylesheet: ${stylesheetUrl}`);
          console.log(`📄 Style element details:`, styleElement);
        }
      },
      onError: (error) => {
        console.error(`❌ Failed to apply stylesheet: ${stylesheetUrl}`);
        console.error(`🔍 Error details:`, error.message || error);
        console.error(`📋 Stack trace:`, error.stack || 'No stack trace available');
      }
    });
  });
}

// Apply all collected stylesheets
if (fscssStyleURL.length > 0) {
  if (DEBUG) {
    console.log(`📦 Total stylesheets to apply: ${fscssStyleURL.length}`);
  }
  applyFSCSS({
    type: "URL",
    content: fscssStyleURL
  });
} else {
  console.warn("⚠️ No stylesheets found in the document");
}
