document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('table-body');
    const contextMenuEl = document.getElementById('jobContextMenu');
    let contextTargetJob = null;

    function hideContextMenu() {
    contextMenuEl.style.display = 'none';
    contextTargetJob = null;
}

    function showContextMenu(x, y, jobRow) {
    contextTargetJob = jobRow;

    const title = jobRow.querySelector('td:nth-child(2) p.fw-bolder')?.textContent || 'Job';

    contextMenuEl.querySelector('[data-action="open"]').textContent = `Åbn "${title}"`;
    contextMenuEl.querySelector('[data-action="openNewTab"]').textContent = `Åbn "${title}" i ny fane`;
    contextMenuEl.querySelector('[data-action="edit"]').textContent = `Rediger "${title}"`;

    // Hide current status from submenu
    const currentStatus = jobRow.querySelector('.job-status')?.textContent.trim();
    const submenuItems = contextMenuEl.querySelectorAll('#jobStatusSubmenu a[data-action="setStatus"]');
    submenuItems.forEach(a => {
    a.style.display = (a.getAttribute('data-status') === currentStatus) ? 'none' : '';
});

    // Position menu within viewport
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = x, top = y;
    const menuRect = { width: 240, height: 260 }; // approximate
    if (left + menuRect.width > vw) left = vw - menuRect.width - 10;
    if (top + menuRect.height > vh) top = vh - menuRect.height - 10;

    contextMenuEl.style.left = left + 'px';
    contextMenuEl.style.top = top + 'px';
    contextMenuEl.style.display = 'block';
}

    // Attach right-click listener to table rows
    tableBody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('contextmenu', e => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, row);
});
});

    // Global handlers to hide context menu
    document.addEventListener('click', e => {
    if (contextMenuEl.style.display === 'block' && !contextMenuEl.contains(e.target)) hideContextMenu();
});
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hideContextMenu(); });
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

    if (action === 'open') {
    window.location.href = '/jobliste/' + jobId;
    return;
}

    if (action === 'openNewTab') {
    window.open('/jobliste/' + jobId, '_blank', 'noopener');
    return;
}

    if (action === 'edit') {
    if (window.openFullEditJobModal) {
    // Collect job data from row
    const jobData = {
    id: jobId,
    title: contextTargetJob.querySelector('td:nth-child(2) p.fw-bolder')?.textContent || '',
    customer_name: contextTargetJob.querySelector('td:nth-child(2) p:nth-child(2)')?.textContent || '',
    customer_phone: contextTargetJob.querySelector('td:nth-child(2) p:nth-child(3)')?.textContent || '',
    job_description: contextTargetJob.querySelector('td:nth-child(4) p')?.textContent || '',
    date: contextTargetJob.querySelector('td:nth-child(5)')?.textContent || '',
};
    window.openFullEditJobModal(jobData);
} else {
    alert('Edit modal er ikke tilgængelig.');
}
    return;
}

    if (action === 'setStatus') {
    const newStatus = actionEl.getAttribute('data-status');
    try {
    const res = await fetch('/api/jobs/' + jobId, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: { name: newStatus } }),
});
    if (!res.ok) throw new Error('Server returned ' + res.status);
    contextTargetJob.querySelector('.job-status').textContent = newStatus;
} catch (err) {
    console.error(err);
    alert('Status kunne ikke opdateres.');
}
    return;
}

    if (action === 'delete') {
    if (!confirm('Delete this job?')) return;
    try {
    const res = await fetch('/api/jobs/' + jobId, { method: 'DELETE' });
    if (!res.ok) throw new Error('Server returned ' + res.status);
    contextTargetJob.remove();
} catch (err) {
    console.error(err);
    alert('Jobbet kunne ikke slettes.');
}
}
});
});