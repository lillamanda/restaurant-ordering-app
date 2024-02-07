import { menuArray, discountCodesArr } from "/data.js"
// import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const menuEl = document.getElementById("menu");
const orderEl = document.getElementById("order"); 
const modalEl = document.getElementById("payment-modal"); 
const discountCodeInputEl = document.getElementById("discount-code-input");
const discountFeedbackMsg = document.getElementById("discount-feedback-msg");

let order = [];
let orderSum = 0; 
let addedDiscountCode; 
let discountSum = 0;
// let discountFeedbackMsg = "";

document.addEventListener("click", function(e){

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

    // Should the discountvalidchecker also give feedback if required order amount is not yet reached
    // need to give feedback on valid codes, where requirements are not met! 
    // can not give discount on beer? Should there be a "discount-eligibility"-property on the menu-items? 
    
    // render order needs to also display added discount code name


    // resetDiscountFeedback()


    const filteredDiscountCodeArr = discountCodesArr.filter(function(discountCode){
        return discountCode.code === discountCodeInputEl.value.trim().toUpperCase();
    })
    
    // When this code is calling to renderOrder(), the feedback message for valid codes 
    // disappears bc renderOrder() clears feedback messages
    // use timeouts for this message?  - clears with resetDiscountFeedback() after 5 sec? 

    if(filteredDiscountCodeArr.length>0 && orderSum >= filteredDiscountCodeArr[0].minimumOrderSum){
        console.log("code exists and criteria is met");
        addedDiscountCode = filteredDiscountCodeArr[0];

        // just renderOrder() to show feedback instead of setting text content in all three if-statements.
        // add "order xx more to qualify for this discount code" - or make this on the line for the discount
        // set a global let for feedbackmsg? 
        discountFeedbackMsg.textContent = `"${discountCodeInputEl.value}" has been added to your order`

        renderOrder();
    }
    else if(filteredDiscountCodeArr.length>0 && orderSum < filteredDiscountCodeArr[0].minimumOrderSum){
        console.log("code exists, but criteria is not met");
        addedDiscountCode = filteredDiscountCodeArr[0];
        discountFeedbackMsg.textContent = `"${discountCodeInputEl.value}" has been added to your order`

        renderOrder();
        // add code, but do not apply the discount until criteria is met
        // add  functionality in renderOrder for when criteria is met - or how much missing before the criteria is met
    }
    else{ 
        console.log("code does not exist");
        discountCodeInputEl.classList.add("input-error")
        discountFeedbackMsg.classList.add("error-msg")
        discountFeedbackMsg.textContent = `Sorry, "${discountCodeInputEl.value}" is not a valid discount code`
    }
}

// function setDiscountFeedback(){}

function resetDiscountFeedback(){
    discountFeedbackMsg.textContent = ""
    discountFeedbackMsg.classList.remove("error-msg")
    discountCodeInputEl.classList.remove("input-error")
    discountCodeInputEl.value="";
}

function addToCart(item){
    item.orderAmount += 1;

    if(!order.includes(item)){
        order.push(item)
    }

    renderOrder();
}

function removeItem(itemId){
    const orderItem = order.filter(item => item.id.toString() === itemId)[0];

    orderItem.orderAmount -= 1; 

    if(orderItem.orderAmount <= 0){
        const filteredOrder = order.filter(item => item !== orderItem)
        order = filteredOrder;
    }

    renderOrder()
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

function renderMenu(){
    // menuEl - benyttes denne globalt? 
    menuEl.innerHTML = getMenuHtml();
}

function getOrderHtml(){
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

    return orderHtml;
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

function calculateOrderSum(){
    orderSum = order.reduce(function(total, currentItem){
        const currentItemTotalSum = currentItem.price * currentItem.orderAmount;
        return total + currentItemTotalSum;
    }, 0)

    // addedDiscountCode && calculateDiscount(); <- I know you can type the following like this, but I prefer the readability of the code below
    if (addedDiscountCode){
        calculateDiscount();
    }

    // const finalOrderSum = orderSum - discountSum;

    // return finalOrderSum;
    
}

function renderOrder(){

    // edit sum - and name the discount sum as well
    // remember to alter display-none class on the different elements
    // should the discount code field be visible when no items have been added? 

    resetDiscountFeedback();

    orderEl.innerHTML = getOrderHtml();
    calculateOrderSum();

    if (addedDiscountCode){
        document.getElementById("discount-sum-line").classList.remove("display-none");
        document.getElementById("discount-description").textContent = addedDiscountCode.description;
        document.getElementById("discount-sum").textContent = `- $${discountSum.toFixed(2)}`;
    }


    // toFixed does not work here! render sum with 2 decimal points
    document.getElementById("order-sum").innerHTML = `$${orderSum.toFixed(2)-discountSum.toFixed(2)}`
    
    const totalSumEl = document.getElementById("total-sum");
    const orderBtn = document.getElementById("order-btn");
    

    //Add a div for display-none that includes everything except the title maybe? (over the title can be a div saying no items added or something? )
    if(order.length>0){
        totalSumEl.classList.remove("display-none");
        orderEl.classList.remove("display-none")

        orderBtn.disabled = false;
    } 
    else{
        totalSumEl.classList.add("display-none");
        orderEl.classList.add("display-none")

        orderBtn.disabled = true;
    }
}

renderMenu();


// just render, instead of two renders? 