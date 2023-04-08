//* variables

const cartBtn = document.querySelector(".cartBtn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];

//getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;

      let productsMapped = products.map((item) => {
        const { id } = item.sys;
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        return { id, title, price, image };
      });

      return productsMapped;
    } catch (error) {
      console.error(error.message);
    }
  }
}

//display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(({ image, id, title, price }) => {
      result += `
        <article class="product">
        <div class="img-container">
          <img
            src=${image}
            alt=${title}
            class="product-img"
          />

          <button class="bag-btn" data-id=${id}>
            <i class="fas fa-shopping-cart"></i>
            add to bag
          </button>
        </div>
        <h3>${title}</h3>
        <h4>$ ${price}</h4>
      </article>
        `;
    });
    productsDOM.innerHTML = result;
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  //! get all products
  products.getProducts().then((products) => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
  });
});
