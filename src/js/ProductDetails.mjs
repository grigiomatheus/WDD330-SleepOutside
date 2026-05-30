import { getLocalStorage, setLocalStorage, updateCartCount } from "./utils.mjs";

const COMMENTS_KEY = "so-product-comments";

function getProductComments(productId) {
  const allComments = getLocalStorage(COMMENTS_KEY) || {};
  return allComments[productId] || [];
}

function saveProductComments(productId, comments) {
  const allComments = getLocalStorage(COMMENTS_KEY) || {};
  allComments[productId] = comments;
  setLocalStorage(COMMENTS_KEY, allComments);
}

export default class ProductDetails {

  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.comments = [];
    this.dataSource = dataSource;
  }

  async init() {
    // use the datasource to get the details for the current product. findProductById will return a promise! use await or .then() to process it
    this.product = await this.dataSource.findProductById(this.productId);
    this.comments = getProductComments(this.productId);

    // the product details are needed before rendering the HTML
    this.renderProductDetails();
    updateCartCount();
    
    // once the HTML is rendered, add a listener to the Add to Cart button
    // Notice the .bind(this). This callback will not work if the bind(this) is missing. Review the readings from this week on 'this' to understand why.
    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));

    document
      .getElementById("commentForm")
      .addEventListener("submit", this.addComment.bind(this));
  }

  addProductToCart() {
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const cartItems = getLocalStorage("so-cart") || [];
    const existing = cartItems.find((item) => item.Id === this.product.Id);
    if (existing) {
      existing.Quantity = (existing.Quantity || 1) + quantity;
    } else {
      this.product.Quantity = quantity;
      cartItems.push(this.product);
    }
    setLocalStorage("so-cart", cartItems);
    updateCartCount();
  }

  addComment(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("commentName")?.toString().trim();
    const text = formData.get("commentText")?.toString().trim();

    if (!name || !text) {
      form.reportValidity();
      return;
    }

    this.comments.unshift({
      id: `${this.productId}-${Date.now()}`,
      name,
      text,
      createdAt: new Date().toISOString(),
    });

    saveProductComments(this.productId, this.comments);
    this.renderComments();
    form.reset();
  }

  renderProductDetails() {
    const main = document.querySelector("main");

    if (!main) {
      return;
    }

    main.innerHTML = productDetailsTemplate(this.product);
    document.title = `Sleep Outside | ${this.product.NameWithoutBrand}`;
    this.renderComments();
  }

  renderComments() {
    const commentCount = document.getElementById("commentCount");
    const commentList = document.getElementById("commentList");

    if (!commentCount || !commentList) {
      return;
    }

    commentCount.textContent = this.comments.length;
    commentList.innerHTML = "";

    if (this.comments.length === 0) {
      const emptyState = document.createElement("li");
      emptyState.className = "comment-list__empty";
      emptyState.textContent = "No comments yet. Be the first to share feedback on this product.";
      commentList.appendChild(emptyState);
      return;
    }

    this.comments.forEach((comment) => {
      const item = document.createElement("li");
      item.className = "comment-card";

      const meta = document.createElement("p");
      meta.className = "comment-card__meta";
      meta.textContent = `${comment.name} · ${new Date(comment.createdAt).toLocaleString()}`;

      const body = document.createElement("p");
      body.className = "comment-card__body";
      body.textContent = comment.text;

      item.append(meta, body);
      commentList.appendChild(item);
    });
  }
}

function productDetailsTemplate(product) {
  return `<section class="product-detail"> <h3>${product.Brand.Name}</h3>
    <h2 class="divider">${product.NameWithoutBrand}</h2>
    <img
      class="divider"
      src="${product.Images?.PrimaryLarge ?? product.Image}"
      alt="${product.NameWithoutBrand}"
    />
    <p class="product-card__price">$${product.FinalPrice}</p>
    <p class="product__color">${product.Colors?.[0]?.ColorName ?? "See product details"}</p>
    <p class="product__description">
    ${product.DescriptionHtmlSimple}
    </p>
    <div class="product-detail__add">
      <label for="quantity">Qty:
        <input type="number" id="quantity" name="quantity" value="1" min="1" max="99" />
      </label>
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    </div>
    <section class="product-comments" aria-labelledby="product-comments-title">
      <h3 id="product-comments-title" class="divider">Customer Comments (<span id="commentCount">0</span>)</h3>
      <form id="commentForm" class="comment-form">
        <label for="commentName">Your Name
          <input id="commentName" name="commentName" type="text" maxlength="40" required />
        </label>
        <label for="commentText">Your Comment
          <textarea id="commentText" name="commentText" rows="4" maxlength="400" required></textarea>
        </label>
        <button type="submit">Add Comment</button>
      </form>
      <ul id="commentList" class="comment-list"></ul>
    </section></section>`;
}