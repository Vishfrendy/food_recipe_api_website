import React, { useEffect, useState } from 'react';

const RecipeWebsite = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 30;

  useEffect(() => {
    // Fetch categories
    fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list')
      .then(response => response.json())
      .then(data => setCategories(data.meals));
  }, []);

  useEffect(() => {
    if (selectedCategory === '') {
      // Fetch all category details
      Promise.all(
        categories.map(category =>
          fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category.strCategory}`)
            .then(response => response.json())
            .then(data => data.meals)
        )
      )
        .then(categoryDetails => {
          const allDetails = categoryDetails
            .flat()
            .map(detail => {
              const { strMealThumb, strInstructions } = detail;
              const ingredients = getIngredients(detail);
              return {
                ...detail,
                strMealThumb,
                strInstructions,
                ingredients,
              };
            });
          setCategoryDetails(allDetails);
        });
    } else {
      // Fetch category details
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`)
        .then(response => response.json())
        .then(data => {
          const categoryDetailsWithInfo = data.meals.map(detail => {
            // Fetch additional details for each meal
            return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${detail.idMeal}`)
              .then(response => response.json())
              .then(infoData => {
                // Attach the additional details to the existing category detail object
                const { strMealThumb, strInstructions } = infoData.meals[0];
                const ingredients = getIngredients(infoData.meals[0]);

                return {
                  ...detail,
                  strMealThumb,
                  strInstructions,
                  ingredients,
                };
              });
          });

          Promise.all(categoryDetailsWithInfo)
            .then(details => setCategoryDetails(details));
        });
    }
  }, [selectedCategory, categories]);

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setSelectedCategory(selectedCategory);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getIngredients = (meal) => {
    const ingredientKeys = Object.keys(meal).filter(key => key.includes('strIngredient'));
    const ingredients = ingredientKeys.map(key => meal[key]).filter(ingredient => ingredient);
    return ingredients;
  };

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = categoryDetails.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const totalPages = Math.ceil(categoryDetails.length / recipesPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const styles = {
    recipeWebsite: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      margin: 'auto',
      backgroundColor: '#F4D03F',
    },
    header: {
      backgroundColor: 'black',
      padding: '10px',
      marginBottom: '30px',
      width: '100%',
    },
    title: {
      color: 'white',
      margin: '0',
      paddingLeft: 15,
      marginBottom: 5,
    },
    
    categoryContainer: {
      display: 'flex', // Add this line to enable flexbox layout
      alignItems: 'center', // Add this line to vertically align items
      marginBottom: '20px',
    },
    categoryTitle: {
      marginBottom: '10px',
    },
    categoryDropdown: {
      flex: '1', // Add this line to make the dropdown expand and fill the remaining space
      padding: '10px',
      fontSize: '16px',
      borderRadius: '5px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      marginTop: 20,
      marginLeft: 10,
      maxWidth: '300px', // Remove this line if you want the dropdown to grow to its content
      boxSizing: 'border-box',
      '&:hover': {
        backgroundColor: '#eee',
      },
    },
    categoryDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      padding: '20px',
      flexWrap: 'wrap', // Allow items to wrap to the next row
      width: '90%',
    },
    foodDetail: {
      backgroundColor: '#fff', // Add this line to set the background color to white
      boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
      borderRadius: '5px',
      padding: '20px',
      textAlign: 'center',
      flex: '0 0 calc(33.33% - 20px)', // Adjust width to fit three items in each row with spacing
      border: '1px solid #ccc', // Add this line to set the border
    },
    foodImage: {
      width: '100%',
      height: '20%',
      objectFit: 'cover',
      borderRadius: '5px',
      border: '1px solid #ccc', // Add this line to set the border
    },
    sectionTitle: {
      marginBottom: '30px',
      padding: '10px', // Add this line to set the padding
      margin: '0', // Add this line to set the margin
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)', // Add this line to set the box shadow
      borderRadius: '5px',
    },
    ingredientList: {
      textAlign: 'left',
      padding: '0',
      margin: '0',
      display: 'flex', // Display ingredients in a row
      justifyContent: 'center', // Center ingredients horizontally
      flexWrap: 'wrap', // Allow ingredients to wrap to the next row
    },
    ingredientItem: {
      display: 'inline-block',
      padding: '5px 10px',
      margin: '5px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
      backgroundColor: '#F4D03F',
    },
    instructions: {
      marginBottom: '0',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '50px',
      marginBottom: '100px', // Added space below pagination
    },
    paginationButton: {
      padding: '5px 10px',
      margin: '0 5px',
      border: 'none',
      backgroundColor: '#fff',
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#eee',
      },
    },
    activeButton: {
      backgroundColor: '#ccc',
    },
    arrowButton: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: '#fff',
      color: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#eee',
      },
    },
    previousArrow: {
      marginRight: '10px',
    },
    nextArrow: {
      marginLeft: '10px',
    },
  };

  return (
    <div style={styles.recipeWebsite}>
      <header style={styles.header}>
        <h1 style={styles.title}>Recipe Website</h1>
      </header>
      <div style={styles.categoryContainer}>
        <h2 style={styles.categoryTitle}>Select a category:</h2>
        <select
          style={styles.categoryDropdown}
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category.strCategory}>
              {category.strCategory}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.categoryDetails}>
        {currentRecipes.map((recipe, index) => (
          <div key={index} style={styles.foodDetail}>
            <img src={recipe.strMealThumb} alt={recipe.strMeal} style={styles.foodImage} />
            <h3 style={styles.sectionTitle}>{recipe.strMeal}</h3>
            {selectedCategory !== "" ? (
              <React.Fragment>
                <h4>Ingredients:</h4>
                <ul style={styles.ingredientList}>
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} style={styles.ingredientItem}>
                      {ingredient}
                    </li>
                  ))}
                </ul>
                <h4>Instructions:</h4>
                <p style={styles.instructions}>{recipe.strInstructions}</p>
              </React.Fragment>
            ) : null}
          </div>
        ))}
      </div>
      <div style={styles.pagination}>
        <button
          style={{ ...styles.arrowButton, ...styles.previousArrow }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            style={{
              ...styles.paginationButton,
              ...(number === currentPage && styles.activeButton),
            }}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}
        <button
          style={{ ...styles.arrowButton, ...styles.nextArrow }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default RecipeWebsite;
