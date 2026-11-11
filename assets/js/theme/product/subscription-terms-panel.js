const SVG_NS = 'http://www.w3.org/2000/svg';

const ICON_PATHS = {
    renew: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z',
    payment: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
    cancel: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    reminder: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
    shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
};

function el(tag, className, text) {
    const node = document.createElement(tag);

    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;

    return node;
}

function icon(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    const path = document.createElementNS(SVG_NS, 'path');

    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    path.setAttribute('d', ICON_PATHS[name]);
    svg.appendChild(path);

    return svg;
}

// Appends text, wrapping any of the `strong` fragments in <strong>.
function appendEmphasised(parent, text, strong = []) {
    const pattern = strong.length
        ? new RegExp(`(${strong.map(s => s.replace(/[.*+?^${}()|[\]\\>]/g, '\\$&')).join('|')})`)
        : null;

    (pattern ? text.split(pattern) : [text]).forEach(part => {
        if (strong.includes(part)) {
            parent.appendChild(el('strong', '', part));
        } else if (part) {
            parent.appendChild(document.createTextNode(part));
        }
    });
}

export function createTermsPanel() {
    const panel = el('section', 'subscriptionTerms');

    panel.setAttribute('aria-live', 'polite');
    panel.hidden = true;

    return panel;
}

export function renderTermsPanel(panel, terms, { title, imageSrc, infoUrl } = {}) {
    panel.textContent = '';

    if (!terms) {
        panel.hidden = true;

        return;
    }

    const header = el('div', 'subscriptionTerms-header');

    if (imageSrc) {
        const img = el('img', 'subscriptionTerms-image');

        img.src = imageSrc;
        img.alt = '';
        header.appendChild(img);
    }

    const heading = el('div', 'subscriptionTerms-heading');

    heading.append(
        el('h3', 'subscriptionTerms-title', title || ''),
        el('p', 'subscriptionTerms-headline', terms.headline),
        el('p', 'subscriptionTerms-equivalent', terms.equivalent),
    );
    header.appendChild(heading);
    panel.appendChild(header);

    const list = el('ul', 'subscriptionTerms-list');

    terms.items.forEach(item => {
        const row = el('li', 'subscriptionTerms-item');
        const text = el('div', 'subscriptionTerms-itemText');
        const body = el('p', 'subscriptionTerms-itemBody');

        appendEmphasised(body, item.text, item.strong);
        text.append(el('p', 'subscriptionTerms-itemTitle', item.title), body);
        row.append(icon(item.icon), text);
        list.appendChild(row);
    });
    panel.appendChild(list);

    if (infoUrl) {
        const link = el('a', 'subscriptionTerms-link', 'Full subscription information \u2192');

        link.href = infoUrl;
        panel.appendChild(link);
    }
}
