// cart controller
var cartController = (function() {

    // PRIVATE METHODS AND PROPERY
    var Cart = function(id, title, price, image) {
        this.id = parseInt(id);
        this.title = title;
        this.price = price;
        this.image = image;
        this.quantity = 1;
    };

    var deleteItemId = function(id) {
        if (id !== null) {
            data.totalQuantity -= data.product[id].quantity;
            data.totalPrice -= data.product[id].price;
            data.product.splice(id, 1);
            // console.log(data);
            localStorage.setItem('cart', JSON.stringify(data))
        }
    };

    // Carte global cart object
    var localst = {
        product: [],
        totalQuantity: 0,
        totalPrice: 0
    };
    
    var data;
    if (localStorage.getItem('cart') === null) {
        data = localStorage.setItem('cart', JSON.stringify(localst));
    } else {
        data = JSON.parse(localStorage.getItem('cart'));
    }

    // PUBLIC   
    return {
        getData: function() {
            return data;
        },
        addDataObj: function(datas) {
            var cartEl, storedItem;
            // remove $ symbolo
            if (localStorage.getItem('cart') !== null) {
                datas.price = datas.price.substring(0, datas.price.length - 1);
                datas.price = parseFloat(datas.price);
                datas.quantity = parseInt(datas.quantity);
                cartEl = new Cart(datas.id, datas.title, datas.price, datas.image);
                data.product.forEach(function(el) {
                    if (el.id === cartEl.id) {
                        storedItem = el;
                    }
                });
            }

            // check if isset this item
            if (storedItem) {
                // add quantiti and price
                storedItem.quantity++;
                storedItem.price = datas.price * storedItem.quantity;
                data.totalQuantity++;
                data.totalPrice += datas.price;
            } else {
                data.product.push(cartEl);
                data.totalQuantity++;
                data.totalPrice += datas.price;
            }

            // set localstorage
            if (data.totalPrice !== 0 && data.totalQuantity !== 0) {
                // set localstorage
                localStorage.setItem('cart', JSON.stringify(data));
            }

        },
        deleteItemFromID: function(id) {
            return deleteItemId(id);
        },
        updateProductItem: function(id, value) {
            value = parseInt(value);
            var oldPrice;
            if (value > 0) {
                if (id !== null) {
                    if (data.product[id].quantity > value) {
                        oldPrice = data.product[id].price;
                        data.totalQuantity -= (data.product[id].quantity - value);
                        data.product[id].price = (data.product[id].price / data.product[id].quantity) * value;
                        data.totalPrice -= (oldPrice - data.product[id].price);
                        data.product[id].quantity = value;
                    } else {
                        data.totalQuantity += (value - data.product[id].quantity);
                        oldPrice = data.product[id].price;
                        data.product[id].price = (data.product[id].price / data.product[id].quantity) * value;
                        data.totalPrice += (data.product[id].price - oldPrice);
                        data.product[id].quantity = value;
                    }
                    // console.log(data);
                    localStorage.setItem('cart', JSON.stringify(data));
                }
            } else if (value === 0) {
                deleteItemId(id);
            } 
        }
    }

})();

