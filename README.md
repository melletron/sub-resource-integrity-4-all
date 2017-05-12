# Sub Resource Integrity 4 All
This package provides a way to start benefiting from sub resource integrity checks right now.

## What is sub resource integrity?
Whenever you build a programmatic asset for your front end, a CSS or a JavaScript you often include
that to your web application through a link tag or a script tag. When you do, you expect that CSS or JavaScript
 to have a specific content. The content you tested, approved, did security scans with. During your build time
 you can ask your build tooling to provide a fingerprint of that CSS or JavaScript. You can then add that fingerprint
 to your script or link tag and your browser will simply ignore the CSS or JavaScript if its contents
 doesn't match that fingerprint.
 [Subresource Integrity - W3C Recommendation 23 June 2016](https://www.w3.org/TR/SRI/) 

## So how does that help me?
When building large scale applications working with sensitive data you often have multiple teams working on one product.
Besides that you probably have specialised infrastructure to host your product on, so the chance is very likely
that the server serving out your application isn't the same server as the one hosting your JavaScript and CSS.
In many large international companies, these assets are often delivered through a content delivery network. 
These are specialised servers hosting static assets close to the client requesting the assets. Speed is of the essence
so they often store these files in memory or on very fast SSDs. In any case, the hosting of your assets is not entirely 
 in your control. 
Sub resource integrity checking guarantees that your customers are deliverd the assets that have been tested and approved
and have not been tampered by men in the middle or otherwise compromised systems.
[Subresource Integrity - Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
[Subresource Integrity Sample](https://googlechrome.github.io/samples/subresource-integrity/)

## What does this package provide me?
So now that you know why you want to use sub resource integrity checks, you might wonder why you want to get it here.
First of all, like with any new browser technology, sub resource integrity checking has a scattered rate of adoption by browsers.
At the moment of writing it is only supported by Chrome and Firefox and your usual suspects IE10, IE11, Edge 13 and Edge 14 or any of the 
 Safari's aren't supporting it yet. This package is designed to benefit from sub resource integrity checks today.
 But, it does more than that. If you would implement the integrity attribute on your script tags today, it means that 
  you are securing your Chrome and Firefox users. Being great in itself, your Microsoft and Apple browsing customers are still
  subjected to security risks. This JavaScript package aims to give them security as well. So if a browser is not covered 
  by the browsers supported this package, your customer is not subjected to the JavaScript and CSS at all.
[Can I use sub resource integrity?](http://caniuse.com/#feat=subresource-integrity)

## How does it work?
The first thing we need to do is find out if your browser natively supports sub resource integrity checks.
 We do that by adding a script tag high up in your DOM tree.
 
 ```<script src="data:text/javascript,document.querySelector('html').className += ' sri-check';" integrity="sha256-x"></script>```
 
 Any browser that natively supports integrity checking will block this JavaScript and thus not add the class ```sri-check``` to the ```<html>```
 tag.
 
 Then you want to provide all your link tags with a ```data-sri-href``` attribute instead of the regular href so our integrity checker script will pick those up later.
 Also you need to add the regular integrity attribute ```integrity="sha256-DroBL/a1rdlbFF1lBG9alTNaqVY98/eiuesdqBBVDyo="``` and our fallback integrity tag
 ```data-integrity="0eba012ff6b5add95b145d65046f5a95335aa9563df3f7a2b9eb1da810550f2a"```.
 These are used to verify the integrity of your resource. In case the browser supports it natively, it uses that for verification, else
 it uses the fallback. The fallback is a [Secure Hash Algorithm 256 hash](https://en.wikipedia.org/wiki/SHA-2) of the content of your asset.
 
 You then want to inject the JavaScript for CSS checking just under the CSS tags ```<script src="../dist/css-check.js">``` in the ```<head>```
 and the JavaScript for JavaScript checking just under the script tags ```<script src="../dist/js-check.js"></script>``` inside the ```<body>```
 
 ### full example 
 ```html
<!doctype html>
<html>
<head>
    <script src="data:text/javascript,document.querySelector('html').className += ' sri-check';"
            integrity="sha256-x"></script>

    <title>SRI check</title>

    <link rel="stylesheet" integrity="sha256-x"
          data-sri-href="negative.css"
          data-integrity="x">

    <!--
        In Firefox this wins....
        <link rel="stylesheet" href="negative.css"/>
     -->

    <link rel="stylesheet" href="positive.css"
          integrity="sha256-DroBL/a1rdlbFF1lBG9alTNaqVY98/eiuesdqBBVDyo="
          data-integrity="0eba012ff6b5add95b145d65046f5a95335aa9563df3f7a2b9eb1da810550f2a"
          data-sri-href="positive.css"/>

    <link rel="stylesheet" integrity="sha256-x"
          data-sri-href="negative.css"
          data-integrity="x">



    <script src="../dist/css-check.js">

    </script>
</head>
<body>

<script>
    if (/sri-check/.test(document.querySelector('html').className)) {
        document.write('<h1>SRI Fallback used</h1>');
    } else {
        document.write('<h1>Browser native SRI used</h1>');
    }
</script>

<p id="backgroundcolor"></p>


<h2 id="positive">FAIL</h2>
<script data-sri-src="positive.js"
        data-integrity="75cd0af463908d09e448cc3f4d81054402511cad2dccb449915517640da0cf48"
        integrity="sha256-dc0K9GOQjQnkSMw/TYEFRAJRHK0tzLRJkVUXZA2gz0g="></script>

<h2 id="negative">PASS</h2>
<script data-sri-src="negative.js"
        data-integrity="a4830902634be8ae5704e2744ca19a68841b2efe2475399c8fea0cfa3aeba641"
        integrity="sha256-pIMJAmNL6K5XBOJ0TKGaaIQbLv4kdTmcj+oM+jrrpkE="></script>

<script data-sri-src="angular.js"
        data-integrity="21d37cbe3ac3ee62c4a4d7aa59bcfef2b64808908bf3d287f348b486ba2287e6"
        integrity="sha256-IdN8vjrD7mLEpNeqWbz+8rZICJCL89KH80i0hroih+Y="></script>

<script data-sri-src="ngStorage.js"
        data-integrity="ff09152dbaf8b56a137e70b2f030712eded9fe4e3323e296f62460c3beca9586"
        integrity="sha256-/wkVLbr4tWoTfnCy8DBxLt7Z/k4zI+KW9iRgw77KlYY="></script>

<script data-sri-src="moment.js"
        data-integrity="a73b76b56d5551336e1ae5503333cad300b8bc493046b23a0f2326d5a199c62c"
        integrity="sha256-pzt2tW1VUTNuGuVQMzPK0wC4vEkwRrI6DyMm1aGZxiw="></script>

<script src="../dist/js-check.js"></script>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        setTimeout(function () {
            document.querySelector("#backgroundcolor").innerHTML = getComputedStyle(document.body).backgroundColor;
        }, 800);
    });
</script>
</body>
</html>
```

## On which browsers can I use it?
The solution is tested on:
* Firefox 50 / Windows 7
* Firefox 51 / Windows 7
* Firefox 52 / Windows 7
* Firefox 53 / Windows 7
* Safari 9.0 / OS X 10.11
* Chrome 57 / OS X 10.11
* IE 10 / Windows 7
* IE 11 / Windows 7
* Edge 13 / Windows 10
* Edge 14 / Windows 10
* Android 4.4 / Linux
* Android 5.1 / Linux
* Android 6.0 / Linux
* Chrome 54 / Windows 10
* Chrome 55 / Windows 10
* Chrome 56 / Windows 10
* Chrome 57/ Windows 10
* iOS 8.2 / Simulator
* iOS 9.2 / Simulator
* iOS 10.1 / Simulator

## Can I contribute?
Yes please!

I would like to test this solution on many more browsers and using many more real world scenarios.

I know there are some design issues. Firstly, it will not work nice if you mix signed and unsigned assets.
Secondly, the css-checker will load the sha256 library and assign it to the window even if the browser natively supports integrity checking.

Besides these things, it would be nice if we could have a gulp, webpack, jspm plugin that creates the hashes for you build time.