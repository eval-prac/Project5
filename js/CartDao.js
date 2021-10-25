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
