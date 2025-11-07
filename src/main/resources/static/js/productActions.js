// Imports
import {handleFetchErrors} from '/js/utils/fetchUtils.js';

/* --- DELETE PRODUCT --- */
// Wait until the entire DOM (HTML structure) has loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
  // Select all elements with the class "delete-btn" (trash can buttons)
  // and loop through them to attach an event listener
  document.querySelectorAll('.delete-btn').forEach((button) => {
    // Add a click event listener to each delete button
    button.addEventListener('click', async (e) => {
      // Prevent the default form submission behavior (meaning that the page will now not reload on submission)
      e.preventDefault();

      // Find the nearest table row (<tr>) element to the clicked delete button, the closest table row will be
      // the table row of which the desired product to delete will be in.
      const row = e.target.closest('tr');

      // Retrieve the product ID stored as a data attribute on the row
      const productId = row.getAttribute('data-id');

      // Safety Check: If no ID is found, log an error and stop execution
      if (!productId) {
        console.error('Missing product ID');
        return;
      }

      // Confirmation: Ask user to confirm deletion
      const confirmed = window.confirm('Er du sikker på at du vil slette dette produkt? Dette kan ikke fortrydes');
      if (!confirmed) {
        return; // User canceled deletion
      }

      try {
        // Send a DELETE request to the backend API "ProductController.java" to remove the product
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });

        // Validate and throw specific error if necessary
        await handleFetchErrors(response);

        // Success: Remove product row
        row.remove();
      } catch (error) {
        // Catch any network or fetch-related errors and log them for debugging
        console.error('Error deleting product:', error);
      }
    });
  });
});

/* --- EDIT PRODUCT (TOGGLE EDIT MODE) --- */
// Wait until the entire DOM (HTML structure) has loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
  // Select all elements with the class "edit-btn" (pencil buttons)
  // and loop through them to attach an event listener
  document.querySelectorAll('.edit-btn').forEach((button) => {
    // Add a click event listener to each edit button
    button.addEventListener('click', async (e) => {
      // Prevent page reload
      e.preventDefault();

      // Find the closest <tr> to the clicked button
      const row = e.target.closest('tr');

      // Get the product ID stored as a data attribute on the row
      const productId = row.getAttribute('data-id');

      // Safety Check: If no ID is found, log an error and stop execution
      if (!productId) {
        console.error('Missing product ID');
        return;
      }

      // Toggle edit mode: adds/removes the "editing" CSS class
      const isEditing = row.classList.toggle(`editing`); // Toggles CSS class

      // Select only the cells within that row that has a data-field (desired editable fields)
      const cells = row.querySelectorAll('td[data-field]');

      // Select the icon element inside the button for changing its text where specific text = specific symbol
      const editIcon = button.querySelector(`.edit-btn-icon`);

      // Check if the user is entering or exiting edit mode.
      if (isEditing) {
        /* --- ENTER EDIT MODE --- */
        // Visually indicate the row is editable
        row.classList.add(`table-warning`);

        // Change icon to indicate "save" to show the user can save changes
        editIcon.textContent = `save`;

        // Change button style to indicate active editing
        button.classList.replace(`btn-dark`, `btn-outline-dark`);

        // Enable editing for each editable cell
        cells.forEach((cell) => {
          // Make the cell content editable
          cell.setAttribute('contenteditable', 'true');

          // If editing the price cell, remove the trailing currency ("Kr."/"Kr") so the user edits a clean number
          const fieldName = cell.getAttribute('data-field');
          if (fieldName === 'price') {
            cell.textContent = cell.textContent.trim().replace(/\s*Kr\.?$/i, '');
          }

          // Store the original value in a data attribute for comparison later (after any cleaning)
          cell.dataset.originalValue = cell.textContent;

          // Listen for when the user finishes editing a cell (also called a "blur event")
          cell.addEventListener('blur', async (ev) => {
            // Get the field name from the cell's data-field attribute
            const field = ev.target.getAttribute('data-field');

            // Check if there is no data field on this cell, thus skipping the update
            if (!field) {
              console.warn('No data-field on this cell, skipping update.');
              return;
            }

            // New value entered by the user
            const newValue = ev.target.textContent;

            // Old value before the change
            const oldValue = ev.target.dataset.originalValue;

            // Only send an update /PUT request if the value is actually changed
            if (newValue !== oldValue) {
              // Send the update to the backend via PUT request and capture the updated product returned by the server
              const updatedProduct = await updateProduct(productId, { [field]: newValue });

              // If we got a product back, stash it on the row so we can refresh the UI later when edit mode ends
              if (updatedProduct) {
                row.dataset.updatedProduct = JSON.stringify(updatedProduct);
              }

              // Update the originalValue to prevent duplicate updates
              ev.target.dataset.originalValue = newValue; // Update reference value
            }
          });
        });
      } else {
        /* --- EXIT EDIT MODE --- */
        // Remove visual highlight
        row.classList.remove('table-warning');

        // Change icon back to "edit"
        editIcon.textContent = 'edit_square';

        // Reset button style to normal
        button.classList.replace('btn-outline-dark', 'btn-dark');

        // Disable editing for all cells and remove original value data
        cells.forEach((cell) => {
          cell.removeAttribute('contenteditable'); // Removes editing ability
          delete cell.dataset.originalValue; // Removing original value data
        });

        // Refresh the row content from server (or last PUT response) so the UI shows authoritative values
        try {
          await refreshRowFromServer(row, productId);
        } catch (err) {
          console.error('Failed to refresh product row:', err);
        }

        // Clean up any temporary data
        delete row.dataset.updatedProduct;
      }
    });
  });
});

