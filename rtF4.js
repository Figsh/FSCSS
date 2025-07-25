/**
 * FSCSS Processing Script
 * 
 * Credit: 
 *   - EKUYIK SAM as Figsh (Publisher)
 *   - David-Hux (Writer)
 *   - Current User (Implementer)
 * 
 * Resources:
 *   - fscss-ttr on dev.to
 *   - Figsh on ekumedia.netlify.app, codepen.io, stackoverflow.com
 *   - npm package: fscss (npm install fscss)
 * 
 * Version: source v6, package v1+
 * Last Edited: 11:29pm Tue Jun 17 2025
 * 
 * Note: Use official npm package/CDN instead of copying this directly.
 *       Contact: Facebook (FSCSS) for support.
 */
const orderedxFscssRandom = {};
const exfMAX_DEPTH = 10;
function procRan(input) {
  return input.replace(/@random\(\[([^\]]+)\](?:, *ordered)?\)/g, (match, valuesStr) => {
    const isOrdered = /, *ordered\)/.test(match);
    const values = valuesStr.split(',').map(v => v.trim());
    
    if (values.length === 0) {
      console.warn("fscss[@random] Warning: Empty array provided for @random. Returning empty string.");
      return '';
    }
    
    if (isOrdered) {
      // Create consistent key for value sequences
      const sequenceKey = values.join(':');
      
      if (!orderedxFscssRandom[sequenceKey]) {
        orderedxFscssRandom[sequenceKey] = {
          values,
          index: 0,
        };
        console.warn(`fscss[@random] Warning: New ordered sequence created for [${valuesStr}].`);
      }
      
      const store = orderedxFscssRandom[sequenceKey];
      const val = store.values[store.index % store.values.length];
      
      if (store.index >= store.values.length && store.index % store.values.length === 0) {
        console.warn(`fscss[@random] Warning: Ordered sequence [${valuesStr}] is looping back to the beginning.`);
      }
      
      store.index++;
      return val;
    } else {
      // Regular random selection
      const randIndex = Math.floor(Math.random() * values.length);
      return values[randIndex];
    }
  });
}
function procFun(code) {
  const variables = {};

  function parseStyle(styleStr) {
    const props = {};
    const lines = styleStr.split(';');
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) {
        console.warn(`fscss[@fun] Invalid style line (missing colon): "${line}"`);
        continue;
      }
      const prop = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      if (prop) {
        props[prop] = value;
      } else {
        console.warn(`fscss[@fun] Empty property name in line: "${line}"`);
      }
    }
    return props;
  }

  const funRegex = /@fun\(([\w\-\_\—0-9]+)\)\s*\{([\s\S]*?)\}\s*/g;
  let funMatch;
  while ((funMatch = funRegex.exec(code)) !== null) {
    const varName = funMatch[1];
    const rawStyles = funMatch[2].trim();
    if (variables[varName]) {
      console.warn(`fscss[@fun] Duplicate @fun variable declaration: "${varName}". The last one will overwrite previous declarations.`);
    }
    variables[varName] = {
      raw: rawStyles,
      props: parseStyle(rawStyles)
    };
  }

  let processedCode = code;
  processedCode = processedCode.replace(/@fun\.([\w\-\_\—0-9]+)\.([\w\-\_\—0-9]+)\.value/g, (match, varName, prop) => {
    if (variables[varName] && variables[varName].props[prop]) {
      return variables[varName].props[prop];
    } else {
      console.warn(`fscss[@fun] Value extraction failed for "@fun.${varName}.${prop}.value". Variable or property not found.`);
    }
    return match;
  });
  processedCode = processedCode.replace(/@fun\.([\w\-\_\—0-9]+)\.([\w\-\_\—0-9]+)/g, (match, varName, prop) => {
    if (variables[varName] && variables[varName].props[prop]) {
      return `${prop}: ${variables[varName].props[prop]};`;
    } else {
      console.warn(`fscss[@fun] Single property rule failed for "@fun.${varName}.${prop}". Variable or property not found.`);
    }
    return match;
  });
  processedCode = processedCode.replace(/@fun\.([\w\-\_\—0-9]+)(?=[\s;}])/g, (match, varName) => {
    if (variables[varName]) {
      return variables[varName].raw;
    } else {
      console.warn(`fscss[@fun] Full variable block replacement failed for "@fun.${varName}". Variable not found.`);
    }
    return match;
  });
  processedCode = processedCode.replace(/@fun\(([\w\-\_\d\—]+)\s*\{[\s\S]*?\}\s*/g, '');
  processedCode = processedCode.replace(/^\s*[\r\n]/gm, '');
  processedCode = processedCode.trim();
return processedCode;
}
const arraysExfscss = {}; 
function procArr(input) {
    for (const key in arraysExfscss) delete arraysExfscss[key];
    const arrayRegex = /@arr\(([\w\-\_\—0-9]+)\[([^\]]+)\]\)/g;
    let match;
    while ((match = arrayRegex.exec(input)) !== null) {
        const arrayName = match[1];
        const arrayValues = match[2].split(',').map(item => item.trim());
        arraysExfscss[arrayName] = arrayValues;
    }
    let output = input.replace(/([^{}]*?)\{([^}]*?@arr\.([\w\-\_\—0-9]+)\[][^}]*?)\}/g,
        (fullMatch, selector, content, arrayName) => {
            if (!arraysExfscss[arrayName]) {
                console.warn(`fscss[@arr] Warning: Array '${arrayName}' not found for loop processing.`);
                return fullMatch;
            }

            return arraysExfscss[arrayName].map((value, index) => {
                const replacedSelector = selector.replace(`@arr.${arrayName}[]`, index + 1);
                const replacedContent = content.replace(
                    new RegExp(`@arr\\.${arrayName}\\[\\]`, 'g'),
                    value
                );
                return `${replacedSelector} {${replacedContent}}`;
            }).join('\n');
        });
    output = output.replace(/@arr\.([\w\-\_\—0-9]+)\[(\d+)\]/g,
        (fullMatch, arrayName, index) => {
            const idx = parseInt(index) - 1;
            if (!arraysExfscss[arrayName]) {
                console.warn(`fscss[@arr] Warning: Array '${arrayName}' not found for specific accessor.`);
            } else if (arraysExfscss[arrayName]?.[idx] === undefined) {
                console.warn(`fscss[@arr] Warning: Index ${index} out of bounds for array '${arrayName}'.`);
            }
            return arraysExfscss[arrayName]?.[idx] || fullMatch;
        });
    return output
        .replace(/@arr\(([\w\-\_\—0-9]+)\[([^\]]+)\]\)/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
