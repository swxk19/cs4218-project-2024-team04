// Moves functions to test outside the component for efficient testing.

export const totalPrice = (cart) => {
  try {
    let total = 0;
    cart?.map((item) => {
      total = total + item.price;
    });
    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  } catch (error) {
    console.log(error);
  }
};
//detele item
export const removeCartItem = (pid, cart, setCart) => {
  try {
    let myCart = [...cart];
    let index = myCart.findIndex((item) => item._id === pid);
    myCart.splice(index, 1);
    setCart(myCart);
    localStorage.setItem("cart", JSON.stringify(myCart));
  } catch (error) {
    console.log(error);
  }
};
