var expect = require('chai').expect;

describe('Sub Resource Integrity Check Polyfill', function () {

    it("SRI works on JavaScript", function () {
        browser.url(`http://127.0.0.1:8080/test/index.html?freshnejs=${Date.now()}`);
        expect(browser.getTitle()).to.equal('SRI check');
        expect(browser.getText("#positive")).to.equal("PASS");
        expect(browser.getText("#negative")).to.equal("PASS");
    });

    it("SRI works on CSS", function () {
        browser.url(`http://127.0.0.1:8080/test/index.html?freshnecss=${Date.now()}`);
        expect(browser.getTitle()).to.equal('SRI check');
        browser.waitUntil(() => browser.getText('#backgroundcolor') === "rgb(0, 255, 0)", 10000, "background color not changed...");
        expect(browser.getText("#backgroundcolor")).to.equal("rgb(0, 255, 0)");
    });

});