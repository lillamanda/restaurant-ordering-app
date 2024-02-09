import { menuArray, discountCodesArr, ordersArr } from "/data.js"
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const discountCodeInputEl = document.getElementById("discount-code-input");
const discountFeedbackMsgEl = document.getElementById("discount-feedback-msg");

const orderEl = document.getElementById("order-el");
const totalSumEl = document.getElementById("total-sum-el");
const discountEl = document.getElementById("discount-el");

let order = [];

let addedDiscountCode;

let orderSum = 0;  
let discountSum = 0;
let totalSumAfterDiscount = 0;

let ratingGiven = false;

class OrderReceipt{
    constructor(currentOrderList, currentOrderSum, currentDiscountSum, customerName, creditcard){

        // Note: I know a uuid isn't needed in this case, and that it should not be manipulated in this way. 
        // Also, order numerations would ideally be sequential, but I wanted to practice using UUID, 
        // - and the manipulation of the string was just added bonus practice :)
        this.uuid = uuidv4().replace(/\D/g, "").substring(0,5);

        this.orderedItems = currentOrderList; 
        this.receiptOrderSum = currentOrderSum;
        this.receiptDiscount = currentDiscountSum; 
        this.receiptSumAfterDiscount = this.receiptOrderSum - this.receiptDiscount; 

        this.customerName = customerName.trim();
        this.creditcardBlanked = `**** **** **** ${creditcard.trim().substr(-4, 4)}`;
    }

    getReceiptHtml() {
        const itemList = this.orderedItems.map(function(item){
            const { orderAmount, name, price } = item; 

            return `
                <p class="itemized-line">${orderAmount} ${name} 
                    <span class="margin-left-auto">$${price}</span>
                </p>
            ` 
        }).join("")

        const discountLineReceipt = this.receiptDiscount > 0 ? 
            `<p class="itemized-line">Discount <span class="margin-left-auto">- $${this.receiptDiscount.toFixed(2)}</span></p>
            <hr>` 
            : ""

        return `            
            <div class="receipt">
                <h1>Order receipt</h1>
                <p>Order ID: ${this.uuid}</p>
                ${itemList}
                <hr>
                ${discountLineReceipt}
                <p class="itemized-line bold">Total sum <span class="margin-left-auto">$${this.receiptSumAfterDiscount.toFixed(2)}</span></p>
                <br>
                <p>Customer: 
                <br>${this.customerName}</p>
                <p>Paid with creditcard: 
                <br>${this.creditcardBlanked}</p>
            </div>`
    }

}

renderMenu();

document.querySelector("#discount-code-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("add-discount-btn").click();
    }
});

document.addEventListener("click", function(e){

    if(e.target.dataset.order){
        const currentItem = menuArray.filter(function(menuItem){
            return menuItem.id.toString() === e.target.dataset.order;
        })[0]
        
        addToCart(currentItem)
    }

    else if (e.target.id === "order-btn" && order.length > 0){
        toggleDisplay("payment-modal", true);
    }

    else if (e.target.dataset.remove){
        removeItem(e.target.dataset.remove)
    }

    else if (e.target.dataset.close){
        toggleDisplay(e.target.dataset.close, false)
    }

    else if (e.target.id === "pay-btn"){
        e.preventDefault();

        if(document.getElementById("payment-form").reportValidity()){
            
            toggleDisplay("payment-modal", false);

            const customerName = document.querySelector("#name").value;
            const creditcardNumber = document.querySelector("#card-number").value;

            const orderReceipt = new OrderReceipt(order, orderSum, discountSum, customerName, creditcardNumber);

            ordersArr.push(orderReceipt);

            renderOrderConfirmationModal(orderReceipt);


        }

        // clear all orderfields and the orderList, discount code etc.

    }
    else if (e.target.id === "add-discount-btn"){
        validateAndSetDiscountCode(discountCodeInputEl.value)
    }

    else if (e.target.dataset.star){    
        if(!ratingGiven){
            renderStarsGiven(e.target.dataset.star);
            ratingGiven = true;
            toggleDisplay("feedback-to-user-after-rating", true)
        }
        else{
            toggleDisplay("double-voting-error-message", true)
        }
    }

})

function toggleDisplay(elementID, willDisplay){
    if(willDisplay){
        document.getElementById(elementID).classList.remove("display-none");
    }
    else if (!willDisplay){
        document.getElementById(elementID).classList.add("display-none");
    }
}

function resetOrder(){
    // Clear orderlist
    // Clear discount
    // Clear payment form fields
}

function renderOrderConfirmationModal(receipt){

    toggleDisplay("order-confirmation-modal", true)

    const customerFirstName = receipt.customerName.split(" ");
    document.getElementById("thank-you-customer").innerHTML = `<h1 class="bold">Thank you, ${customerFirstName[0]}!</h1>`

    // I'm getting names from form - should I use something other than innerHTML?
    document.getElementById("order-information-el").innerHTML = receipt.getReceiptHtml();
}

function renderStarsGiven(numberOfStarsClicked){
    const ratingStars = document.getElementsByClassName("rating-stars"); 

    for (let i = 0; i < numberOfStarsClicked; i++){
        ratingStars[i].classList.remove("fa-regular");
        ratingStars[i].classList.add("fa-solid")
    }
}

