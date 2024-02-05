import { menuArray, discountCodesArr } from "/data.js"
// import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const menuEl = document.getElementById("menu");
const orderEl = document.getElementById("order"); 
const modalEl = document.getElementById("payment-modal"); 
const discountCodeInputEl = document.getElementById("discount-code-input");
const discountFeedbackMsg = document.getElementById("discount-feedback-msg");

let order = [];
let addedDiscountCode; 

document.addEventListener("click", function(e){

    if(e.target.dataset.order){
        const currentItem = menuArray.filter(function(menuItem){
            console.log( typeof menuItem.id)
            return menuItem.id.toString() === e.target.dataset.order;
        })[0]
        
        addToCart(currentItem)
    }
    else if (e.target.id === "order-btn" && order.length > 0){
        // if(order.length > 0){
            modalEl.classList.remove("display-none")
        // }
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
        if(!addedDiscountCode){ }
        validateAndSetDiscountCode()

        // const discountCodeInputEl = document.getElementById("discount-code-input")
        
        // addedDiscountCode = checkAndReturnDiscount(discountCodeInputEl.value)

        // if(!addedDiscountCode){
        //     discountCodeInputEl.style.border = "1px solid red"; 
        //     discountCodeInputEl.style.backgroundColor = "#ffd8d8"
        //     document.getElementById("discount-error-msg").classList.remove("display-none")
        // }


        // add discount code to global let
        //change sum-function to include potential discount codes - default value being 0.
        // add discount to total sum - save the sum somewhere
    }

})

function validateAndSetDiscountCode(){

    resetDiscountFeedback()

    // discountFeedbackMsg.textContent = ""
    // const inputCode = discountCodeInputEl.value.trim().toUpperCase()
    
    const filteredDiscountCodeArr = discountCodesArr.filter(function(discountCode){
        return discountCode.code === discountCodeInputEl.value.trim().toUpperCase();
    })
    

    if(filteredDiscountCodeArr.length>0){
        console.log("code exists");
        addedDiscountCode = filteredDiscountCodeArr[0];
        // return filteredDiscountCodeArr[0];
        discountFeedbackMsg.textContent = `"${discountCodeInputEl.value}" has been added to your order`

        renderOrder();
    }
    else{ 
        console.log("code does not exist");
        discountCodeInputEl.classList.add("input-error")
        discountFeedbackMsg.classList.add("error-msg")

        // discountCodeInputEl.style.border = "1px solid #de4646"; 
        // discountCodeInputEl.style.backgroundColor = "#ffd8d8"
        discountFeedbackMsg.textContent = `Sorry, "${discountCodeInputEl.value}" is not a valid discount code`
        // return false;
    }
}

function resetDiscountFeedback(){
    discountFeedbackMsg.textContent = ""
    discountFeedbackMsg.classList.remove("error-msg")
    discountCodeInputEl.classList.remove("input-error")
}


// const paymentForm = document.getElementById("payment-form")



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


//combine getMenuHtml() and renderMenu() ? 
function getMenuHtml(){

    const menuHtml = menuArray.map(function(menuItem){
        const {image, name, ingredients, price, id} = menuItem;
        // menuItem.uuid = uuidv4();

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
    menuEl.innerHTML = getMenuHtml();
    // menuEl.textContent = getMenuHtml();
    // menuEl.append(getMenuHtml());
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

function renderOrder(){
    orderEl.classList.remove("display-none")
    orderEl.innerHTML = getOrderHtml()

    const orderSum = order.reduce(function(total, currentItem){
        const currentItemTotalSum = currentItem.price * currentItem.orderAmount;
        return total + currentItemTotalSum;
    }, 0)

    document.getElementById("order-sum").innerHTML = `$${orderSum}`
    
    const totalSumEl = document.getElementById("total-sum");
    const orderBtn = document.getElementById("order-btn");
    
    if(order.length>0){
        totalSumEl.classList.remove("display-none");
        orderBtn.disabled = false;
    } 
    else{
        totalSumEl.classList.add("display-none");
        orderBtn.disabled = true;
    
    }
}

renderMenu();


// just render, instead of two renders? 