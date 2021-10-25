const endPointProduct="http://localhost:3000/api/products";
const ProductDao = require("./ProductDao");
const productDao = new ProductDao(endPointProduct);
const CartDao = require("./CartDao");
const cartDao = new CartDao();

/**
 * Class used as controller of page cart
 */
class CartController {
    constructor() {
    }

    /**
     * Initialise the page
     */
    init() {
        this.#loadCart();
        const elementForm = document.getElementsByClassName("cart__order__form")[0];
        elementForm.addEventListener("submit", this.#orderHandler);
    }

    /**
    * Load cart from session storage then render the cart page
    */
    #loadCart = function () {
        const cart = cartDao.load();

        const elementCartItems = document.getElementById("cart__items");
        let totalQuantity = 0;
        let totalPrice = 0;

        const cartIdList = Object.keys(cart);
        const promisesProducts = cartIdList.map((productId) => {
            return productDao.getById_(productId);
        });

        Promise.all(promisesProducts)
            .then((products) => {
                const elementItem = document.getElementById("cartItem");
                const elementTemplateItem = elementItem.cloneNode(true);
                elementItem.remove();

                for (let product of products) {
                    let productId = product._id;
                    let productsIndepedant = cart[productId];
                    for (let productOption in productsIndepedant) {
                        totalQuantity = totalQuantity + productsIndepedant[productOption] * 1;
                        totalPrice = totalPrice + product.price * 1;
                        product.color = productOption;
                        product.quantity = productsIndepedant[productOption];
                        product.productId = productId;
                        let elementCartItem = elementTemplateItem.cloneNode(true);
                        elementCartItem = this.#buildCartElementProduct(elementCartItem, product);
                        elementCartItems.appendChild(elementCartItem);
                    }
                }
                document.getElementById("totalQuantity").innerText = totalQuantity;
                document.getElementById("totalPrice").innerText = totalPrice;
                // If the cart is empty hide order form
                const elementOrderForm = document.getElementsByClassName("cart__order")[0];
                if (totalQuantity===0) {
                    elementOrderForm.style.display="none";
                } else {
                    elementOrderForm.style.display="block";
                }
            });
    }

    /**
     * Construct one product html node.
     * @param {*} elementCartItem template HTMLobject
     * @param {*} product object to render
     * @returns 
     */
    #buildCartElementProduct = function (elementCartItem, product) {
        elementCartItem.dataset.id = product.productId;
        elementCartItem.dataset.color = product.color;
        const elementProductPicture = elementCartItem.querySelector(".cart__item__img img");
        elementProductPicture.src = product.imageUrl;
        elementProductPicture.alt = product.altTxt;
        const elementProductName = elementCartItem.querySelector(".cart__item__content__titlePrice h2");
        elementProductName.innerText = product.name + "-" + product.color;
        const elementProductPrice = elementCartItem.querySelector(".cart__item__content__titlePrice p");
        elementProductPrice.innerText = product.price + " €";
        const elementProductQuantity = elementCartItem.querySelector("div.cart__item__content__settings__quantity input");
        elementProductQuantity.value = product.quantity;
        const elementQuantityUpdate = elementCartItem.querySelector(".itemQuantity");
        elementQuantityUpdate.addEventListener("change", this.#quatityChangeManager);
        const elementRemoveButton = elementCartItem.querySelector(".deleteItem");
        elementRemoveButton.addEventListener("click", this.#removeItemManager);
        return elementCartItem;
    }

    /**
     * Update cart then refresh the page
     * @param {*} eventData 
     */
    #quatityChangeManager = function (eventData) {
        const elementArticle = this.closest("article");
        const productId = elementArticle.dataset.id;
        const color = elementArticle.dataset.color;
        cartDao.store(productId, color, this.value);
        window.location.assign("cart.html");
    }

    /**
     * Remove one product the refresh the page
     * @param {*} eventData 
     */
    #removeItemManager = function (eventData) {
        const elementArticle = this.closest("article");
        const productId = elementArticle.dataset.id;
        const color = elementArticle.dataset.color;
        cartDao.delete(productId, color);
        window.location.assign("cart.html");
    }

    /**
     * Perform the validation of the order
     * @param {*} event Button 's event
     */
    #orderHandler = function (event) {
        event.preventDefault();
        let formValidity = true;

        const elementFirstName = document.getElementById("firstName");
        const elementFirstNameMessage = document.getElementById("firstNameErrorMsg");
        elementFirstNameMessage.innerText = "";
        if (new RegExp("^.*[0-9].*$").test(elementFirstName.value)) {
            elementFirstNameMessage.innerText = "Saisie incorrecte, une valeur numérique est présente";
            formValidity = false;
        }

        const elementLastName = document.getElementById("lastName");
        const elementLastNameMessage = document.getElementById("lastNameErrorMsg");
        elementLastNameMessage.innerText = "";
        if (new RegExp("^.*[0-9].*$").test(elementLastName.value)) {
            elementLastNameMessage.innerText = "Saisie incorrecte, une valeur numérique est présente";
            formValidity = false;
        }

        const elementCity = document.getElementById("city");
        const elementCityMessage = document.getElementById("cityErrorMsg");
        elementCityMessage.innerText = "";
        if (new RegExp("^.*[0-9].*$").test(elementCity.value)) {
            elementCityMessage.innerText = "Saisie incorrecte, une valeur numérique est présente";
            formValidity = false;
        }

        const elementEmail = document.getElementById("email");
        const elementEmailMessage = document.getElementById("emailErrorMsg");
        elementEmailMessage.innerText = "";
        if (!validateEmail(elementEmail.value)) {
            elementEmailMessage.innerText = "Saisie incorrecte, format d'email incorrecte";
            formValidity = false;
        }

        if (!formValidity) {
            return;
        }

        // Send contact and all products to the server
        const contact = {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            address: document.getElementById("address").value,
            city: document.getElementById("city").value,
            email: document.getElementById("email").value
        }

        const cart = cartDao.load();
        const cartIdList = Object.keys(cart);

        let productIds = cartIdList;
        productDao.order_(contact, productIds)
            .then((reponse) => {
                const uRLSearchParams = new URLSearchParams();
                uRLSearchParams.set("orderId", reponse.orderId);
                const urlDest = "confirmation.html?" + uRLSearchParams.toString();
                window.location.assign(urlDest);
            });
    }
}

/**
 * Check email structure
 * @param {*} value to check 
 * @returns 
 */
function validateEmail(value) {
    //const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const validRegex =    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return value.toLowerCase().match(validRegex);
}
module.exports = CartController;
