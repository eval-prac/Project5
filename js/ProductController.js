const endPointProduct="http://localhost:3000/api/products";
const ProductDao = require("./ProductDao");
const productDao = new ProductDao(endPointProduct);
const CartDao = require("./CartDao");
const cartDao = new CartDao();
const searchParams = new URLSearchParams(window.location.search);

/**
 * Class used as controller of page product details
 */
class ProductController {
    constructor() {
    }

    /**
     * Initialise page
     */
    init() {
        const productId=searchParams.get("productId");
        if (productId==null) {
            throw new Error("productId_KO");
        }
        this.#loadProduct(productId);
        document.getElementById("addToCart").addEventListener("click", this.addToCartHandler);
        document.getElementById("quantity").addEventListener("keypress", this.checkNumKeyHandler);
    }

    /**
    * Load data then render data of the page
    * @param {*} productId  String
    */
    #loadProduct = function (productId) {
        productDao.getById_(productId)
            .then((product) => {
                const img = document.getElementById("img");
                const price = document.getElementById("price");
                const description = document.getElementById("description");
                const title = document.getElementById("title");
                const colors = document.getElementById("colors");
                img.src = product.imageUrl;
                img.alt = product.altTxt;
                description.innerText = product.description;
                price.innerText = product.price;
                title.innerText = product.name;
                for (let color of product.colors) {
                    let optionColor = new Option(color, color);
                    colors.add(optionColor);
                }
            }).catch( (er)=> {
                window.location.assign("index.html");
            });
    }

    /**
     * Check data
     * On validation swith to page cart
     */
    addToCartHandler = function () {
        const productId = searchParams.get("productId");
        const quantity = document.getElementById("quantity").value;
        const elementColors = document.getElementById("colors");
        const color = elementColors.options[elementColors.selectedIndex].value;

        let formValidity = true;
        const elementColorMessage = document.getElementById("colorErrorMsg");
        elementColorMessage.innerText = "";
        if (color === "") {
            elementColorMessage.innerText = "Saisie incorrecte, une valeur doit être sélectionnée";
            formValidity = false;
        }
        const elementQuantityMessage = document.getElementById("quantityErrorMsg");
        elementQuantityMessage.innerText = "";
        if (new Number(quantity).valueOf() === 0) {
            elementQuantityMessage.innerText = "Saisie incorrecte, un nombre doit être saisi";
            formValidity = false;
        }
        if (!formValidity) {
            return;
        }

        cartDao.add(productId, color, quantity);
        window.location.assign("cart.html");
    }

    /**
     * Check quantity is a number and no more than 2 caracters
     * @param {*} event of the number field
     */
    checkNumKeyHandler = function (event) {
        if (!new RegExp("^[0-9]$").test(String.fromCharCode(event.charCode)) ||
            event.target.value.length >= 2
        ) {
            event.preventDefault();
        }
    }

}
module.exports = ProductController;
