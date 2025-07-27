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
function procNum(css){
const regex = /num\((.*?)\)/g;
function evaluateExpression(expression) {
  try {
    return eval(expression);
  } catch (e) {
    console.error('Invalid expression:', expression);
    return expression;
  }
}

const processedCSS = css.replace(regex, (match, expression) => {
  
  return evaluateExpression(expression);
});

return (processedCSS);
  }
const arraysExfscss = {}; // Renamed the global variable
const orderedxFscssRandom = {};

const exfMAX_DEPTH = 10; // Prevent infinite recursion
function procEv(css) {
  function extractBlock(str, start) {
    if (str[start] !== '{') return null;
    let count = 1;
    let current = start + 1;
    while (current < str.length && count > 0) {
      if (str[current] === '{') count++;
      else if (str[current] === '}') count--;
      current++;
    }
    if (count !== 0) {
      console.warn(`fscss[@event] Warning: Unbalanced curly braces starting at index ${start}.`);
      return null;
    }
    return {
      content: str.substring(start + 1, current - 1),
      endIndex: current
    };
  }

  function parseConditionBlocks(block) {
    const regex = /(if|el-if|el)\s*(.*?){/g;
    const blocks = [];
    let match;

    while ((match = regex.exec(block)) !== null) {
      const type = match[1];
      const condition = match[2].trim();
      const blockStart = match.index + match[0].length - 1;

      const innerBlock = extractBlock(block, blockStart);
      if (!innerBlock) {
        console.warn(`fscss[@event] Warning: Could not extract inner block for condition '${condition}' starting at index ${blockStart}.`);
        continue;
      }

      blocks.push({
        type,
        condition,
        block: innerBlock.content
      });

      regex.lastIndex = blockStart + innerBlock.content.length + 2;
    }

    return blocks;
  }

  const functionMap = {};
  const funcDefRegex = /@event\s+([\w-]+)\(([^)]+)\)\s*:?{/g;
  let funcMatch;
  let modifiedCSS = css;
  let offset = 0; // To adjust for string manipulations

  // First pass: extract function definitions and remove them from the CSS
  while ((funcMatch = funcDefRegex.exec(css)) !== null) {
    const [fullMatch, funcName, args] = funcMatch;
    const arg = args.trim();
    const startIdx = funcMatch.index + fullMatch.length - 1;

    const blockData = extractBlock(css, startIdx);
    if (!blockData) {
      console.warn(`fscss[@event] Warning: Could not extract block for event definition '${funcName}' starting at index ${startIdx}.`);
      continue;
    }

    const conditionBlocks = parseConditionBlocks(blockData.content);
    functionMap[funcName] = { arg, conditionBlocks };

    // Remove the processed @event definition from the CSS
    const replacementStart = funcMatch.index + offset;
    const replacementEnd = blockData.endIndex + offset;
    modifiedCSS = modifiedCSS.substring(0, replacementStart) +
                   modifiedCSS.substring(replacementEnd);

    // Adjust the offset for subsequent regex matches in the original string
    offset -= (blockData.endIndex - funcMatch.index);
  }

  // Second pass: replace @event calls with their evaluated values
  modifiedCSS = modifiedCSS.replace(/@event\.([\w-]+)\(([^)]*)\)/g, (match, funcName, argValue) => {
    argValue = argValue.trim();
    const func = functionMap[funcName];
    if (!func) {
      console.warn(`fscss[@event] Warning: Event function '${funcName}' not found.`);
      return match; // Return original match if function not found
    }

    let result = '';
    let matched = false;

    for (const block of func.conditionBlocks) {
      if (matched) break; // If a condition has already matched, stop

      const parts = block.condition.split(':').map(s => s.trim());
      const condVar = parts[0];
      const condVal = parts.length > 1 ? parts[1] : '';

      if (block.type === 'if' || block.type === 'el-if') {
        if (condVar === func.arg && condVal === argValue) {
          matched = true;
        }
      } else if (block.type === 'el') {
        matched = true;
      }

      if (matched) {
        // Look for `e: value;` or any variable name followed by colon and value
        const assignMatch = block.block.match(/(?:[a-zA-Z_]\w*)\s*:\s*([^;]+);/);
        if (assignMatch) {
          result = assignMatch[1].trim();
        } else {
          console.warn(`fscss[@event] Warning: No assignment found in block for condition '${block.condition}' in function '${funcName}'.`);
        }
        break; // A condition matched, so we stop
      }
    }

    if (!matched) {
      console.warn(`fscss[@event] Warning: No condition matched for event call '${funcName}(${argValue})'.`);
    }

    return result || match; // Return the result or the original match if no result was found
  });

  return modifiedCSS;
}
function initlibraries(css){
   return css;
}
function procVar(vcss){
function processSCSS(scssCode) {
  const globalVars = {};
  let currentScopeVars = globalVars; // Initially global scope
  const processedLines = [];
  const lines = scssCode.split('\n');

  // To manage nested scopes (simplified: just track if we're inside a block)
  let inBlock = false;
  const blockVars = {}; // Variables declared within the current block

  // Step 1: Process lines to extract variables and build up processed CSS
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Check for block entry
    if (line.includes('{')) {
      inBlock = true;
      // When entering a block, any variables declared within it will go into blockVars
      // The blockVars will be cleared when the block is exited
      processedLines.push(line); // Add the curly brace to processed lines
      continue; // Move to next line
    }

    // Check for block exit
    if (line.includes('}')) {
      inBlock = false;
      // Clear block-level variables when exiting a block
      for (const varName in blockVars) {
        delete blockVars[varName]; // Remove block-scoped variables
      }
      processedLines.push(line); // Add the curly brace to processed lines
      continue; // Move to next line
    }

    // Regex to match variable declarations (e.g., $primary-color: midnightblue;)
    const varDeclarationRegex = /^\s*\$([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/;
    const varMatch = line.match(varDeclarationRegex);

    if (varMatch) {
      const [, varName, varValue] = varMatch;
      if (inBlock) {
        blockVars[varName] = varValue.trim();
      } else {
        globalVars[varName] = varValue.trim();
      }
      // This line is a declaration, so don't include it in the final CSS output
      continue; // Move to next line
    }

    // Regex to match variable usage (e.g., $primary-color or $primary-color!)
    const varUsageRegex = /\$\/?([a-zA-Z0-9_-]+)(!)?/g;

    // Replace variable references in the current line
    line = line.replace(varUsageRegex, (match, varName) => {
      // Prioritize block-scoped variables, then global variables
      if (blockVars[varName] !== undefined) {
        return blockVars[varName];
      } else if (globalVars[varName] !== undefined) {
        return globalVars[varName];
      }
      return match; // If variable not found, return original match (e.g., for non-existent variables)
    });

    processedLines.push(line);
  }

  // Step 2: Function to access variable values (for external access)
  function getVariable(varName) {
    // This function will only return global variables for external access,
    // as local variables are transient during processing.
    // If you need to expose local variables, you'd need a more complex
    // data structure to store them along with their scope.
    return globalVars[varName] || null;
  }

  // Join the processed lines back into a single CSS string
  const finalCss = processedLines.join('\n');

  return {
    css: finalCss,
    getVariable
  };
}


const result = processSCSS(vcss);
// Output the processed CSS
 return result.css
} 

function procExt(css) {
  let extractedVariables = {};
  let tempCSS = css;

  // Step 1: Process string literals
  tempCSS = tempCSS.replace(/("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')/g, function(fullMatch) {
    let quote = fullMatch[0];
    let content = fullMatch.slice(1, -1);
    const directiveRegex = /@ext\((-?\d+),(\d+):\s*([^)]+)\)/g;
    let match;
    let directivesToProcess = [];

    while ((match = directiveRegex.exec(content)) !== null) {
      directivesToProcess.push({
        fullMatch: match[0],
        start: parseInt(match[1]),
        length: parseInt(match[2]),
        varName: match[3].trim(),
        index: match.index
      });
    }

    for (let i = directivesToProcess.length - 1; i >= 0; i--) {
      let d = directivesToProcess[i];
      let s = d.start < 0 ? content.length + d.start : d.start;
      s = Math.max(0, s);
      let extracted = content.substring(s, s + d.length);

      if (s + d.length > content.length || s < 0) {
        console.warn(`fscss:[@ext]Warning: @ext directive for variable '${d.varName}' in string literal specifies an out-of-bounds range. Extraction may be incomplete or incorrect.`);
      }

      if (extractedVariables[d.varName] !== undefined) {
        console.warn(`fscss:[@ext]Warning: Duplicate variable name '${d.varName}' found in string literal. The last extracted value will be used.`);
      }
      extractedVariables[d.varName] = extracted;

      // Remove @ext from content
      content = content.slice(0, d.index) + content.slice(d.index + d.fullMatch.length);
    }

    return quote + content + quote;
  });

  // Step 2: Outside strings
  tempCSS = tempCSS.replace(/([#.\w-]+)\s*@ext\((-?\d+),(\d+):\s*([^)]+)\)/g, function(match, token, start, len, varName) {
    start = parseInt(start);
    len = parseInt(len);
    varName = varName.trim();
    let s = start < 0 ? token.length + start : start;
    s = Math.max(0, s);
    let extracted = token.substring(s, s + len);

    if (s + len > token.length || s < 0) {
      console.warn(`fscss:[@ext]Warning: @ext directive for variable '${varName}' on token '${token}' specifies an out-of-bounds range. Extraction may be incomplete or incorrect.`);
    }

    if (extractedVariables[varName] !== undefined) {
      console.warn(`fscss:[@ext]Warning: Duplicate variable name '${varName}' found outside string literals. The last extracted value will be used.`);
    }
    extractedVariables[varName] = extracted;
    return token;
  });

  // Step 3: Replace @ext.varName references
  tempCSS = tempCSS.replace(/@ext\.(\w+)\!?/g, function(match, varName) {
    if (extractedVariables[varName] === undefined) {
      console.warn(`fscss:[@ext]Warning: Reference to undefined variable '@ext.${varName}'. It will not be replaced.`);
      return match;
    }
    return extractedVariables[varName];
  });

  return tempCSS;
}


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
function procArr(input) {
    // Clear previous arrays
    for (const key in arraysExfscss) delete arraysExfscss[key];

    // Parse array declarations
    const arrayRegex = /@arr(?:\(|\s+)([\w\-\_\—0-9]+)\[([^\]]+)\]\)?/g;
    let match;
    while ((match = arrayRegex.exec(input)) !== null) {
        const arrayName = match[1];
        const arrayValues = match[2].split(',').map(item => item.trim());
        arraysExfscss[arrayName] = arrayValues;
    }

    // Process array loops
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

    // Process specific array accessors (@arr.name[index])
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

    // Remove array declarations and comments
    return output
        .replace(/@arr(?:\(|\s+)([\w\-\_\—0-9]+)\[([^\]]+)\]\)?/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
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

  // Handle value extraction (e.g., @fun.varname2.bg.value)
  processedCode = processedCode.replace(/@fun\.([\w\-\_\—0-9]+)\.([\w\-\_\—0-9]+)\.value\!?/g, (match, varName, prop) => {
    if (variables[varName] && variables[varName].props[prop]) {
      return variables[varName].props[prop];
    } else {
      console.warn(`fscss[@fun] Value extraction failed for "@fun.${varName}.${prop}.value". Variable or property not found.`);
    }
    return match;
  });

  // Handle single property rule (e.g., @fun.varname2.background)
  processedCode = processedCode.replace(/@fun\.([\w\-\_\—0-9]+)\.([\w\-\_\—0-9]+)\!?/g, (match, varName, prop) => {
    if (variables[varName] && variables[varName].props[prop]) {
      return `${prop}: ${variables[varName].props[prop]};`;
    } else {
      console.warn(`fscss[@fun] Single property rule failed for "@fun.${varName}.${prop}". Variable or property not found.`);
    }
    return match;
  });

  // Handle full variable block (e.g., @fun.varname2)
  processedCode = processedCode.replace(/@fun\.([\w\-\_\—0-9]+)(?=[\s;}])\!?/g, (match, varName) => {
    if (variables[varName]) {
      return variables[varName].raw;
    } else {
      console.warn(`[@fun] Full variable block replacement failed for "@fun.${varName}". Variable not found.`);
    }
    return match;
  });

  // Clean up code
  processedCode = processedCode.replace(/@fun\(([\w\-\_\d\—]+)\s*\{[\s\S]*?\}\s*/g, '');
  processedCode = processedCode.replace(/^\s*[\r\n]/gm, '');
  processedCode = processedCode.trim();

  return processedCode;
}

