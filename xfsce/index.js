// Function to dynamically repeat a string
function repeatString(str, count) {
  // Handle single or double quotes
  str = str.replace(/^['"]|['"]$/g, ''); // Remove quotes
  return str.repeat(Math.max(0, parseInt(count))); // Ensure non-negative count
}

// Helper function to handle `re` replacements
function replaceRe(css) {
  const reRegex = /re\(([^:]*)(?::\s*|\,\s*)(?:i\:?\s*)?(?:"([^"]*)"|'([^']*)')\)([^}]*)(\1)([^}]*)/gi;
  let newCss = css;
  let previousCss = '';
  let iterations = 0;
  const maxIterations = 100; // Prevent infinite loops

  while (newCss !== previousCss && iterations < maxIterations) {
    previousCss = newCss;
    newCss = newCss.replace(reRegex, (match, selector, doubleQuoted, singleQuoted, before, repeatedSelector, after) => {
      const quotedStr = doubleQuoted || singleQuoted;
      return `${before}${quotedStr}${after}`;
    });
    iterations++;
  }

  if (iterations >= maxIterations) {
    console.warn('Maximum iterations reached in replaceRe. Possible malformed CSS.');
  }

  return newCss;
}

// Main function to process CSS styles
function processStyles() {
  const styleElements = document.querySelectorAll('style');
  
  if (!styleElements.length) {
    console.warn('No <style> elements found.');
    return;
  }

  styleElements.forEach((element) => {
    let css = element.innerHTML;

    // Replace mxs(...) and $p(...) with CSS properties (e.g., mxs(prop, value) -> prop:value;)
    css = css.replace(/(?:mxs|\$p)\((([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,\s*)?("([^"]*)"|'([^']*)')\)/gi,
      `$2:$14$15;$4:$14$15;$6:$14$15;$8:$14$15;$10:$14$15;$12:$14$15;`);

    // Replace mx(...) and $m(...) with concatenated values
    css = css.replace(/(?:mx|\$m)\((([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,\s*)?("([^"]*)"|'([^']*)')\)/gi,
      `$2$14$15$4$14$15$6$14$15$8$14$15$10$14$15$12$14$15`);

    // Replace rpt(count, string) with repeated string
    css = css.replace(/rpt\((\d+)\,\s*("([^"]*)"|'([^']*)')\)/gi, (match, count, quotedStr, doubleQuoted, singleQuoted) => {
      const str = doubleQuoted || singleQuoted;
      return repeatString(quotedStr, count);
    });

    // Replace CSS custom properties (e.g., $var: value; -> :root{--var: value})
    css = css.replace(/\$(([\_\-\d\w]+)\:(\"[^\"]*\"|\'[^\']*\'|[^\;]*)\;)/gi, `:root{--$1}`);

    // Replace variable usage (e.g., $var -> var(--var))
    css = css.replace(/\$([^\!\s]+)!/gi, `var(--$1)`).replace(/\$([\w\-\_\d]+)/gi, `var(--$1)`);

    // Replace vendor prefixes (e.g., -*-prop: value; -> -webkit-prop: value; -moz-prop: value; ...)
    css = css.replace(/\-\*\-(([^\:]+)\:(\"[^\"]*\"|\'[^\']*\'|[^\;]*)\;)/gi,
      `-webkit-$1-moz-$1-ms-$1-o-$1`);

    // Replace %i, %6, %5, %4, %3, %2, %1 patterns
    css = css.replace(/%i\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi,
      `$2$21$4$21$6$21$8$21$10$21$12$21$14$21$16$21$18$21$20$21`)
      .replace(/%6\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi,
        `$2$13$4$13$6$13$8$13$10$13$12$13`)
      .replace(/%5\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi,
        `$2$11$4$11$6$11$8$11$10$11`)
      .replace(/%4\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi,
        `$2$9$4$9$6$9$8$9`)
      .replace(/%3\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi,
        `$2$7$4$7$6$7`)
      .replace(/%2\((([^\,\[\]]*)\,)?(([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi,
        `$2$5$4$5`)
      .replace(/%1\((([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi,
        `$2$3`)
      .replace(/@import\(\s*\exec\((.*)(.{5})\)\s*\)/gi, `@import url("$1css")`).replace(/\$\(\s*@keyframes\s*(\S+)\)/gi,`$1{animation-name:$1;}@keyframes $1`).replace(/\$\(\s*(\@[\w\-\*]*)\s*([^\{\}\,&]*)(\s*,\s*[^\{\}&]*)?&?(\[([^\{\}]*)\])?\s*\)/gi,`$2$3{animation:$2 $5;}$1 $2`).replace(/\$\(\s*--([^\{\}]*)\)/gi, `$1`).replace(/\$\(([^\:]*):\s*([^\)\:]*)\)/gi, `[$1='$2']`).replace(/g\(([^"'\,]*)\,\s*(("([^"]*)"|'([^']*)')\,\s*)?("([^"]*)"|'([^']*)')\s*\)/gi, `$1 $4$5$1 $7$8`)
      .replace(/\$\(([^\:]*):\s*([^\)\:]*)\)/gi, `[$1='$2']`).replace(/\$\(([^\:^\)]*)\)/gi, `[$1]`);

    // Apply re replacement
    css = replaceRe(css);

    element.innerHTML = css;
  });
}

// Process .draw elements for text stroke
function processDrawElements() {
  const drawElements = document.querySelectorAll('.draw');
  
  drawElements.forEach((element) => {
    const currentColor = element.style.color || '#000'; // Default to black if no color
    element.style.color = 'transparent';
    element.style.webkitTextStroke = `2px ${currentColor}`;
  });
}

// Execute the processing
try {
  processStyles();
  processDrawElements();
} catch (error) {
  console.error('Error processing styles from fscss[xfce] root or draw elements:', error);
}
