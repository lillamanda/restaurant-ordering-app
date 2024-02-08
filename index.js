import { menuArray, discountCodesArr, ordersArr } from "/data.js"
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const discountCodeInputEl = document.getElementById("discount-code-input");
const discountFeedbackMsgEl = document.getElementById("discount-feedback-msg");
const paymentModalEl = document.getElementById("payment-modal");
const orderConfirmationModalEl = document.getElementById("order-confirmation-modal");

const orderEl = document.getElementById("order-el");
const totalSumEl = document.getElementById("total-sum-el");
const discountEl = document.getElementById("discount-el");
const discountCodeEl = document.getElementById("discount-code-el");

let order = [];

let addedDiscountCode;

let orderSum = 0;  
let discountSum = 0;
let totalSumAfterDiscount = 0;

let ratingGiven = false;

class OrderReceipt{
    constructor(currentOrderList, currentOrderSum, currentDiscountSum, customerName, creditcard){
        // I know a uuid isn't needed in this case, and order numerations would ideally be sequential, but I wanted to practice it :)
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


        // Dont render a discount line if a discount was not given
        // render the name of the discount?? 

        return `            
            <div class="receipt">
                <h1>Order receipt</h1>
                <p>Order ID: ${this.uuid}</p>
                <br>
                ${itemList}
                <hr>
                <p class="itemized-line">Discount <span class="margin-left-auto">- $${this.receiptDiscount}</span></p>
                <hr>
                <p class="itemized-line bold">Total sum <span class="margin-left-auto">$${this.receiptSumAfterDiscount}</span></p>
                <br>
                <p>Customer: ${this.customerName}</p>
                <p>Paid with creditcard: 
                <br>${this.creditcardBlanked}</p>
            </div>`
    }

}

renderMenu();

document.addEventListener("click", function(e){

    // Add one for closing modal - if user clicks outside of the modal when its open 

    if(e.target.dataset.order){
        const currentItem = menuArray.filter(function(menuItem){
            console.log( typeof menuItem.id)
            return menuItem.id.toString() === e.target.dataset.order;
        })[0]
        
        addToCart(currentItem)
    }

    else if (e.target.id === "order-btn" && order.length > 0){
        paymentModalEl.classList.remove("display-none")
    }

    else if (e.target.dataset.remove){
        removeItem(e.target.dataset.remove)
    }
    else if (e.target.dataset.close){
        document.getElementById(e.target.dataset.close).classList.add("display-none")
    }
    else if (e.target.id === "pay-btn"){
        e.preventDefault();

        // function to toggle modal? 
        paymentModalEl.classList.add("display-none");
        orderConfirmationModalEl.classList.remove("display-none");


        const customerName = document.querySelector("#name").value;
        const creditcardNumber = document.querySelector("#card-number").value;

        // create OrderReceipt
        const orderReceipt = new OrderReceipt(order, orderSum, discountSum, customerName, creditcardNumber);

        // ordersArr.push(orderReceipt)
        renderOrderConfirmationModal(orderReceipt);

        // clear all orderfields

        // provide a star-review-option to be stored somewhere?

        // add all info from fields into new const and log this out. - or save it to an object array in data.js
        // close modal, give a new pop up with "order received - and a star-rating?"
    }
    else if (e.target.id === "add-discount-btn"){
        validateAndSetDiscountCode(discountCodeInputEl.value)
    }

    else if (e.target.dataset.star){
        
        if(!ratingGiven){
            renderStarsGiven(e.target.dataset.star);
            ratingGiven = true;
            document.getElementById("feedback-to-user-after-rating").classList.remove("display-none")
        }
        else{
            document.getElementById("double-voting-error-message").classList.remove("display-none")
        }
    }

})

function renderOrderConfirmationModal(receipt){

    const orderConfirmationModalEl = document.getElementById("order-confirmation-modal");

    orderConfirmationModalEl.classList.remove("display.none");

    const customerFirstName = receipt.customerName.split(" ");
    console.log(customerFirstName)
    console.log(customerFirstName[0])
    document.getElementById("thank-you-customer").innerHTML = `Thank you, ${customerFirstName[0]}!`

    // I'm getting names form form - should I use something other than innerHTML?
    document.getElementById("order-information-el").innerHTML = receipt.getReceiptHtml();

    // Thank you, NAME
    //receipt

    // Rate your order experience staricons - fill them or not based on where the user clicks
}

// console.log(document.getElementsByClassName("rating-stars"))
// console.log(typeof document.getElementsByClassName("rating-stars"))


function renderStarsGiven(numberOfStarsClicked){
    const ratingStars = document.getElementsByClassName("rating-stars"); 
    // resetStars(ratingStars);

    for (let i = 0; i < numberOfStarsClicked; i++){
        ratingStars[i].classList.remove("fa-regular");
        ratingStars[i].classList.add("fa-solid")
    }
}

// function resetStars(stars){
//     rateExperienceEl.innerHTML = `
//         <i class="fa-regular fa-star rating-stars" data-star="1"></i>
//         <i class="fa-regular fa-star rating-stars" data-star="2"></i>
//         <i class="fa-regular fa-star rating-stars" data-star="3"></i>
//         <i class="fa-regular fa-star rating-stars" data-star="4"></i>
//         <i class="fa-regular fa-star rating-stars" data-star="5"></i>
//         `
//     // for (let i = 0; i<stars.length; i++){    
//     //     stars[i].classList.add("fa-regular");
//     //     stars[i].classList.remove("fa-solid")
//     // }
// }

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
    // add these to global: 
    orderEl.innerHTML = "";
    totalSumEl.innerHTML = "";
    discountEl.innerHTML = "";
    discountCodeEl.classList.add("display-none")
}

function renderOrderSection(discountAdded = false){ 

    // add possibility to remove discount code? 

    if(!discountAdded){
        resetDiscountFeedback();
    }

    calculateOrderSum(); 

    //change discount-sum-line to discount-el? 

    document.getElementById("order-btn").disabled = order.length > 0 ? false : true;
    
    if (order.length === 0){
        clearOrderSection()
    }
    else{
        discountCodeEl.classList.remove("display-none")
        renderOrder()
        renderDiscount();
        renderTotalSum();
    }
}

// add app functionality from shopping-app? 

