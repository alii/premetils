// ==UserScript==
// @name         PremeTils by aabbccsmith
// @namespace    https://majorcraft.xyz
// @version      1.0.0
// @description  Nice little tools to aid on drop day on the Supreme Web Store
// @author       aabbccsmith
// @match        https://www.supremenewyork.com/shop*
// @match        https://www.supremenewyork.com/checkout*
// @grant        none
// ==/UserScript==

const disabled = false;

const user = {};
user.size = "large";
user.strictSizeCheck = false;
user.reloadDelay = 5;
user.autoCheckout = true;
user.checkoutDelay = 3;
user.cardNumber = "4242424242424242";
user.expiryMonth = "01";
user.expiryYear = "2020";
user.cvc = "123";

if (!disabled) {
    (function() {
        'use strict';

        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

        if (!window.location.href.includes("checkout")) {
            document.querySelector("body").innerHTML = document.querySelector("body").innerHTML + `<a href="#!" id="utils-close-window" onclick="window.close()" style="display: none;">X</a>`;
        }

        // Reload
        if (document.getElementById("nav-categories")) {
            let cachedCategoryList = document.getElementById("nav-categories").innerHTML;
            document.getElementById("nav-categories").innerHTML = `${cachedCategoryList}<li><a class="" id="utils-reload" href="#!">utils: reload</a></li>`;
            document.getElementById("utils-reload").addEventListener("click", e => {
                e.preventDefault();
                window.location.reload();
            });
        }

        // Faster page loading in multiple tabs
        document.querySelectorAll("a:not(#utils-reload)").forEach(anchor => {
            anchor.addEventListener("click", e => {
                e.preventDefault();
                let loc = anchor.getAttribute("href");
                window.open(loc, '_blank');
                window.close();
            });
        });

        // Force show all sold out tags tags on all product pages.
        if (document.querySelector(".sold_out_tag")) {
            document.querySelectorAll(".sold_out_tag").forEach(tag => {tag.style.display = "block"});
            window.addEventListener("hashchange", e => {
                document.querySelectorAll(".sold_out_tag").forEach(tag => {tag.style.display = "block"});
            });
        }


        user.reloadDelay = user.reloadDelay * 1000;
        // Pick Size
        const onProductPage = !!document.querySelector("#details > h1");
        if (onProductPage) {
            document.querySelector("#details > h1").innerHTML = `Supreme Utils by <a href="https://majorcraft.xyz" target="_blank">aabbccsmith</a>`;
            const isSoldOut = !!document.querySelector(".sold-out");
            if (isSoldOut) {
                let count = user.reloadDelay;
                const counterEl = document.querySelector("#details > p.style.protect");
                const interval = setInterval(() => {
                    count = count - 100;
                    counterEl.textContent = `Refreshing in ${count/1000}s`;
                }, 100);

                setTimeout(() => {
                    clearInterval(interval);
                    window.location.reload()
                }, user.reloadDelay)
            } else {
                const input = document.getElementById("size");
                const options = input.querySelectorAll("option");
                let foundSize = false;
                options.forEach(option => {
                    if (option.textContent.toLowerCase() === user.size.toLowerCase() && !foundSize) {
                        input.value = option.value;
                        foundSize = true;
                    }
                });

                if (foundSize || (!foundSize && !user.strictSizeCheck)) {
                    document.querySelector("#add-remove-buttons > input").click();
                    (async () => {
                        while(!document.querySelector("#cart > a.button.checkout")) {
                            await new Promise(r => setTimeout(r, 500));
                        }
                        await sleep(1013);
                        document.querySelector("#cart > a.button.checkout").click();
                    })();
                }
            }
        }

        const onCheckoutPage = !!document.querySelector("#pay > input");
        if (onCheckoutPage) {
            sleep(100).then(() => {
                const cardInput = document.getElementById("cnb");
                cardInput.focus();
                cardInput.value = user.cardNumber;
                const cardMonthSelect = document.getElementById("credit_card_month");
                sleep(50).then(() => {
                    cardMonthSelect.value = user.expiryMonth;
                    sleep(50).then(() => {
                        const cardYearSelect = document.getElementById("credit_card_year");
                        cardYearSelect.value = user.expiryYear;
                        sleep(100).then(() => {
                            const cardCVC = document.getElementById("vval");
                            cardCVC.value = user.cvc;
                            sleep(150).then(() => {
                                const checkBox = document.querySelector("#cart-cc > fieldset > p > label");
                                checkBox.click();
                                if (user.autoCheckout) {
                                    let count = user.checkoutDelay * 1000;
                                    const header = document.querySelector("#header > hgroup > h1");
                                    const interval = setInterval(() => {
                                        count = count - 100;
                                        header.innerHTML = `Supreme Utils<br />Checking out in ${count / 1000}s`;
                                    }, 100);
                                    sleep(user.checkoutDelay * 1000).then(() => {
                                        clearInterval(interval);
                                        document.querySelector("#pay > input").click();
                                    });
                                }
                            });
                        });
                    });
                });
            });
        }
    })();
}
