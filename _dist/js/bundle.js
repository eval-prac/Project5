(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./CartDao":2,"./ProductDao":6}],2:[function(require,module,exports){
const CARD_ID="cart";

/**
 * Class used for persistance of cart in the local session storage.
 */
class CartDao {
    constructor() {
    }

    /**
     * Load the cart from session storage
     * @returns cart object
     */
    load() {
        const cartString = window.sessionStorage.getItem(this.CARD_ID);
        if ( cartString!=null ) {
          return JSON.parse(cartString);
        } else {
          return {};
        }
    }
    
    /**
     * Save the cart in session storage
     * @param {*} cart 
     */
    save(cart) {
        window.sessionStorage.setItem(this.CARD_ID, JSON.stringify(cart) );
    }

    /**
     * Clear the cart
     */
    clear() {
        window.sessionStorage.setItem(this.CARD_ID, "{}");
    }

    /**
     * Delete the product of productId and color
     * @param {*} productId 
     * @param {*} color 
     */
    delete(productId, color) {
        let cart = this.load();
        delete cart[productId][color];
        this.save(cart);
    }

    /**
     * Store one product in the cart in session storage
     * @param {*} productId 
     * @param {*} color 
     * @param {*} value 
     */
    store(productId, color, value) {
        value=value*1;
        let cart = this.load();
        if (value===0) {
            delete cart[productId][color];
        } else {
            cart[productId][color]=value;
        }
        this.save(cart);
    }

    /**
     * Add the number of product with value where productId and color parameters
     * @param {*} productId 
     * @param {*} color 
     * @param {*} value 
     */
    add(productId, color, value) {
        value=value*1;
        let cart = this.load();
        if (cart[productId] == null) {
            cart[productId] = { [color]: value * 1 };
        } else if (cart[productId][color] == null) {
            cart[productId][color] = value * 1;
        } else {
            cart[productId][color] = cart[productId][color] * 1 + value * 1;
        }
        this.save(cart);
    }

}  

module.exports=CartDao;

},{}],3:[function(require,module,exports){
const CartDao = require("./CartDao");
const cartDao = new CartDao();

/**
 * Class used as controller of page confirmation
 */
class ConfirmationController {
    constructor() {
    }

    /**
     * Initialise the page
     */
    init() {
        const uRLSearchParams = new URLSearchParams(window.location.search);
        this.#renderOrderNumber(uRLSearchParams.get("orderId"));
    }

    /**
     * Render the orderID area
     * @param {*} orderId 
     */
    #renderOrderNumber = function (orderId) {
        const elementOrderId = document.getElementById("orderId");
        elementOrderId.innerText = orderId;
        cartDao.clear();
    }

}
module.exports = ConfirmationController;

},{"./CartDao":2}],4:[function(require,module,exports){
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

},{"./ProductDao":6}],5:[function(require,module,exports){
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

},{"./CartDao":2,"./ProductDao":6}],6:[function(require,module,exports){
const URI_POST="order";

/**
 * Class used for persistance of products
 */
class ProductDao {
  constructor (endPoint) {
    this.endPoint = endPoint;
  }

  /**
   * Get all the products
   * @returns Objects product
   */
  getAll_() {
    return fetch(this.endPoint)
    .then( (resp)=> {
      return resp.json();
    } );
  }

  /**
   * Get the product object
   * @param {*} productId 
   * @returns One object product
   */
  getById_(productId) {
    return fetch( this.endPoint+"/"+productId )
    .then( (resp)=>{
      return resp.json();
    });
  }

  /**
  * Subit the order form
  * contact     object    Structure of the contact
  * productIds  string[]  products list of ID 
  */
  order_(contact,productIds) {
    let dataStructure = {};
    dataStructure.contact=contact;
    dataStructure["products"]=productIds;
    return fetch( this.endPoint +"/"+ URI_POST, {
            method: "POST",
            headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(dataStructure)
          } )
      .then((resp)=>{
        return resp.json();
      });
  }
}

module.exports = ProductDao;

},{}],7:[function(require,module,exports){

/**
 * Main javascript file
 */

const CartController = require("./CartController");
const cartController = new CartController();
const ConfirmationController = require("./ConfirmationController");
const confirmationController = new ConfirmationController();
const IndexController = require("./IndexController");
const indexController = new IndexController();
const ProductController = require("./ProductController");
const productController = new ProductController();

/**
 * Calls to one of the controllers
 */
let pageName=window.location.pathname.split("/").pop();
if ( pageName==="index.html" ) {
  indexController.init();
} else if ( pageName==="product.html" ) {
  try {
    productController.init();
  } catch ( er ) {
    window.location.assign("index.html");
  }
} else if ( pageName==="cart.html" ) {
  cartController.init();
} else if ( pageName==="confirmation.html") {
  confirmationController.init();
}

},{"./CartController":1,"./ConfirmationController":3,"./IndexController":4,"./ProductController":5}]},{},[7]);
