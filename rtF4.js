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
  processedCode = processedCode.replace(/\/\/.*$/gm, '');
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
        .replace(/\/\/[^\n]*\n/g, '')
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
}function processStyles(){const styleElements=document.querySelectorAll('style');if(!styleElements.length){console.warn('No <style> elements found.');return}styleElements.forEach(element=>{let css=element.innerHTML;css=procFun(css);css=procArr(css);css=transformCssValues(css);css=css.replace(/(?:mxs|\$p)\((([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,\s*)?("([^"]*)"|'([^']*)')\)/gi,`$2:$14$15;$4:$14$15;$6:$14$15;$8:$14$15;$10:$14$15;$12:$14$15;`).replace(/(?:mx|\$m)\((([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,\s*)?("([^"]*)"|'([^']*)')\)/gi,`$2$14$15$4$14$15$6$14$15$8$14$15$10$14$15$12$14$15`).replace(/rpt\((\d+)\,\s*("([^"]*)"|'([^']*)')\)/gi,(match,count,quotedStr,doubleQuoted,singleQuoted)=>repeatString(quotedStr,count)).replace(/\$(([\_\-\d\w]+)\:(\"[^\"]*\"|\'[^\']*\'|[^\;]*)\;)/gi,`:root{--$1}`).replace(/\$([^\!\s]+)!/gi,`var(--$1)`).replace(/\$([\w\-\_\d]+)/gi,`var(--$1)`).replace(/\-\*\-(([^\:]+)\:(\"[^\"]*\"|\'[^\']*\'|[^\;]*)\;)/gi,`-webkit-$1-moz-$1-ms-$1-o-$1`).replace(/%i\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi,`$2$21$4$21$6$21$8$21$10$21$12$21$14$21$16$21$18$21$20$21`).replace(/%6\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi,`$2$13$4$13$6$13$8$13$10$13$12$13`).replace(/%5\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi,`$2$11$4$11$6$11$8$11$10$11`).replace(/%4\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi,`$2$9$4$9$6$9$8$9`).replace(/%3\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi,`$2$7$4$7$6$7`).replace(/%2\((([^\,\[\]]*)\,)?(([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi,`$2$5$4$5`).replace(/%1\((([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi,`$2$3`).replace(/@import\(\s*\exec\((.*)(.{5})\)\s*\)/gi,`@import url("$1css")`).replace(/\$\(\s*@keyframes\s*(\S+)\)/gi,`$1{animation-name:$1;}@keyframes $1`).replace(/\$\(\s*(\@[\w\-\*]*)\s*([^\{\}\,&]*)(\s*,\s*[^\{\}&]*)?&?(\[([^\{\}]*)\])?\s*\)/gi,`$2$3{animation:$2 $5;}$1 $2`).replace(/\$\(\s*--([^\{\}]*)\)/gi,`$1`).replace(/\$\(([^\:]*):\s*([^\)\:]*)\)/gi,`[$1='$2']`).replace(/g\(([^"'\,]*)\,\s*(("([^"]*)"|'([^']*)')\,\s*)?("([^"]*)"|'([^']*)')\s*\)/gi,`$1 $4$5$1 $7$8`).replace(/\$\(([^\:]*):\s*([^\)\:]*)\)/gi,`[$1='$2']`).replace(/\$\(([^\:^\)]*)\)/gi,`[$1]`);css=replaceRe(css);css=procP(css);element.innerHTML=css})}function processDrawElements(){const drawElements=document.querySelectorAll('.draw');drawElements.forEach(element=>{const currentColor=element.style.color||'#000';element.style.color='transparent';element.style.webkitTextStroke=`2px ${currentColor}`})}try{processStyles();processDrawElements()}catch(error){console.error('Error processing styles or draw elements:',error)}
