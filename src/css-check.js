export default sha256 => {
    "use strict";

    /**
     * Get all CSS links that have a data-sri-href attached to it
     * because those are the ones we want to apply SRI to...
     */
    const styleSheets = [...document.querySelectorAll('link[data-sri-href]')];

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
        /**
         * Do manual SRI
         * For each of the elements in the nodelist we want to retrieve the CSS asynchronously.
         */
        const safeContainer = document.createElement('style');
        const sheets = [];
        let called = styleSheets.length;

        styleSheets.forEach((styleSheet, index) => {


            const req = new XMLHttpRequest();

            /**
             * Once the request is done loading we need to run the response through the integrity checker
             */
            req.onload = function cssIntegrityChecker() {
                called--;
                /**
                 * We need to do an integrity check using the response text, we gave our own non encoded hash as an
                 *   attribute, we need to compare that with a hash of the response text.
                 */
                const hash = sha256(this.responseText);

                /**
                 * If the hashes match, we're safe to use the CSS
                 */
                if (hash === styleSheet.getAttribute("data-integrity")) {

                    /**
                     * Clear up the node reference
                     */
                    styleSheet.parentNode.removeChild(styleSheet);
                    /**
                     * Inject the CSS through the magic of data uris
                     */
                    sheets[index] = this.responseText;
                } else {
                    /**
                     * if the hash doesn't match it means the code has been compromised
                     * we want to clear up the RAM by removing the node
                     */
                    styleSheet.parentNode.removeChild(styleSheet);
                    /**
                     * This format of the error message is the same one Google provides its error messages
                     * We use a timeout here so the error is called after the stack is cleared and we keep
                     *  on collecting the trusted css.
                     */
                    setTimeout(() => {
                        throw new Error(`Failed to find a valid digest in the 'integrity' attribute for resource '${this.responseURL}'
                        with computed SHA-256 integrity '${hash}'. The resource has been blocked.`);
                    }, 0);
                }

                if (called === 0) {
                    safeContainer.innerHTML += sheets.join("");
                    document.head.appendChild(safeContainer);
                }
            };
            req.open("GET", styleSheet.getAttribute("data-sri-href"));
            req.send();
        });
    } else {
        // do regular SRI
        styleSheets.forEach(styleSheet => styleSheet.setAttribute('href', styleSheet.getAttribute('data-sri-href')));
    }

};