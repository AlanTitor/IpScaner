const BACKEND_API_URL = 'http://localhost:8080/api/nodes';

let allNodes = [];
let currentTagFilter = 'All';
let currentPage = 1;
let pageSize = 20;
let lastFetchHash = '';
let editingNodeId = null;

function isValidIPv4(ip) {
    const regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return regex.test(ip);
}

function updateFilterOptions() {
    const tagFilter = document.getElementById('tag-filter');
    const uniqueTags = Array.from(new Set(allNodes.map(node => node.tag ? node.tag.trim() : 'Без тега'))).sort((a,b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }));

    const selected = tagFilter.value || 'All';
    tagFilter.innerHTML = '<option value="All">Все теги</option>';

    uniqueTags.forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = tag;
        tagFilter.appendChild(opt);
    });

    if ([...tagFilter.options].some(i => i.value === selected)) {
        tagFilter.value = selected;
    } else {
        tagFilter.value = 'All';
    }

    currentTagFilter = tagFilter.value;
}

function getFilteredNodes() {
    if (currentTagFilter === 'All') return allNodes;
    return allNodes.filter(node => {
        const tagName = node.tag ? node.tag.trim() : 'Без тега';
        return tagName === currentTagFilter;
    });
}

function getPagedNodes(nodes) {
    const start = (currentPage - 1) * pageSize;
    return nodes.slice(start, start + pageSize);
}

function updatePaginationControls(totalItems) {
    const pageInfo = document.getElementById('page-info');
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

function renderNodes() {
    const tbody = document.getElementById('nodes-body');

    const filtered = getFilteredNodes();
    updatePaginationControls(filtered.length);
    const pageNodes = getPagedNodes(filtered);

    const pageHash = pageNodes.map(o => `${o.ip}|${o.type}|${o.isUp}|${o.tag || ''}`).join(';');
    if (tbody.dataset.renderHash === pageHash) {
        return;
    }
    tbody.dataset.renderHash = pageHash;

    const fragment = document.createDocumentFragment();

    const groups = pageNodes.reduce((acc, node) => {
        const tagName = (node.tag || 'Без тега').trim() || 'Без тега';
        if (!acc[tagName]) acc[tagName] = [];
        acc[tagName].push(node);
        return acc;
    }, {});

    const sortedTagNames = Object.keys(groups).sort((a, b) => {
        if (a === 'Без тега') return 1;
        if (b === 'Без тега') return -1;
        return a.localeCompare(b, 'ru', { sensitivity: 'base' });
    });

    sortedTagNames.forEach(tagName => {
        const headerRow = document.createElement('tr');
        headerRow.className = 'tag-group-header';
        headerRow.innerHTML = `<td colspan="5"><strong>Тег: ${tagName} (${groups[tagName].length})</strong></td>`;
        fragment.appendChild(headerRow);

        groups[tagName].forEach(node => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${node.ip}</td>
                <td>${node.type}</td>
                <td class="${node.isUp ? 'up' : 'down'}">${node.isUp ? 'UP' : 'DOWN'}</td>
                <td>${node.tag ?? ''}</td>
                <td style="text-align: center; gap: 4px; display: flex; justify-content: center;">
                    <button class="btn-edit" data-id="${node.id}" style="padding: 4px 8px; font-size: 12px;">Ред</button>
                    <button class="btn-delete" data-id="${node.id}" style="padding: 4px 8px; font-size: 12px;">Удалить</button>
                </td>
            `;
            fragment.appendChild(tr);
        });
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}

async function loadNodes() {
    try {
        const response = await fetch(BACKEND_API_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const nodes = await response.json();
        const fetchHash = nodes
            .map(o => `${o.ip}|${o.type}|${o.isUp}|${o.tag || ''}`)
            .join(';');

        if (fetchHash === lastFetchHash) {
            return;
        }

        lastFetchHash = fetchHash;
        allNodes = nodes;
        updateFilterOptions();
        renderNodes();
    } catch (error) {
        console.error('Error loading nodes:', error);
    }
}

function openEditModal(nodeId) {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;

    document.getElementById('edit-ip-input').value = node.ip;
    document.getElementById('edit-type-select').value = node.type;
    document.getElementById('edit-tag-input').value = node.tag || '';

    editingNodeId = nodeId;
    document.getElementById('edit-modal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingNodeId = null;
}

async function saveEditNode(event) {
    event.preventDefault();

    if (!editingNodeId) return;

    const ip = document.getElementById('edit-ip-input').value.trim();
    const type = document.getElementById('edit-type-select').value;
    const tag = document.getElementById('edit-tag-input').value.trim();

    if (!ip) {
        alert('IP address не может быть пустым');
        return;
    }

    if (!isValidIPv4(ip)) {
        alert('Введите корректный IPv4 адрес (например, 192.168.1.10)');
        return;
    }

    const payload = { ip, type, tag: tag || undefined };

    try {
        const response = await fetch(`${BACKEND_API_URL}/${editingNodeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`PATCH error ${response.status}: ${errorText}`);
        }

        closeEditModal();
        currentPage = 1;
        await loadNodes();
    } catch (error) {
        console.error('Error updating node:', error);
        alert('Ошибка обновления узла: ' + error.message);
    }
}

async function deleteNode(nodeId) {
    if (!confirm('Вы уверены, что хотите удалить этот узел?')) return;

    try {
        const response = await fetch(`${BACKEND_API_URL}/${nodeId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DELETE error ${response.status}: ${errorText}`);
        }

        currentPage = 1;
        await loadNodes();
    } catch (error) {
        console.error('Error deleting node:', error);
        alert('Ошибка удаления узла: ' + error.message);
    }
}

async function addNode(event) {
    event.preventDefault();

    const ipInput = document.getElementById('ip-input');
    const typeSelect = document.getElementById('type-select');
    const tagInput = document.getElementById('tag-input');

    const ip = ipInput.value.trim();
    const type = typeSelect.value;
    const tag = tagInput.value.trim();

    if (!ip) {
        alert('IP address не может быть пустым');
        return;
    }

    if (!isValidIPv4(ip)) {
        alert('Введите корректный IPv4 адрес (например, 192.168.1.10)');
        return;
    }

    const exists = allNodes.some(node => node.ip === ip);
    if (exists) {
        alert('IP уже существует в базе. Введите новый IP.');
        return;
    }

    const payload = { ip, type, tag: tag || undefined };

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`POST error ${response.status}: ${errorText}`);
        }

        ipInput.value = '';
        tagInput.value = '';

        currentPage = 1;
        await loadNodes();
    } catch (error) {
        console.error('Error adding node:', error);
        alert('Ошибка добавления узла: ' + error.message);
    }
}

