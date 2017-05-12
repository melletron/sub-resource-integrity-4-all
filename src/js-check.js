export default sha256 => {
    "use strict";
    // Get all the JavaScript elements that have a sub resource integrity check source attribute
    const scriptTags = [...document.querySelectorAll('script[data-sri-src]')];
    /**
     * There should be a single JavaScript tag on the page that does a capability
     *  check to see if the browser supports SRI native, if that is not the case,
     *  a class is added to the html tag. That class is then used to see if we need
     *  to use our polyfill.
     *
     *  The integrity check on our polyfill checker will always fail, so sri enabled
     *  browsers won't run it.
     *  <script src="data:text/javascript,document.querySelector('html').className += ' sri-check';" integrity="sha256-x"></script>
     *
     *
     */
    if (/sri-check/.test(document.querySelector('html').className)) {

        //Do manual SRI

        /**
         * We create our own safe container for having the validated JavaScript
         */
        const safeContainer = document.createElement('script');

        /**
         * We need to maintain the order of the JavaScript so we want to collect
         *  all JavaScript that we get from our XHR request in an array.
         */
        const scripts = [];

        /**
         * We need to keep track on the scripts we have loaded, because XHR requests are async
         *  and we need the scripts to be loaded synchronously so we don't break dependencies
         */
        let called = scriptTags.length;

        // Try and do a rewrite with a yield and iterator tomorrow on the train...
        scriptTags.forEach((scriptTag, index) => {

            /**
             * For each of the script tags we want to use xhr request to get the script without running it
             */
            const req = new XMLHttpRequest();

            /**
             * We want to override the default mime type so we can inject the response text through innerHTML
             * This is not needed for IE10, which doesn't have that method anyway...
             */
            req.overrideMimeType && req.overrideMimeType('application/javascript');

            /**
             * Once the request is done loading we need to run it through the integrity checker
             */
            req.onload = function jsIntegrityChecker() {
                /**
                 * Count down so we know when we are done
                 */
                called--;

                /**
                 * We need to do an integrity check using the response text, we gave our own non encoded hash as an
                 *   attribute, we need to compare that with a hash of the response text.
                 */
                const hash = sha256(this.responseText);

                /**
                 * If the hashes match, we're safe to use the JavaScript
                 */
                if (hash === scriptTag.getAttribute("data-integrity")) {
                    /**
                     * Clear up the node reference
                     */
                    scriptTag.parentNode.removeChild(scriptTag);
                    /**
                     * Add the JavaScript code to the collection
                     */
                    scripts[index] = this.response;
                } else {
                    /**
                     * if the hash doesn't match it means the code has been compromised
                     * we want to clear up the RAM by removing the node
                     */
                    scriptTag.parentNode.removeChild(scriptTag);
                    /**
                     * This format of the error message is the same one Google provides its error messages
                     * We use a timeout here so the error is called after the stack is cleared and we keep
                     *  on collecting the trusted scripts.
                     */
                    setTimeout(() => {
                        throw new Error(`Failed to find a valid digest in the 'integrity' attribute for resource '${this.responseURL}'
                        with computed SHA-256 integrity '${hash}'. The resource has been blocked.`);
                    }, 0);
                }
                /**
                 * When we're done receiving all the scripts we can
                 *  merge the collection into one big string and inject it into
                 *  out safe JavaScript container.
                 */
                if (called === 0) {
                    safeContainer.innerHTML += scripts.join("");
                    document.body.appendChild(safeContainer);
                }
            };
            /**
             * Now kick of the request that sets it all in motion!
             */
            req.open("GET", scriptTag.getAttribute("data-sri-src"));
            req.send();
        });
    } else {
        /**
         * If the script tag injected on your page didn't run, it means that the page
         * support sri natively, we can just document write all the script text in order and
         * let the browser work its magic.
         */
        scriptTags.forEach(scriptTag => {
            const script = scriptTag.outerHTML.replace("data-sri-", "");
            /**
             * I like cleaning up dom nodes, every bit of memory counts.
             */
            scriptTag.parentNode.removeChild(scriptTag);
            /**
             * Here it is OK to do a document.write ;)
             * the blocking aspect of document.write is actually needed here to make sure we keep
             * everything in order.
             */
            document.write(script);
        });
    }
};