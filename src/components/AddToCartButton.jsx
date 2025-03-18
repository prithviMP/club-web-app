const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize);
    toast.success('Added to cart');
  };