if (document.getElementById('add-node-form')) {
    document.getElementById('add-node-form').addEventListener('submit', addNode);
}

if (document.getElementById('tag-filter')) {
    document.getElementById('tag-filter').addEventListener('change', event => {
        currentTagFilter = event.target.value;
        currentPage = 1;
        renderNodes();
    });
}

if (document.getElementById('page-size')) {
    document.getElementById('page-size').addEventListener('change', event => {
        pageSize = Number(event.target.value);
        currentPage = 1;
        renderNodes();
    });
}

if (document.getElementById('prev-page')) {
    document.getElementById('prev-page').addEventListener('click', () => {
        currentPage = Math.max(1, currentPage - 1);
        renderNodes();
    });
}

if (document.getElementById('next-page')) {
    document.getElementById('next-page').addEventListener('click', () => {
        currentPage += 1;
        renderNodes();
    });
}

document.addEventListener('click', event => {
    if (event.target.classList.contains('btn-edit')) {
        const nodeId = Number(event.target.dataset.id);
        openEditModal(nodeId);
    }
    if (event.target.classList.contains('btn-delete')) {
        const nodeId = Number(event.target.dataset.id);
        deleteNode(nodeId);
    }
});

if (document.getElementById('close-edit-modal')) {
    document.getElementById('close-edit-modal').addEventListener('click', closeEditModal);
}

if (document.getElementById('edit-form')) {
    document.getElementById('edit-form').addEventListener('submit', saveEditNode);
}

loadNodes();
setInterval(loadNodes, 10000);
