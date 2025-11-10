(function () {
  // Locate the modal element by ID
  const modalEl = document.getElementById('createJobModal');
  if (!modalEl) return; // Exit if modal not found (prevents errors on pages without it)

  // Initialize Bootstrap modal instance
  const createModal = new bootstrap.Modal(modalEl);

  /**
   * Convert a datetime-local input value to a full ISO 8601 string.
   * Ensures seconds are included (adds ":00" if needed).
   * @param {string} val - The datetime-local input value
   * @returns {string|null} ISO-compatible datetime string or null
   */
  function toIsoLocal(val) {
    if (!val) return null;
    return val.length === 16 ? val + ':00' : val;
  }

  let createModalProducts = []; // stores selected products

  // reused search API call
  async function fetchSearchMatches(query) {
    if (!query || query.trim() === '') return null;

    let response = await fetch('/api/search/repair?q=' + query, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      return response.json();
    }
    return null;
  }

  // Search bar input handling
  document.getElementById('createSearchBar').addEventListener('input', async function (e) {
    const query = e.target.value;
    let matches = await fetchSearchMatches(query);

    const table = document.getElementById('create-search-table');
    const results = document.getElementById('create-search-results');
    results.innerHTML = '';

    if (!matches || matches.length === 0) {
      table.style.display = 'none';
      return;
    }

    table.style.display = 'table';

    matches.forEach((match) => {
      const row = document.createElement('tr');

      row.innerHTML = `
      <td>${match.name}<br><small class="text-secondary">${match.type} — ${match.ean}</small></td>
      <td>${match.price} kr</td>
    `;

      row.addEventListener('click', () => {
        const existing = createModalProducts.find((p) => p.product.id === match.id);

        if (existing) {
          existing.quantity += 1;
        } else {
          createModalProducts.push({ product: match, quantity: 1 });
        }

        renderCreateProductTable();
        document.getElementById('createSearchBar').value = '';
        table.style.display = 'none';
      });

      results.appendChild(row);
    });
  });

  // Renders selected product table
  function renderCreateProductTable() {
    const tbody = document.getElementById('create-product-table');
    tbody.innerHTML = '';

    createModalProducts.forEach((item) => {
      const row = document.createElement('tr');
      row.dataset.productId = item.product.id;

      row.innerHTML = `
      <td>${item.product.name}</td>
      <td><input type="number" class="form-control form-control-sm quantity-input" min="1" value="${item.quantity}" /></td>
      <td>${item.product.price}</td>
      <td>${item.product.price * item.quantity}</td>
      <td><button class="btn btn-sm btn-danger remove-btn">X</button></td>
    `;

      // quantity change handler
      row.querySelector('.quantity-input').addEventListener('input', (e) => {
        item.quantity = Math.max(1, parseInt(e.target.value));
        renderCreateProductTable();
      });

      // remove handler
      row.querySelector('.remove-btn').addEventListener('click', () => {
        createModalProducts = createModalProducts.filter((p) => p.product.id !== item.product.id);
        renderCreateProductTable();
      });

      tbody.appendChild(row);
    });
  }

  // Attach submit listener to the form (if it exists)
  document.getElementById('createJobForm')?.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent page reload

    // Collect and sanitize form data into a payload object
    const payload = {
      job: {
        title: document.getElementById('jobTitle').value,
        customer_name: document.getElementById('customerName').value,
        customer_phone: document.getElementById('customerPhone').value,
        job_description: document.getElementById('jobDescription').value,
        work_time_minutes: parseInt(document.getElementById('jobDuration').value) || 0,
        price_per_minute: parseFloat(document.getElementById('pricePerMin')?.value) || 0,
        date: toIsoLocal(document.getElementById('jobDateTime').value),
        status: { id: parseInt(document.getElementById('jobStatus').value) },
      },

      //include selected products
      product: createModalProducts.map((p) => ({
        productId: p.product.id,
        quantity: p.quantity,
      })),
    };
    console.log(payload.job);
    // Send POST request to create a new job entry
    createJob(payload);
  });

  async function createJob(payload) {
    try {
      const jobRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.job),
      });

      const texts = await jobRes;
      console.log('Raw response 1:', texts);

      if (!jobRes.ok) throw new Error('Job create failed');

      const job = await jobRes.json();

      payload.product = payload.product.map((p) => ({
        repairId: job.id,
        productId: p.productId,
        quantity: p.quantity,
      }));

      console.log(payload.product);

      const productRes = await fetch('/api/repairs/addProduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.product),
      });

      const text = await productRes;
      console.log('Raw response 2:', text);

      if (!productRes.ok) throw new Error('Product create failed');

      const createdProduct = await productRes.text();

      createModal.hide();

      if (window.refreshCalendarWithJob && typeof window.refreshCalendarWithJob === 'function') {
        window.refreshCalendarWithJob(createdProduct);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create job');
    }
  }
  /**
   * Expose a global helper to open the modal and reset the form.
   * Can be called from buttons or other scripts.
   */
  window.openCreateJobModal = function () {
    document.getElementById('createJobForm')?.reset();
    createModal.show();
  };
})();
