
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
