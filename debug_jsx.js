// Simple script to help debug JSX structure
const fs = require('fs');

const content = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = content.split('\n');

// Find the main return statement (line 304)
let inMainReturn = false;
let openTags = [];
let errors = [];

for (let i = 303; i < lines.length; i++) { // Start from line 304 (0-indexed)
  const line = lines[i];
  const lineNum = i + 1;
  
  // Skip if we hit the end of the function
  if (line.trim() === '}' && openTags.length === 0) {
    break;
  }
  
  // Find opening tags
  const openMatches = line.match(/<(\w+)[^>]*(?<!\/)>/g);
  if (openMatches) {
    openMatches.forEach(match => {
      const tagName = match.match(/<(\w+)/)[1];
      openTags.push({ tag: tagName, line: lineNum });
      console.log(`Line ${lineNum}: Opening <${tagName}>`);
    });
  }
  
  // Find self-closing tags
  const selfClosingMatches = line.match(/<\w+[^>]*\/>/g);
  if (selfClosingMatches) {
    selfClosingMatches.forEach(match => {
      const tagName = match.match(/<(\w+)/)[1];
      console.log(`Line ${lineNum}: Self-closing <${tagName} />`);
    });
  }
  
  // Find closing tags
  const closeMatches = line.match(/<\/(\w+)>/g);
  if (closeMatches) {
    closeMatches.forEach(match => {
      const tagName = match.match(/<\/(\w+)>/)[1];
      console.log(`Line ${lineNum}: Closing </${tagName}>`);
      
      // Check if this closes the most recent open tag
      if (openTags.length === 0) {
        errors.push(`Line ${lineNum}: Unexpected closing tag </${tagName}>`);
      } else {
        const lastOpen = openTags[openTags.length - 1];
        if (lastOpen.tag === tagName) {
          openTags.pop();
        } else {
          errors.push(`Line ${lineNum}: Closing </${tagName}> doesn't match last opened <${lastOpen.tag}> at line ${lastOpen.line}`);
        }
      }
    });
  }
}

console.log('\n=== UNCLOSED TAGS ===');
openTags.forEach(tag => {
  console.log(`Line ${tag.line}: Unclosed <${tag.tag}>`);
});

console.log('\n=== ERRORS ===');
errors.forEach(error => {
  console.log(error);
});