/* --- CONTROLLER CALL: PUT PRODUCT UPDATE --- */
// Sends a PUT request to update a product field in the backend "Product Controller"
/** @param {string} productId ID of the product to update
 * @param {Object} updatedData Object containing field(s) and value(s) to update
 */
async function updateProduct(productId, updatedData) {
  try {
    // Send PUT request to the backend API
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    // Extra NOTES:
    // "method" HTTP Method: (Get, Post, Put, Delete)
    // "headers:" = How to interpret the data being sent
    //  - Content-Type = Tells Server what type of data is in the request body
    //  - application/json = The body is JSON, please parse it as JSON
    // "body:" = Converts JS object to JSON

    // Handle any fetch errors (network issues, server errors)
    await handleFetchErrors(response);

    // Return the updated product from the server so the UI can refresh accurately
    return await response.json();
  } catch (error) {
    // Log error
    console.error('Error updating product:', error);
    return null;
  }
}

/* --- Helper: Format price consistently with UI --- */
function formatPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value) + ' Kr.';
  try {
    // Danish-style formatting (e.g., 1.234,50) could be 'da-DK', but the template uses explicit decimal places.
    // We'll ensure 2 decimals and append the currency suffix used in the table.
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Kr.';
  } catch (_) {
    return num.toFixed(2) + ' Kr.';
  }
}

/* --- Helper: GET product by ID --- */
async function fetchProduct(productId) {
  const response = await fetch(`/api/products/${productId}`, { method: 'GET' });
  await handleFetchErrors(response);
  return await response.json();
}

/* --- Helper: Refresh row from server (or fallback to last PUT response) --- */
async function refreshRowFromServer(row, productId) {
  let product = null;
  try {
    product = await fetchProduct(productId);
  } catch (err) {
    // Fallback to the last PUT response stored on the row
    if (row.dataset.updatedProduct) {
      try { product = JSON.parse(row.dataset.updatedProduct); } catch (_) { /* ignore */ }
    }
  }

  if (!product) return; // nothing to refresh

  // Update each cell with authoritative values
  const fields = ['productNumber', 'name', 'EAN', 'type', 'price'];
  fields.forEach((field) => {
    const cell = row.querySelector(`td[data-field="${field}"]`);
    if (!cell) return;
    if (field === 'price') {
      cell.textContent = formatPrice(product.price);
    } else {
      cell.textContent = product[field] != null ? String(product[field]) : '';
    }
  });
}
