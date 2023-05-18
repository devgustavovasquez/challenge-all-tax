const jsonFile = "data.json";
let initialData = [];
const separatedData = [];

const categorySelect = document.getElementById("category");
const productSelect = document.getElementById("product");
const brandSelect = document.getElementById("brand");

async function loadJSONFile(file) {
  try {
    const response = await fetch(file);
    return await response.json();
  } catch (error) {
    console.error(`Erro ao carregar o arquivo JSON: ${error}`);
  }
}

function separateData(data) {
  data.forEach((obj) => {
    const { category, product, brand } = obj;

    let categoryObj = separatedData.find((item) => item.category === category);

    if (!categoryObj) {
      categoryObj = {
        category: category,
        products: [],
      };
      separatedData.push(categoryObj);
    }

    let productObj = categoryObj.products.find((item) => item.name === product);

    if (!productObj) {
      productObj = {
        name: product,
        brands: [],
      };
      categoryObj.products.push(productObj);
    }

    let brandObj = productObj.brands.find((item) => item.name === brand);

    if (!brandObj) {
      brandObj = {
        name: brand,
      };
      productObj.brands.push(brandObj);
    }
  });

  return separatedData;
}

loadJSONFile(jsonFile)
  .then((data) => {
    const separatedData = separateData(data);
    initialData = data;
    initializeSelects(separatedData);
    updateChart();
  })
  .catch((error) => {
    console.error(`Erro ao carregar o arquivo JSON: ${error}`);
  });

function fillSelect(selectId, options) {
  const select = document.getElementById(selectId);
  const selectedValue = select.value || options[0];

  select.innerHTML = "";

  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });

  select.value = selectedValue;
}

function updateSelects(data) {
  const selectedCategory = categorySelect.value;

  const selectedCategoryData = data.find(
    (item) => item.category === selectedCategory
  );

  if (selectedCategoryData) {
    const products = selectedCategoryData.products.map(
      (product) => product.name
    );

    fillSelect("product", products);

    const selectedProduct = productSelect.value;

    const selectedProductData = selectedCategoryData.products.find(
      (item) => item.name === selectedProduct
    );
    if (selectedProductData) {
      const brands = selectedProductData.brands.map((brand) => brand.name);
      fillSelect("brand", brands);
    }
  }

  updateChart();
}

function initializeSelects(data) {
  const categories = data.map((item) => item.category);
  fillSelect("category", categories);
  updateSelects(data);
}

categorySelect.addEventListener("change", function () {
  updateSelects(separatedData);
});

productSelect.addEventListener("change", function () {
  updateSelects(separatedData);
});

brandSelect.addEventListener("change", function () {
  updateChart();
});

let chart;

function createChart(selectedCategory, selectedProduct, selectedBrand) {
  const filteredData = initialData.filter(function (item) {
    return (
      item.category === selectedCategory &&
      item.product === selectedProduct &&
      item.brand === selectedBrand
    );
  });

  const salesByMonth = {};
  filteredData.forEach(function (item) {
    const month = item.soldAt;
    if (!salesByMonth[month]) {
      salesByMonth[month] = 0;
    }
    salesByMonth[month] += item.value;
  });

  const months = Object.keys(salesByMonth);
  const values = Object.values(salesByMonth);

  if (chart) {
    chart.destroy();
  }

  const ctx = document.getElementById("salesChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Vendas por mês",
          data: values,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function updateChart() {
  const categoryValue = categorySelect.value;
  const productValue = productSelect.value;
  const brandValue = brandSelect.value;

  createChart(categoryValue, productValue, brandValue);
}
