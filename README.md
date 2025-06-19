# FSCSS
Figured Shorthand Cascading Style Sheet @ https://www.npmjs.com/package/fscss
<br>
**example in usage:**
<br>
  external styling:
```html
<head>
<!-- =rest of your head contents= -->
<!-- =external FSCSS sheet, .fscss or .css but the type="fscss" required for fscss compiler to understand that it includes FSCSS codes= -->
<link rel="stylesheet" type="text/fscss" href="your_fscss_shorthands.fscss">
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.6/exec.min.js" async></script>
</head>
```
internal styling:
```html
<!-- no need for type="fscss"-->
<!-- avoid using inline comments (//sososo) use (/* sososo */) instead -->
<style>
  /*CSS + FSCSS*/

</style>
```
<br>
Best version with errors handling `fscss@1.1.6`:


```js
import { exec } from "https://cdn.jsdelivr.net/npm/fscss@1.1.6/e/xfscss.min.js";

  const DEBUG = true;

  function applyFSCSS({ type, content }) {
    exec({
      type,
      content,
      onSuccess: (styleElement) => {
        DEBUG && console.log("✅ FSCSS applied:", styleElement);
      },
      onError: (error) => {
        console.error("❌ Failed to apply FSCSS:", error);
        alert("⚠️ Could not load styles. Please try again later.");
      }
    });
  }

applyFSCSS({

    type: "text",

    content: `$init-background: lightblue;

$init-border: 2px groove lightgreen;

$init-outline: 1px groove #235000;

$init-color: #521;`
});
```
Simple code for Testing:
```html
<h1>TEST</h1>
<div>FSCSS</div>
<style>
  $bg-color: #000;
  body{
    Background: $bg-color;
   }
  Re(animationSettings, '3s linear infinite') 
  $(@keyframes change, h1, div &[animationSettings]){
    0%{background: RED;
      %2(Width,
      Height[:0;])
      }
    100%{ background: #00f;
      %2(width, height[:150px;]) 
     } 
</style>
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.6/exec.min.js" async></script>
```

