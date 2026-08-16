const fs = require('fs');
const html = fs.readFileSync('design/F.QUAD Website.dc.html', 'utf8');

const scriptMatch = html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    const jsCode = scriptMatch[1];
    try {
        // Just checking syntax
        new Function(jsCode);
        console.log("No syntax errors found.");
    } catch (e) {
        console.error("Syntax Error:", e.message);
    }
} else {
    console.log("No script tag found.");
}
