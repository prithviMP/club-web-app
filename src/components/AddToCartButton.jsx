const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    console.log('Add to cart clicked:', { product, selectedSize });
    
    if (!selectedSize && product.sizes?.length > 0) {
      console.log('Size validation failed - size required');
      toast.error('Please select a size');
      return;
    }
    
    // Get first product image if available
    const productImage = product.product_image && product.product_image.length > 0 
      ? product.product_image[0] 
      : null;
    
    console.log('Adding to cart:', { 
      productId: product.id,
      productName: product.name,
      size: selectedSize,
      price: product.price,
      image: productImage
    });
    
    const cartItem = {
      ...product,
      size: selectedSize,
      image: productImage
    };
    
    addToCart(cartItem, selectedSize);
    console.log('Product added to cart successfully');
    toast.success('Added to cart');
  };