/**
 * exfscss
 * 
 * Credit: 
 *   - Figsh (Publisher)
 *   - David-Hux (Writer)
 *   - Current User (Implementer)
 * 
 * Resources:
 *   - fscss-ttr on dev.to
 *   - Figsh on codepen.io, stackoverflow.com
 *   - npm package: fscss (npm install fscss)
 *   - docs: fscss.onrender.com 
 * Version: source v6, package v1+
 * Last Edited: 11:29pm Tue Jun 17 2025
 * 
 * Note: Use official npm package/CDN instead of copying this directly.
 *       Contact: Facebook (FSCSS) for support.
 */
function procP(text){return text.replace(/%(\d+)\(([^[]+)\[\s*([^\]]+)\]\)/g, (match, number, properties, value)=>{const propList=properties.split(',').map(p=>p.trim());if(propList.length != number){console.warn(`fscss: Number of properties ${propList.length} does not match %${number}`);return match;}return propList.map(prop =>`${prop}${value}`).join(" ");});}function transformCssValues(css){let customProperties=new Set();let transformedCss=css;const copyRegex=/(:\s*)(["']?)(.*?)(["']?)\s*copy\(([-]?\d+),\s*([^\;^\)^\(^,^ ]*)\)/g;transformedCss=transformedCss.replace(copyRegex,(match,prefix,quote1,value,quote2,lengthStr,variableName)=>{const length=parseInt(lengthStr);let extractedValue='';if(length>=0){extractedValue=value.substring(0,length);}else{extractedValue=value.substring(value.length+length);}customProperties.add(`--${variableName.replace(/[^a-zA-Z0-9_-]/g,'')}:${extractedValue};`);return `${prefix}${quote1}${value}${quote2}`;});if(customProperties.size>0){const rootBlock=`:root{\n${Array.from(customProperties).join('\n')}\n}`;transformedCss+=`\n${rootBlock}`;}return transformedCss;} function repeatString(str,count){str=str.replace(/^['"]|['"]$/g,'');return str.repeat(Math.max(0,parseInt(count)))}function replaceRe(css){const reRegex = /(?:store|str|re)\(\s*([^:,]+)\s*[,:]\s*(?:"([^"]*)"|'([^']*)')\s*\)/gi;const variableMap = new Map();let cleanedCss=css.replace(reRegex, (match, variable, dqValue, sqValue)=>{const value = dqValue || sqValue;variable = variable.trim();variableMap.set(variable, value);return '';});if (variableMap.size === 0) return cleanedCss;let changed;let iterations = 0;const maxIterations = 100;let current = cleanedCss;do {changed = false;for (const [variable, value] of variableMap.entries()){const varRegex = new RegExp(`\\b${escapeRegExp(variable)}\\b`, 'g');const newCss=current.replace(varRegex, value);if(newCss !== current){changed=true;current=newCss;}}iterations++;}while(changed && iterations < maxIterations);if(iterations >= maxIterations){console.warn('Maximum iterations reached. Possible circular dependency.');}return current;}function escapeRegExp(string){return string.replace(/[.*+?^${}|[\]\\]/g, '\\$&');}function processStyles(){const styleElements=document.querySelectorAll('style');if(!styleElements.length){console.warn('No <style> elements found.');return}styleElements.forEach(element=>{let css=element.innerHTML;css=t
