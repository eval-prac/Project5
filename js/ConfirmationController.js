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