// can not give discount on beer? Should there be a "discount-eligibility"-property on the menu-items? 
function validateAndSetDiscountCode(inputCode){    
    // const inputCode = discountCodeInputEl.value;

    const filteredDiscountCodeArr = discountCodesArr.filter(function(discountCode){
        return discountCode.code === inputCode.trim().toUpperCase();
    })
    
    resetDiscountFeedback();

    let discountFeedbackMsg = "";

    if(filteredDiscountCodeArr.length>0){
        addedDiscountCode = filteredDiscountCodeArr[0];
        discountFeedbackMsg = `"${inputCode}" has been added to your order`
        renderOrderSection("discountcode added");
    }
    else{ 
        discountCodeInputEl.classList.add("input-error")
        discountFeedbackMsgEl.classList.add("error-msg")
        discountFeedbackMsg = `Sorry, "${inputCode}" is not a valid discount code`
    }

    discountFeedbackMsgEl.textContent = discountFeedbackMsg;

}

function resetDiscountFeedback(){
    discountFeedbackMsgEl.textContent = ""
    discountFeedbackMsgEl.classList.remove("error-msg")
    discountCodeInputEl.classList.remove("input-error")
    discountCodeInputEl.value="";
}

function addToCart(item){
    item.orderAmount += 1;

    if(!order.includes(item)){
        order.push(item)
    }

    renderOrderSection();
}

function removeItem(itemId){
    const orderItem = order.filter(item => item.id.toString() === itemId)[0];

    orderItem.orderAmount -= 1; 

    if(orderItem.orderAmount <= 0){
        const filteredOrder = order.filter(item => item !== orderItem)
        order = filteredOrder;
    }

    renderOrderSection()
}

function renderMenu(){
    document.getElementById("menu").innerHTML = getMenuHtml();
}

function getMenuHtml(){

    const menuHtml = menuArray.map(function(menuItem){
        const {image, name, ingredients, price, id} = menuItem;

        return `                
        <div class="itemized-line menu-item">
            <img class="item-img" src="img/${image}">
            <div class="item-info">
                <h1>${name}</h1>
                <p class="item-ingredient-list">${ingredients.join(", ")}</p>
                <p class="item-price">$${price}</p>
            </div>
            <img src="img/add-btn.png" class="margin-left-auto add-item-btn" data-order="${id}">
        </div>` 
    }).join("")

    return menuHtml;

}

function renderOrder(){ 

    const orderHtml = order.map(function(item){
        const {name, price, id, orderAmount} = item; 
        
        return `                    
        <div class="itemized-line ordered-item">
            <span class="ordered-item-amount">${orderAmount}</span> 
            <span class="slight-indent">${name}</span>
            <span class="slight-indent remove-ordered-item" data-remove="${id}">remove</span>
            <span class="margin-left-auto ordered-item-price">$${price*orderAmount}</span>
        </div>
        ` 

    }).join("");

    orderEl.innerHTML = `
        <div class="order-list" id="order">
            ${orderHtml}
        </div>`

}

function renderTotalSum(){

    // calculateOrderSum();
    // renderDiscount()

    // OR : return html to render in order

    // Maybe remove total-sum? replace it with h1 or a boldandbig-class?
    totalSumEl.innerHTML = `   
    <div class="itemized-line total-sum">
        Total price: <span class="margin-left-auto">$${totalSumAfterDiscount.toFixed(2)}</span>
    </div>`

}

function calculateOrderSum(){
    orderSum = order.reduce(function(total, currentItem){
        const currentItemTotalSum = currentItem.price * currentItem.orderAmount;
        return total + currentItemTotalSum;
    }, 0)

    // addedDiscountCode && calculateDiscount(); <- I know you can type the following like this, but I prefer the readability of the code below
    if (addedDiscountCode){
        calculateDiscount();
    }
    
    totalSumAfterDiscount = orderSum - discountSum;

}

function calculateDiscount(){
    if(orderSum >= addedDiscountCode.minimumOrderSum && addedDiscountCode.discountType === "USD"){
        discountSum = addedDiscountCode.discount;
    }
    else if (orderSum >= addedDiscountCode.minimumOrderSum && addedDiscountCode.discountType === "PCT") {
        discountSum = orderSum*addedDiscountCode.discount/100;
    }
    else if (orderSum<addedDiscountCode.minimumOrderSum){
        discountSum = 0;
    }
}

function renderDiscount(){

    let discountHtml = "";

    if (addedDiscountCode){

        const discountPromptSum = addedDiscountCode.minimumOrderSum > orderSum ? addedDiscountCode.minimumOrderSum - orderSum : 0;
        const discountPrompt = discountPromptSum ? `Order for $${discountPromptSum} more to qualify for the discount`: "";
        
        discountHtml = `
        <div class="itemized-line">
            Discount:   
            <span class="slight-indent">${addedDiscountCode.description}</span>
            <span class="margin-left-auto">${discountPrompt}</span>
            <span class="margin-left-auto">$${discountSum.toFixed(2)}</span> 
        </div>`     
    }

    discountEl.innerHTML = discountHtml;

}

function clearOrderSection(){
    orderEl.innerHTML = "";
    totalSumEl.innerHTML = "";
    discountEl.innerHTML = "";
    toggleDisplay("discount-code-el", false)
}

function renderOrderSection(discountAdded = false){ 

    // add possibility to remove discount code? 

    if(!discountAdded){
        resetDiscountFeedback();
    }

    calculateOrderSum(); 

    document.getElementById("order-btn").disabled = order.length > 0 ? false : true;
    
    if (order.length === 0){
        clearOrderSection()
    }
    else{
        toggleDisplay("discount-code-el", true);
        renderOrder()
        renderDiscount();
        renderTotalSum();
    }
}

// add app functionality from shopping-app? 

