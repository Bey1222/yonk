const handleAddToBasket = async () => {
  if (selectedSizes.length === 0) {
    displaySizeMessage();
  } else {
    const basketItem = {
      id: item._id,
      name: item.name,
      price: basketPrice,
      sizes: selectedSizes,
      addOns: selectedAddOns,
      note,
      restaurant: restaurantName,
      restaurantImageUri: restaurantImageUri,
      restaurantLocation: restaurantLocation,
      image: item.images[0], // Add the image URI
    };

    // Calculate the total price based on selected sizes and add-ons
    const totalPrice = selectedSizes.reduce((sum, size) => {
      const sizePrice = size.price * size.quantity;
      const addOnsPrice = selectedAddOns[size.name]
        ? selectedAddOns[size.name].reduce(
            (addOnSum, addOn) => addOnSum + addOn.price * size.quantity,
            0
          )
        : 0;
      return sum + sizePrice + addOnsPrice;
    }, 0);

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/cart/addToCart`,
        {
          productId: item._id,
          quantity: selectedSizes.reduce((acc, size) => acc + size.quantity, 0),
          selectedVariantId: selectedSizes
            .map((size) => size.variantId)
            .join(", "),
          selectedOptionId: selectedSizes
            .map((size) => size.optionId)
            .join(", "),
          selectedAddOns: Object.values(selectedAddOns)
            .flat()
            .map((addOn) => ({
              addOnId: addOn.id,
              quantity: addOn.quantity,
            })),
          price: totalPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Backend response:", response.data); // Log the backend response

      addToBasket(basketItem);
      displayAddedToBasketMessage();
      refRBSheet.current.open(); // Open the bottom sheet
    } catch (error) {
      console.error("Error adding to cart:", error); // Log any errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
    }
  }
};
