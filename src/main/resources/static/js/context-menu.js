document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('table-body');
  const contextMenuEl = document.getElementById('jobContextMenu');
  let contextTargetJob = null;

  const statusToIdMap = {
    notDelivered: 1,
    delivered: 2,
    inProgress: 3,
    missingPart: 4,
    finished: 5,
    pickedUp: 6,
  };

  const idToStatusMap = {
    1: 'notDelivered',
    2: 'delivered',
    3: 'inProgress',
    4: 'missingPart',
    5: 'finished',
    6: 'pickedUp',
  };

  function hideContextMenu() {
    contextMenuEl.style.display = 'none';
    contextTargetJob = null;
  }

  async function getJob(jobId) {
    const response = await fetch(`/api/jobs/${jobId}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Job not found');
        return null;
      }
      throw new Error('Request failed: ' + response.status);
    }
    return await response.json();
  }

  async function showContextMenu(x, y, jobRow) {
    contextTargetJob = jobRow;
    const jobId = contextTargetJob.getAttribute('data-href')?.split('/').pop();
    const job = await getJob(jobId);

    const title = jobRow.querySelector('td:nth-child(2) p.fw-bolder')?.textContent || 'Job';

    contextMenuEl.querySelector('[data-action="open"]').textContent = `Åbn "${title}"`;
    contextMenuEl.querySelector('[data-action="openNewTab"]').textContent = `Åbn "${title}" i ny fane`;

    // Hide current status from submenu
    const currentStatus = idToStatusMap[job.status.id];
    const submenuItems = contextMenuEl.querySelectorAll('#jobStatusSubmenu a[data-action="setStatus"]');
    submenuItems.forEach((a) => {
      a.style.display = a.getAttribute('data-status') === currentStatus ? 'none' : '';
    });

    const root = contextMenuEl.querySelector('#jobStatusSubmenuRoot');
    const submenu = contextMenuEl.querySelector('#jobStatusSubmenu');
    if (root && submenu && !root.dataset.bound) {
      root.dataset.bound = '1';
      let submenuHideTimer = null;

      const openSubmenu = () => {
        submenu.style.display = 'block';
        const rootRect = root.getBoundingClientRect();
        const submenuRect = submenu.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let top = 0;
        let left = rootRect.width;

        // Position submenu to the left if it would overflow right edge
        if (rootRect.right + submenuRect.width > vw) {
          left = -submenuRect.width;
        }
        // Adjust vertical position if it would overflow bottom
        if (rootRect.top + submenuRect.height > vh) {
          top = Math.max(0, vh - (rootRect.top + submenuRect.height) - 4);
        }
        submenu.style.top = `${top}px`;
        submenu.style.left = `${left}px`;
      };

      const scheduleHide = () => {
        clearTimeout(submenuHideTimer);
        submenuHideTimer = setTimeout(() => {
          submenu.style.display = 'none';
        }, 200);
      };

      const cancelHide = () => clearTimeout(submenuHideTimer);

      // Hover events for cascading behavior
      root.addEventListener('mouseenter', () => {
        cancelHide();
        openSubmenu();
      });
      root.addEventListener('mouseleave', scheduleHide);
      submenu.addEventListener('mouseenter', cancelHide);
      submenu.addEventListener('mouseleave', scheduleHide);
    }

    // Position menu within viewport
    const vw = window.innerWidth,
      vh = window.innerHeight;
    let left = x,
      top = y;
    const menuRect = { width: 240, height: 260 }; // approximate
    if (left + menuRect.width > vw) left = vw - menuRect.width - 10;
    if (top + menuRect.height > vh) top = vh - menuRect.height - 10;

    contextMenuEl.style.left = left + 'px';
    contextMenuEl.style.top = top + 'px';
    contextMenuEl.style.display = 'block';
  }

  // Attach right-click listener to table rows
  tableBody.querySelectorAll('tr').forEach((row) => {
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, row);
    });
  });

  // Global handlers to hide context menu
  document.addEventListener('click', (e) => {
    if (contextMenuEl.style.display === 'block' && !contextMenuEl.contains(e.target)) hideContextMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideContextMenu();
  });
  window.addEventListener('scroll', hideContextMenu, true);
  window.addEventListener('resize', hideContextMenu);

  // Action handlers
  contextMenuEl.addEventListener('click', async (e) => {
    e.stopPropagation();
    const actionEl = e.target.closest('.dropdown-item');
    if (!actionEl || !contextTargetJob) return;
    const action = actionEl.getAttribute('data-action');
    const jobId = contextTargetJob.getAttribute('data-href')?.split('/').pop();

    hideContextMenu();
    if (!jobId) return;
    const job = await getJob(jobId);

    let payload = {
      title: job.title,
      customer_name: job.customer_name,
      customer_phone: job.customer_phone,
      job_description: job.job_description,
      work_time_minutes: job.work_time_minutes,
      price_per_minute: job.price_per_minute,
      date: job.date,
      status: { id: job.status },
    };

    if (action === 'open') {
      window.location.href = '/jobliste/' + job.id;
      return;
    }

    if (action === 'openNewTab') {
      window.open('/jobliste/' + job.id, '_blank', 'noopener');
      return;
    }

    if (action === 'setStatus') {
      const newStatus = actionEl.getAttribute('data-status');
      payload.status.id = statusToIdMap[newStatus];
      console.log(payload);
      try {
        const res = await fetch('/api/jobs/' + job.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Server returned ' + res.status);
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Status kunne ikke opdateres.');
      }
    }
  });
});
