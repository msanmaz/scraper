function performPriceAnalysis(products) {
    const priceData = products.reduce((acc, product) => {
      const price = extractPrice(product.price);
      if (!isNaN(price)) {
        acc.total += price;
        acc.count += 1;
        acc.min = Math.min(acc.min, price);
        acc.max = Math.max(acc.max, price);
      }
      return acc;
    }, { total: 0, count: 0, min: Infinity, max: -Infinity });
  
    return {
      averagePrice: priceData.count > 0 ? priceData.total / priceData.count : 0,
      minPrice: priceData.min !== Infinity ? priceData.min : 0,
      maxPrice: priceData.max !== -Infinity ? priceData.max : 0,
      productCount: priceData.count
    };
  }
  
  function extractPrice(priceString) {
    const numericString = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(numericString);
  }
  
  function displayPriceAnalysis(analysis) {
    console.log('\nPrice Analysis:');
    console.log(`Number of products analyzed: ${analysis.productCount}`);
    console.log(`Average Price: €${analysis.averagePrice.toFixed(2)}`);
    console.log(`Min Price: €${analysis.minPrice.toFixed(2)}`);
    console.log(`Max Price: €${analysis.maxPrice.toFixed(2)}`);
  }
  
  export { performPriceAnalysis, displayPriceAnalysis };