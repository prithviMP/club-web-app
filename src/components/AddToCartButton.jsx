const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(product);
      // Optional: Show success feedback
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Optional: Show error feedback
    } finally {
      setTimeout(() => setIsAdding(false), 500); // Debounce
    }
  };