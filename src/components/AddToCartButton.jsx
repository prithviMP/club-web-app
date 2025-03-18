const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    console.log('Add to cart clicked:', { product, selectedSize });
    
    if (!selectedSize && product.sizes?.length > 0) {
      console.log('Size validation failed - size required');
      toast.error('Please select a size');
      return;
    }
    
    console.log('Adding to cart:', { 
      productId: product.id,
      productName: product.name,
      size: selectedSize,
      price: product.price
    });
    
    addToCart(product, selectedSize);
    console.log('Product added to cart successfully');
    toast.success('Added to cart');
  };