function procP(text) {
  return text.replace(/%(\d+)\(([^[]+)\[\s*([^\]]+)\]\)/g, (match, number, properties, value) => {
    const propList = properties.split(',').map(p => p.trim());
    if (propList.length != number) {
      console.warn(`fscss: Number of properties ${propList.length} does not match %${number} in %${number}()`);
      return match;
    }
    return propList.map(prop => `${prop}${value}`).join("");
  });
}
function transformCssValues(css){let customProperties=new Set();let transformedCss=css;const copyRegex=/(:\s*)(["']?)(.*?)(["']?)\s*copy\(([-]?\d+),\s*([^\;^\)^\(^,^ ]*)\)/g;transformedCss=transformedCss.replace(copyRegex,(match,prefix,quote1,value,quote2,lengthStr,variableName)=>{const length=parseInt(lengthStr);let extractedValue='';if(length>=0){extractedValue=value.substring(0,length);}else{extractedValue=value.substring(value.length+length);}customProperties.add(`--${variableName.replace(/[^a-zA-Z0-9_-]/g,'')}:${extractedValue};`);return `${prefix}${quote1}${value}${quote2}`;});if(customProperties.size>0){const rootBlock=`:root{\n${Array.from(customProperties).join('\n')}\n}`;transformedCss+=`\n${rootBlock}`;}return transformedCss;} function repeatString(str,count){str=str.replace(/^['"]|['"]$/g,'');return str.repeat(Math.max(0,parseInt(count)))}function replaceRe(css) {
  const reRegex = /(?:store|str|re)\(\s*([^:,]+)\s*[,:]\s*(?:"([^"]*)"|'([^']*)')\s*\)/gi;
  const variableMap = new Map();
  let cleanedCss = css.replace(reRegex, (match, variable, dqValue, sqValue) => {
    const value = dqValue || sqValue;
    variable = variable.trim();
    variableMap.set(variable, value);
    return '';
  });
  if (variableMap.size === 0) return cleanedCss;
  let changed;
  let iterations = 0;
  const maxIterations = 5000;
  let current = cleanedCss;
  
  do {
    changed = false;
    for (const [variable, value] of variableMap.entries()) {
      const varRegex = new RegExp(`\\b${escapeRegExp(variable)}\\b`, 'g');
      const newCss = current.replace(varRegex, value);
      
      if (newCss !== current) {
        changed = true;
        current = newCss;
      }
    }
    iterations++;
  } while (changed && iterations < maxIterations);

  if (iterations >= maxIterations) {
    console.warn('Maximum iterations reached. Possible circular dependency.');
  }

  return current;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}|[\]\\]/g, '\\$&');
}
async function processImports(cssText, depth = 0, baseURL = window.location.href) { // Mark as async
  if (depth > exfMAX_DEPTH) {
    console.warn('Maximum import depth exceeded. Skipping further imports.');
    return cssText;
  }

  const importRegex = /@import\s*\(\s*exec\s*\(\s*((?:'[^']*'|"[^"]*"|[^'")]\S*)\s*)\)\s*\)/g;
  const matches = Array.from(cssText.matchAll(importRegex));

  if (matches.length === 0) return cssText;

  // Await the resolution of all import promises
  const fetchedContents = await Promise.all(
    matches.map(async (match) => {
      const [fullMatch, urlSpec] = match;
      try {
        const cleanUrl = urlSpec.replace(/^['"](.*)['"]$/, '$1').trim();
        const absoluteUrl = new URL(cleanUrl, baseURL).href;

        const response = await fetch(absoluteUrl); // Await fetch
        if (!response.ok) throw new Error(`HTTP ${response.status} for ${absoluteUrl}`);

        const importedText = await response.text(); // Await text()
        return processImports(importedText, depth + 1, absoluteUrl); // Recursive call should also be awaited if it were directly used, but here it's fine as it returns a Promise
      } catch (error) {
        console.error(`Failed to import "${urlSpec}" from "${baseURL}":`, error);
        return `/* Error importing "${urlSpec}": ${error.message} */`;
      }
    })
  );

  // Now, fetchedContents holds the actual processed CSS strings
  let lastIndex = 0;
  let result = '';
  matches.forEach((match, i) => {
    result += cssText.slice(lastIndex, match.index);
    result += fetchedContents[i]; // Use the resolved content
    lastIndex = match.index + match[0].length;
  });
  result += cssText.slice(lastIndex);

  return result;
}

// Fixed version: Proper async handling
async function procImp(css) {
  try {
    const processedCSS = await processImports(css); // Await the async processImports
    console.log(processedCSS);
    return processedCSS;
  } catch (error) {
    console.error('Processing failed:', error);
    console.warn(`fscss[@import] Warning: can't resolve imports`);
    return css; // Return original CSS as fallback
  }
}

// Update processStyles to await async operations
async function processStyles() {
  const styleElements = document.querySelectorAll('style');

  if (!styleElements.length) {
    console.warn('No <style> elements found.');
    return;
  }

  for (const element of styleElements) { // Use for...of to await inside loop
    let css = element.textContent;
    css = await procImp(css); // Await procImp
    css = procFun(css);
    css = procRan(css);
    css = procArr(css);
    css = transformCssValues(css);
    css = applyFscssTransformations(css);
    css = replaceRe(css);
    element.innerHTML = css;
  }
}
function processDrawElements() {
  document.querySelectorAll('.draw').forEach(element => {
    const originalColor = element.style.color || '#000';
    element.style.color = 'transparent';
    element.style.webkitTextStroke = `2px ${originalColor}`;
  });
}

// Main execution with error handling
(async () => { // Use an IIFE to await the top-level call
  try {
    await processStyles();
    await processDrawElements(); // This can run after styles are processed
  } catch (error) {
    console.error('Error processing styles or draw elements:', error);
  }
})();

