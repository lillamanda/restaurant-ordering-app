const menuArray = [
    {
        name: "Pizza",
        image: "pizza.png",
        ingredients: ["pepperoni", "mushroom", "mozzarella"],
        id: 0,
        price: 14,
        emoji: "🍕", 
        orderAmount: 0, 
    },
    {
        name: "Hamburger",
        image: "hamburger.png",
        ingredients: ["beef", "cheese", "lettuce"],
        price: 12,
        emoji: "🍔",
        id: 1, 
        orderAmount: 0, 
    },
        {
        name: "Beer",
        image: "beer.png",
        ingredients: ["grain, hops, yeast, water"],
        price: 12,
        emoji: "🍺",
        id: 2, 
        orderAmount: 0, 
    }
]

const discountCodesArr = [
    {
        code: "10OFF50", 
        discountType: "USD",
        discount: 10, 
        minimumOrderSum: 50, 
        description: "$10 off orders over $50"
    }, 
    {
        code: "10PCT", 
        discountType: "PCT",
        discount: 10, 
        minimumOrderSum: 0, 
        description: "10% off"
    }
]

const ordersArr = [
]


export { menuArray, discountCodesArr, ordersArr }