const BrandCard = ({ brand }) => {
  const logoUrl = brand.brand_logo?.formats?.medium?.url || brand.brand_logo?.url;

  return (
    <Link to={`/brand/${brand.id}`} className="block">
      <div className="bg-secondary rounded-lg p-4 hover:bg-gray-800 transition-colors">
        <div className="aspect-square w-full flex items-center justify-center mb-4">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={brand.brand_name} 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://via.placeholder.com/200x200/6C63FF/FFFFFF?text=${encodeURIComponent(brand.brand_name)}`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{brand.brand_name.charAt(0)}</span>
            </div>
          )}
        </div>
        <h3 className="text-light text-lg font-semibold text-center truncate">{brand.brand_name}</h3>
      </div>
    </Link>
  );
};