// Extracts values using copy() and creates CSS custom properties
function flattenNestedCSS(css, options = {}) {
  const {
    preserveComments = false,
    indent = '  ',
    validate = true,
    errorHandler = (msg) => console.warn(msg),
  } = options;

  // Remove comments unless preserved
  if (!preserveComments) {
    css = css.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  }

  function isValidSelector(selector) {
    // Allow modern CSS features (:has(), > selector, etc.)
    return selector && selector.trim() !== '' && 
           !/[^a-zA-Z0-9\-_@*.\#:,\s>&~+()\[\]'"]|\/\//.test(selector);
  }

  function isValidProperty(prop) {
    const [name, ...rest] = prop.split(':').map(s => s.trim());
    return !validate || /^(--|[\w-]+)$/.test(name);
  }

  function parseBlock(css, start, parentSelector = '') {
    let output = '';
    let pos = start;
    const stack = [];
    let current = '';
    let inString = false;
    let quote = null;
    let depth = 0;

    while (pos < css.length) {
      const char = css[pos];
      
      if (char === '\\' && inString) {
        current += char;
        pos++;
        if (pos < css.length) {
          current += css[pos];
        }
        pos++;
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        quote = char;
        current += char;
      } else if (char === quote && inString) {
        inString = false;
        quote = null;
        current += char;
      } else if (char === '{' && !inString) {
        if (depth === 0) {
          const selector = current.trim();
          current = '';
          stack.push({ selector, parent: parentSelector });
        } else {
          current += char;
        }
        depth++;
      } else if (char === '}' && !inString) {
        depth--;
        if (depth === 0) {
          const block = stack.pop();
          if (!block) continue;
          
          let fullSelector = '';
          if (block.selector.includes('&')) {
            fullSelector = block.selector.replace(/&/g, block.parent);
          } else {
            fullSelector = block.parent ? `${block.parent} ${block.selector}` : block.selector;
          }
          
          // Parse nested content
          const nested = parseNestedContent(current, fullSelector);
          
          if (nested.properties.length > 0 || nested.keyframes.length > 0) {
            output += `${fullSelector} {\n`;
            if (nested.properties.length > 0) {
              output += indent + nested.properties.join(`;\n${indent}`) + ';\n';
            }
            output += nested.keyframes.join('\n');
            output += '}\n\n';
          }
          
          output += nested.nestedBlocks;
          current = '';
        } else {
          current += char;
        }
      } else if (char === '@' && !inString && depth === 0) {
        // Handle at-rules at root level
        const atRuleEnd = findAtRuleEnd(css, pos);
        if (atRuleEnd === -1) break;
        
        output += css.substring(pos, atRuleEnd).trim() + '\n\n';
        pos = atRuleEnd;
        continue;
      } else {
        current += char;
      }
      
      pos++;
    }

    return { output, pos };
  }

  function findAtRuleEnd(css, start) {
    let depth = 0;
    let inString = false;
    let quote = null;
    let pos = start;
    
    while (pos < css.length) {
      const char = css[pos];
      
      if (char === '\\' && inString) {
        pos += 2;
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        quote = char;
      } else if (char === quote && inString) {
        inString = false;
        quote = null;
      } else if (char === '{' && !inString) {
        depth++;
      } else if (char === '}' && !inString) {
        depth--;
        if (depth === 0) {
          return pos + 1;
        }
      }
      
      pos++;
    }
    
    return -1;
  }

  function parseNestedContent(content, parentSelector) {
    const result = {
      properties: [],
      nestedBlocks: '',
      keyframes: []
    };
    
    let current = '';
    let inString = false;
    let quote = null;
    let depth = 0;
    let pos = 0;
    
    while (pos < content.length) {
      const char = content[pos];
      
      if (char === '\\' && inString) {
        current += char;
        pos++;
        if (pos < content.length) {
          current += content[pos];
        }
        pos++;
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        quote = char;
        current += char;
      } else if (char === quote && inString) {
        inString = false;
        quote = null;
        current += char;
      } else if (char === '{' && !inString) {
        depth++;
        current += char;
      } else if (char === '}' && !inString) {
        depth--;
        current += char;
        if (depth === 0) {
          // Found a complete nested block
          const block = parseBlock(current, 0, parentSelector).output;
          result.nestedBlocks += block;
          current = '';
        }
      } else if (char === ';' && !inString && depth === 0) {
        // Property handling
        const prop = current.trim();
        if (prop) {
          if (isValidProperty(prop)) {
            result.properties.push(prop);
          } else if (validate) {
            errorHandler(`Invalid property: ${prop}`);
          }
        }
        current = '';
      } else if (char === '@' && !inString && depth === 0) {
        // Handle keyframes inside blocks
        const atEnd = findAtRuleEnd(content, pos);
        if (atEnd === -1) break;
        
        const atContent = content.substring(pos, atEnd);
        result.keyframes.push(atContent.trim());
        pos = atEnd;
        current = '';
        continue;
      } else {
        current += char;
      }
      
      pos++;
    }
    
    // Handle trailing property
    const lastProp = current.trim();
    if (lastProp && depth === 0) {
      if (isValidProperty(lastProp)) {
        result.properties.push(lastProp);
      } else if (validate) {
        errorHandler(`Invalid property: ${lastProp}`);
      }
    }
    
    return result;
  }

  const result = parseBlock(css, 0);
  return result.output;
}
function procP(text) {
  return text.replace(/%(\d+)\(([^[]+)\[\s*([^\]]+)\]\)/g, (match, number, properties, value) => {
    const propList = properties.split(',').map(p => p.trim());
    if (propList.length != number) {
      console.warn(`Number of properties ${propList.length} does not match %${number}`);
      return match;
    }
    return propList.map(prop => `${prop}${value}`).join("");
  });
}

function transformCssValues(css) {
  const customProperties = new Set();
  const copyRegex = /(:\s*)(["']?)(.*?)(["']?)\s*copy\(([-]?\d+),\s*([^\;^\)^\(^,^ ]*)\)/g;
  
  const transformedCss = css.replace(copyRegex, (match, prefix, quote1, value, quote2, lengthStr, variableName) => {
    const length = parseInt(lengthStr);
    const sanitizedVar = variableName.replace(/[^a-zA-Z0-9_-]/g, '');
    let extractedValue = '';

    if (length >= 0) {
      extractedValue = value.substring(0, length);
    } else {
      extractedValue = value.substring(value.length + length);
    }

    customProperties.add(`--${sanitizedVar}:${extractedValue};`);
    return `${prefix}${quote1}${value}${quote2}`;
  });

  // Append custom properties to :root if any were created
  if (customProperties.size > 0) {
    const rootBlock = `:root{${Array.from(customProperties).join('\n')}\n}`;
    return transformedCss + `\n${rootBlock}`;
  }
  return transformedCss;
}

// Repeats a string while handling quotes
function repeatString(str, count) {
  return str.replace(/^['"]|['"]$/g, '').repeat(Math.max(0, parseInt(count)));
}

// Processes recursive CSS patterns (re() function)
function replaceRe(css) {
  // Enhanced regex to capture re() declarations with flexibility
 const reRegex = /(?:store|str|re)\(\s*([^:,]+)\s*[,:]\s*(?:"([^"]*)"|'([^']*)')\s*\)/gi;
  const variableMap = new Map();
  
  // Step 1: Remove re() declarations and store variable-value mappings
  let cleanedCss = css.replace(reRegex, (match, variable, dqValue, sqValue) => {
    const value = dqValue || sqValue;
    variable = variable.trim();
    variableMap.set(variable, value);
    return ''; // Completely remove the re() call
  });

  // If no variables found, return cleaned CSS
  if (variableMap.size === 0) return cleanedCss;

  // Step 2: Replace variables throughout the CSS
  let changed;
  let iterations = 0;
  const maxIterations = 100;
  let current = cleanedCss;
  
  do {
    changed = false;
    for (const [variable, value] of variableMap.entries()) {
      // Use word boundaries to avoid partial replacements
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


// Applies all FSCSS transformations to CSS content
function applyFscssTransformations(css) {
    // Handle mx/mxs padding shorthands
    css = css.replace(/(?:mxs|\$p)\((([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,\s*)?("([^"]*)"|'([^']*)')\)/gi, '$2:$14$15;$4:$14$15;$6:$14$15;$8:$14$15;$10:$14$15;$12:$14$15;')
    .replace(/(?:mx|\$m)\((([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,\s*)?("([^"]*)"|'([^']*)')\)/gi, '$2$14$15$4$14$15$6$14$15$8$14$15$10$14$15$12$14$15')
    
    // Handle string repetition (rpt)
    .replace(/rpt\((\d+)\,\s*("([^"]*)"|'([^']*)')\)/gi, (match, count, quotedStr) => repeatString(quotedStr, count))
    
    // Process CSS variable declarations and references
    .replace(/\$(([\_\-\d\w]+)\:(\"[^\"]*\"|\'[^\']*\'|[^\;]*)\;)/gi, ':root{--$1}')
    .replace(/\$([^\!\s]+)!/gi, 'var(--$1)')
    .replace(/\$([\w\-\_\d]+)/gi, 'var(--$1)')
    
    // Handle vendor prefix expansion
  .replace(/\-\*\-(([^\:]+)\:(\"[^\"]*\"|\'[^\']*\'|[^\;]*)\;)/gi, '-webkit-$1-moz-$1-ms-$1-o-$1')
  // Process list-based shorthands (%i, %6-%1)
  .replace(/%i\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$21$4$21$6$21$8$21$10$21$12$21$14$21$16$21$18$21$20$21')
    .replace(/%6\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$13$4$13$6$13$8$13$10$13$12$13')
    .replace(/%5\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$11$4$11$6$11$8$11$10$11')
    .replace(/%4\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$9$4$9$6$9$8$9')
    .replace(/%3\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$7$4$7$6$7')
    .replace(/%2\((([^\,\[\]]*)\,)?(([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$5$4$5')
    .replace(/%1\((([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$3');
  css = procP(css);
    css=css.replace(/@import\(\s*\exec\((.*)(.{5})\)\s*\)/gi, '@import url("$1css")')
    
    // Process animation shorthands
   .replace(/\$\(\s*@keyframes\s*(\S+)\)/gi, '$1{animation-name:$1;}@keyframes $1')
    .replace(/\$\(\s*(\@[\w\-\*]*)\s*([^\{\}\,&]*)(\s*,\s*[^\{\}&]*)?&?(\[([^\{\}]*)\])?\s*\)/gi, '$2$3{animation:$2 $5;}$1 $2')
    
    // Process property references
    .replace(/\$\(\s*--([^\{\}]*)\)/gi, '$1')
    .replace(/\$\(([^\:]*):\s*([^\)\:]*)\)/gi, '[$1=\'$2\']')
    
    // Handle grouping syntax (g)
    .replace(/g\(([^"'\s]*)\,\s*(("([^"]*)"|'([^']*)')\,\s*)?("([^"]*)"|'([^']*)')\s*\)/gi, '$1 $4$5$1 $7$8')
    .replace(/\$\(([^\:]*):\s*([^\)\:]*)\)/gi, '[$1=\'$2\']')
    .replace(/\$\(([^\:^\)]*)\)/gi, '[$1]');
  return css;
}


// Main execution with error handling
async function processImports(cssText, depth = 0, baseURL = window.location.href) { // Mark as async
  if (depth > exfMAX_DEPTH) {
    console.warn(`fscss[@import] Warning: Maximum import depth (${exfMAX_DEPTH}) exceeded for base URL "${baseURL}". Skipping further imports.`);
    return cssText;
  }

  const importRegex = /@import\s*\(\s*exec\s*\(\s*((?:'[^']*'|"[^"]*"|[^'")]\S*)\s*)\)\s*\)/g;
  const matches = Array.from(cssText.matchAll(importRegex));

  if (matches.length === 0) {
    
    return cssText;
  }

  

  // Await the resolution of all import promises
  const fetchedContents = await Promise.all(
    matches.map(async (match) => {
      const [fullMatch, urlSpec] = match;
      let cleanUrl = urlSpec.replace(/^['"](.*)['"]$/, '$1').trim();
      let absoluteUrl;

      try {
        absoluteUrl = new URL(cleanUrl, baseURL).href;
        

        const response = await fetch(absoluteUrl); // Await fetch
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${absoluteUrl}`);
        }

        const importedText = await response.text(); // Await text()
        

        // Recursive call should also be awaited for its promise to resolve
        return await processImports(importedText, depth + 1, absoluteUrl);
      } catch (error) {
        console.error(`fscss[@import] Error: Failed to import "${cleanUrl}" from "${baseURL}":`, error);
        return `/* fscss[@import] Error importing "${cleanUrl}": ${error.message} */`;
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

  console.log(`fscss[@import] Info: Finished processing imports at depth ${depth}.`);
  return result;
}

// Fixed version: Proper async handling
async function procImp(css) {
  try {
    const processedCSS = await processImports(css);
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
    css = replaceRe(css);
    css = procExt(css);
    css = procVar(css);
    css = initlibraries(css);
    css = procFun(css);
    css = procRan(css);
    css = procArr(css);
    css = procEv(css);
    css = transformCssValues(css);
    css = replaceRe(css);
    css = procNum(css);
    css = procExt(css);
     css = applyFscssTransformations(css);
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
