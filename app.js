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
const cartNav = document.querySelector(".cart-btn");

//* cart
let cart = [];
let buttonsDOM = [];

//*getting the products
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
            add to cart
          </button>
        </div>
        <h3>${title}</h3>
        <h4>$ ${price}</h4>
      </article>
        `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];

    buttonsDOM = buttons;

    buttons.forEach((button) => {
      let id = button.dataset.id;
      let incart = cart.find((item) => item.id === id);

      if (incart) {
        button.textContent = "In Cart";
        button.disabled = true;
      } else {
        button.addEventListener("click", (e) => {
          e.target.textContent = "In Cart";
          e.target.disabled = true;

          //* get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };

          //*add product to the cart
          cart = [...cart, cartItem];

          //* save cart in local storage
          Storage.saveCart(cart);

          //* set cart values
          this.setCartValues(cart);

          //*display cart item
          this.addCartItem(cartItem);

          //*show the cart
          this.showCart();
        });
      }
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;

    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    cartTotal.textContent = parseFloat(tempTotal.toFixed(2));
    cartItems.textContent = itemsTotal;
  }
  addCartItem({ image, title, price, id, amount }) {
    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
    <img src=${image} alt=${title} />
    <div>
      <h4>${title}</h4>
      <h5>$ ${price}</h5>
      <span class="remove-item" data-id=${id}>Remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${id}></i>
      <p class="item-amount">${amount}</p>
      <i class="fas fa-chevron-down" data-id=${id}></i>
    </div>
    `;

    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    cart = Storage.getCart();

    this.setCartValues(cart);
    this.populateCart(cart);

    cartBtn?.addEventListener("click", this.showCart);
    cartNav?.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    //* clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    //* cart functionality
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;

        cartContent.removeChild(removeItem.parentElement.parentElement);

        this.removeItem(id);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);

        tempItem.amount = tempItem.amount + 1;

        Storage.saveCart(cart);
        this.setCartValues(cart);

        addAmount.nextElementSibling.textContent = tempItem.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);

        tempItem.amount = tempItem.amount - 1;

        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);

          lowerAmount.previousElementSibling.textContent = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);

    cartItems.forEach((id) => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);

    this.setCartValues(cart);
    Storage.saveCart(cart);

    let button = this.getSingleButton(id);

    button.disabled = false;
    button.innerHTML = `
    <i class="fas fa-shopping-cart"></i> add to cart
    `;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  //* setup APP
  ui.setupAPP();

  //! get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