// iuser inetface controller
var UIController = (function () {

    var DOMstrings = {
        container: '.product--container',
        btn: 'fa-shopping-bag',
        topCartBox: '.hover--top--cart--box',
        totalPrice: '.total--price',
        totalQuantity: '.total--quantity',
        listElement: '.row-item',
        showingTotalQuantity: '.cart--total--quantity',
        deleteItem: 'fa-trash-alt',
        cartPgTotalPrice: '.cart--page--price',
        cartPgTotalQuy: '.cart--page--quantity',
        tBody: 'tbody',
        tbList: '.table--list',
        cartPgBtn: '.cart--items--container',
        inputQuantity: '.quantity--input'
    };

    var removeElement = function(selector) {
        var list = document.querySelectorAll(selector);
        for (var i = 0; i < list.length; i++) {
            list[i].parentNode.removeChild(list[i]);
        }
    }

    var cartUpdate = function(data) {
        var cartBox,cardElements = '', list, cardPgList = '', tableBody, tableList;
        var homePrice = document.querySelector(DOMstrings.totalPrice);
        var homeQuy = document.querySelector(DOMstrings.totalQuantity);
        var homeTopQuy = document.querySelector(DOMstrings.showingTotalQuantity);

        var cartTotal = document.querySelector(DOMstrings.cartPgTotalPrice);
        var cartQuy = document.querySelector(DOMstrings.cartPgTotalQuy);
        if (homePrice) {
            homePrice.textContent = data.totalPrice + ' $';
        }
        if (homeQuy) {
            homeQuy.textContent = data.totalQuantity;
        }
        if (homeTopQuy) {
            homeTopQuy.textContent = data.totalQuantity;
        }
        if (cartTotal) {
            cartTotal.textContent = data.totalPrice + ' $';
        }
        if (cartQuy) {
            cartQuy.textContent = data.totalQuantity;
        }

        tableBody = document.querySelector(DOMstrings.tBody);
        cartBox = document.querySelector(DOMstrings.topCartBox)

        data.product.forEach(function(el, index) {
            cardElements +=`
                <li class="flex v-center row-item">
                    <img src="${el.image}" alt="">
                    <div>
                        <p>${el.title} (${el.quantity})</p>
                        <span>${el.price} $</span>
                    </div>
                    <i class="fas fa-trash-alt" id="${index}"></i>
                </li>
            `;
            cardPgList += `
                <tr class="table--list">
                    <td>
                        <div class="img-block flex v-center">
                            <img src="${el.image}" alt="">
                            <p>${el.title}</p>
                        </div>
                    </td>
                    <td class="center">
                        <input id="${index}" class="quantity--input" required type="number" name="quantity" value="${el.quantity}" min="1" max="20">
                    </td>
                    <td class="center">${el.price} $</td>
                    <td class="center"><i id="${index}" class="fas fa-trash-alt"></i></td>
                </tr>
            `;
        });

        // remove element
        removeElement(DOMstrings.listElement);
        // remove element
        removeElement(DOMstrings.tbList);
        
        if (cartBox) {
            cartBox.insertAdjacentHTML('afterbegin', cardElements);
        }
        if (tableBody) {
            tableBody.insertAdjacentHTML('afterbegin', cardPgList);
        }
    };

    return {
        DOM: function() {
            return DOMstrings;
        },
        // select element from product ID
        selectProduct: function(id) {
            var fullID, ID;
            fullID = id.split('-');
            ID = fullID[1];
            return {
                id: ID,
                title: document.getElementById(`title-${ID}`).textContent,
                price: document.getElementById(`price-${ID}`).textContent,
                image: document.getElementById(`image-${ID}`).src
            }
        },
        displayTopCart: function(data) {
            return cartUpdate(data);
        }
    }

})(); 


// main controller
var appController = (function(cartC, UIC) {
    var fullCart, clickedBtn, DOM, delBtn, delCartBtn, quantiyField;
    DOM = UIC.DOM();
    // stored cart data
    fullCart = cartC.getData();
    // display cart
    UIC.displayTopCart(fullCart);
    // button add to cart
    clickedBtn = document.querySelector(DOM.container);
    // delete btn from hovered cart
    delBtn = document.querySelector(DOM.topCartBox);
    // delete btn from cart page
    delCartBtn = document.querySelector(DOM.cartPgBtn);
    // change input quantity
    quantiyField = document.querySelectorAll(DOM.inputQuantity);

    // setup all view
    var setupAddeventListener = function() {
        
        // 1. click add to card
        if (clickedBtn) {
            clickedBtn.addEventListener('click', addItems);    
        }
        // delete to cart item
        if (delBtn) {
            delBtn.addEventListener('click', deletItemFromId);
        }
        // delete item from cart page 
        if (delCartBtn) {
            delCartBtn.addEventListener('click', deletItemFromId);
        }
        // change input
        if (quantiyField) {
            quantiyField.forEach((el, i) => {
                el.addEventListener('blur', changeProductItem)
            });
        }
        
    }

    // add cart item
    var addItems = function(event) {
        var id = 0, product, sessionData;
        if (event.target.classList.contains(DOM.btn)) {
            id = event.target.parentElement.parentElement.id;
        }
        if (id !== 0 && id !== undefined) {
            // add to main cart data obj
            product = UIC.selectProduct(id);
            cartC.addDataObj(product);
            // display top cart
            UIC.displayTopCart(fullCart);
        }
    }
    // delete item
    var deletItemFromId = function (event) {
        var ID = null;
        if (event.target.classList.contains(DOM.deleteItem)) {
            ID = event.target.id;
            // call function which delete this item
            cartC.deleteItemFromID(ID);
            // update cart
            UIC.displayTopCart(fullCart);
        }
    }

    // change product item
    var changeProductItem = function (event) {
        var id = null;
        id = event.target.id;
        // call update function
        cartC.updateProductItem(id, event.target.value);
        // update cart
        UIC.displayTopCart(fullCart);
    };
    
    return {
        init: function() {
            console.log('The gio`s shopping cart is runing...');
            setupAddeventListener();
        }
    }

})(cartController, UIController);

appController.init();

