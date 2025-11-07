// Live search for products table (client-side filtering)
// Matches across: Varenr (productNumber), Navn (name), EAN, Type

(function () {
  const DEBOUNCE_MS = 250;
  let timer = null;

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('product-search-input');
    const btn = document.getElementById('product-search-btn');
    const tbody = document.getElementById('products-table-body');
    if (!input || !tbody) return;

    const filterNow = () => {
      const q = (input.value || '').trim().toLowerCase();
      const rows = tbody.querySelectorAll('tr');
      if (!q) {
        rows.forEach((row) => row.classList.remove('d-none'));
        return;
      }

      rows.forEach((row) => {
        const pn = row.querySelector('td[data-field="productNumber"]')?.textContent?.toLowerCase() || '';
        const name = row.querySelector('td[data-field="name"]')?.textContent?.toLowerCase() || '';
        const ean = row.querySelector('td[data-field="EAN"]')?.textContent?.toLowerCase() || '';
        const type = row.querySelector('td[data-field="type"]')?.textContent?.toLowerCase() || '';
        const matches = pn.includes(q) || name.includes(q) || ean.includes(q) || type.includes(q);
        row.classList.toggle('d-none', !matches);
      });
    };

    const debouncedFilter = () => {
      clearTimeout(timer);
      timer = setTimeout(filterNow, DEBOUNCE_MS);
    };

    input.addEventListener('input', debouncedFilter);
    btn?.addEventListener('click', filterNow);
  });
})();
