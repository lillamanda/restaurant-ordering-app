import { menuArray, discountCodesArr } from "/data.js"

const modalEl = document.getElementById("payment-modal"); 
const discountCodeInputEl = document.getElementById("discount-code-input");
const discountFeedbackMsgEl = document.getElementById("discount-feedback-msg");

let order = [];

let addedDiscountCode;

let orderSum = 0;  
let discountSum = 0;
let totalSumAfterDiscount = 0;


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
        modalEl.classList.remove("display-none")
    }

    else if (e.target.dataset.remove){
        removeItem(e.target.dataset.remove)
    }
    else if (e.target.id === "close-modal-btn"){
        modalEl.classList.add("display-none")
    }
    else if (e.target.id === "pay-btn"){
        // check if all fields are filled
        // add all info from fields into new const and log this out. - or save it to an object array in data.js
        // close modal, give a new pop up with "order received - and a star-rating?"
    }
    else if (e.target.id === "add-discount-btn"){
        
        // adding multiple codes just overwrites the previous
        // if(!addedDiscountCode){ } 

        validateAndSetDiscountCode()

        // change sum-function to include potential discount codes - default value being 0.

    }

})

function validateAndSetDiscountCode(){
    // can not give discount on beer? Should there be a "discount-eligibility"-property on the menu-items? 
    
    const inputCode = discountCodeInputEl.value;

    const filteredDiscountCodeArr = discountCodesArr.filter(function(discountCode){
        return discountCode.code === inputCode.trim().toUpperCase();
    })
    
    resetDiscountFeedback();

    let discountFeedbackMsg = "";

    if(filteredDiscountCodeArr.length>0 && orderSum >= filteredDiscountCodeArr[0].minimumOrderSum){
        console.log("code exists and criteria is met");
        addedDiscountCode = filteredDiscountCodeArr[0];

        // add "order xx more to qualify for this discount code" - or make this on the line for the discount
        discountFeedbackMsg = `"${inputCode}" has been added to your order`

        renderOrderSection("discountcode added");
    }
    else if(filteredDiscountCodeArr.length>0 && orderSum < filteredDiscountCodeArr[0].minimumOrderSum){
        console.log("code exists, but criteria is not met");
        addedDiscountCode = filteredDiscountCodeArr[0];
        discountFeedbackMsg = `"${inputCode}" has been added to your order`

        renderOrderSection("discountcode added");

        // add  functionality in renderOrder for when criteria is met - or how much missing before the criteria is met
    }
    else{ 
        console.log("code does not exist");
        discountCodeInputEl.classList.add("input-error")
        discountFeedbackMsgEl.classList.add("error-msg")
        discountFeedbackMsg = `Sorry, "${inputCode}" is not a valid discount code`
    }

    discountFeedbackMsgEl.textContent = discountFeedbackMsg;

    // setTimeout(resetDiscountFeedback, "5000");

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
        <div class="menu-item">
            <img class="item-img" src="img/${image}">
            <div class="item-info">
                <h1>${name}</h1>
                <p class="item-ingredient-list">${ingredients.join(", ")}</p>
                <p class="item-price">$${price}</p>
            </div>
            <img src="img/add-btn.png" class="add-item-btn" data-order="${id}">
        </div>` 
    }).join("")

    return menuHtml;
}

function renderOrder(){ 

    const orderHtml = order.map(function(item){
        const {name, price, id, orderAmount} = item; 
        
        return `                    
        <div class="ordered-item">
            <span class="ordered-item-amount">${orderAmount}</span> 
            <span class="ordered-item-name">${name}</span>
            <span class="remove-ordered-item" data-remove="${id}">remove</span>
            <span class="ordered-item-price">$${price*orderAmount}</span>
        </div>
        ` 

    }).join("");
    

    document.getElementById("order-el").innerHTML = `
    <div class="order-list" id="order">
        ${orderHtml}
    </div>`

}



function renderTotalSum(){

    // calculateOrderSum();
    // renderDiscount()

    document.getElementById("total-sum-el").innerHTML = `   
    <div class="sum-line total-sum">
        Total price: <span class="order-sum">$${totalSumAfterDiscount.toFixed(2)}</span>
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
        discountHtml = `
        <div class="sum-line">
            Discount:   
            <span class="discount-description">${addedDiscountCode.description}</span>
            <span class="discount-sum">$${discountSum.toFixed(2)}</span> 
        </div>`     
    }

    document.getElementById("discount-el").innerHTML = discountHtml;

}

function clearOrderSection(){
    document.getElementById("order-el").innerHTML = "";
    document.getElementById("total-sum-el").innerHTML = "";
}

function renderOrderSection(discountAdded = false){ 

    // add possibility to remove discount code? 
    // add functionality to show how much more you need to order to hit the discount requirement

    // should the discount code field be visible when no items have been added? 



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
        renderOrder()
        renderDiscount();
        renderTotalSum();
    }
}


renderMenu();
