const endPointProduct="http://localhost:3000/api/products";
const ProductDao = require("./ProductDao");
const productDao = new ProductDao(endPointProduct);

/**
 * Class used as controller of main page.
 */
class IndexController {
    constructor() {
    }

    init() {
        this.#loadProducts();
    }

    /**
     * Loads and intialise all the products
     */
    #loadProducts = function () {
        try {
            productDao.getAll_()
                .then((content) => {
                    const itemsSection = document.getElementById("items");
                    for (let product of content) {
                        if (product.name!=="" && product._id!=="") {
                            let elementProduct = this.#createProductDOM(product)
                            itemsSection.appendChild(elementProduct);
                        }
                    }

                });
        } catch (ex) {
            console.log("Error", ex);
        }
    }

    /**
     * Create Product DOM
     * @param {*} product 
     * @returns HTML node of a product
     */
    #createProductDOM = function(product) {
        let elementA = document.createElement("a");
        let elementArticle = document.createElement("article");
        let elementImg = new Image();
        let elementH3 = document.createElement("h3");
        let elementP = document.createElement("p");
        elementArticle.appendChild(elementImg);
        elementArticle.appendChild(elementH3);
        elementArticle.appendChild(elementP);
        elementA.appendChild(elementArticle);

        const uRLSearchParams = new URLSearchParams();
        uRLSearchParams.set("productId", product._id);
        elementA.href = "product.html?" + uRLSearchParams.toString();
        elementImg.src = product.imageUrl;
        elementImg.alt = product.altTxt;
        elementH3.innerText = product.name;
        elementP.innerText = product.description;
        // product.price
        // product.colors
        return elementA;
    }
}

module.exports = IndexController;
