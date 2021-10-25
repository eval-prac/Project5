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
