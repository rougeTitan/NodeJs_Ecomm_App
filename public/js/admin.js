// Client-side JavaScript function to delete a product via AJAX
const deleteProduct = btn => {
  // Extract product ID from hidden input field in the same parent node
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  // Extract CSRF token for security
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  // Find the product article element to remove from DOM later
  const productElement = btn.closest('article');

  // Send DELETE request to server
  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf // Include CSRF token in request headers
    }
  })
    .then(result => {
      return result.json(); // Parse JSON response
    })
    .then(data => {
      console.log(data); // Log server response for debugging
      // Remove the product element from the DOM on successful deletion
      productElement.parentNode.removeChild(productElement);
    })
    .catch(err => {
      console.log(err); // Log any errors that occur
    });
};
