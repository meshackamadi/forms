
const products = [
  {
    id: "fc-1888",
    name: "flux capacitor",
    averagerating: 4.5
  },
  {
    id: "fc-2050",
    name: "power laces",
    averagerating: 4.7
  },
  {
    id: "fs-1987",
    name: "time circuits",
    averagerating: 3.5
  },
  {
    id: "ac-2000",
    name: "low voltage reactor",
    averagerating: 3.9
  },
  {
    id: "jj-1969",
    name: "warp equalizer",
    averagerating: 5.0
  }
];

// Populate product select options
document.addEventListener('DOMContentLoaded', function() {
    const productSelect = document.getElementById('productName');
    
    // Clear any existing options (except the first one)
    while (productSelect.options.length > 1) {
        productSelect.remove(1);
    }
    
    // Add products to the dropdown
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        productSelect.appendChild(option);
    });
    
    // Set today's date as default for installation date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('installDate').value = today;
    
    // Footer year and last modified date
    document.getElementById('year').textContent = new Date().getFullYear();
    document.getElementById('lastModified').textContent = document.lastModified;
});