/*
 Replaces the radio group of the subscription product option with grouped offer cards.
 The native radios stay in the DOM as the source of truth so product-details.js keeps
 handling price, SKU and stock updates.
 */
import { buildTerms } from './subscription-terms';
import { createTermsPanel, renderTermsPanel } from './subscription-terms-panel';

const SUBSCRIBE_GROUP = 'subscribe';
// The one-time purchase covers a 12-month subscription.
const ONE_TIME_MONTHS = 12;

function el(tag, className, text) {
    const node = document.createElement(tag);

    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;

    return node;
}

function parseOffers(raw) {
    try {
        const parsed = JSON.parse(raw);

        return parsed && parsed.offers ? parsed : null;
    } catch (e) {
        return null;
    }
}

export default class SubscriptionOffers {
    constructor(context, scope) {
        this.scope = scope;
        this.config = parseOffers(context.subscriptionOffers);
        this.variants = context.subscriptionVariants;
    }

    init() {
        if (!this.config || !this.variants) return;

        const radioGroup = this.scope.querySelector('[data-product-option-change] [data-product-attribute="set-radio"]');

        if (!radioGroup) return;

        this.radioGroup = radioGroup;
        this.formatter = new Intl.NumberFormat(document.documentElement.lang || undefined, {
            style: 'currency',
            currency: this.config.currency || 'USD',
        });
        this.offers = this.buildOffers();

        const subscribe = this.offers.filter(offer => offer.group === SUBSCRIBE_GROUP);
        const oneTime = this.offers.find(offer => offer.group !== SUBSCRIBE_GROUP);

        if (!subscribe.length && !oneTime) return;

        const root = el('div', 'subscriptionOffers');

        root.appendChild(el('p', 'subscriptionOffers-heading', 'Choose your subscription option'));

        this.cards = [];
        if (subscribe.length) this.cards.push(this.renderSubscribeCard(root, subscribe, oneTime));
        if (oneTime) this.cards.push(this.renderOneTimeCard(root, oneTime));

        radioGroup.classList.add('subscriptionOffers-source');
        radioGroup.parentNode.insertBefore(root, radioGroup);

        this.initTermsPanel();
        this.syncFromRadios();

        // Firefox restores radio state after DOMContentLoaded without firing change events.
        window.addEventListener('load', () => this.syncFromRadios());
        window.addEventListener('pageshow', () => this.syncFromRadios());
        radioGroup.addEventListener('change', () => this.syncFromRadios());
    }

    // Moves the (third-party rendered) wallet buttons under the terms card so the commitment
    // is shown directly above the express purchase buttons.
    initTermsPanel() {
        const wallet = this.scope.querySelector('[data-add-to-cart-wallet-buttons]');
        const buttons = wallet && wallet.closest('.add-to-cart-buttons');

        if (!buttons) return;

        const { termsUrl, conditionsUrl } = this.config;

        this.buyNow = el('details', 'subscriptionBuyNow');
        const toggle = el('summary', 'button button--primary subscriptionBuyNow-toggle', 'Buy Now');
        const content = el('div', 'subscriptionBuyNow-content');
        this.termsPanel = createTermsPanel();
        this.agreement = el('p', 'subscriptionBuyNow-agreement');
        this.agreement.append('By placing your order you agree to our ');
        this.agreement.appendChild(this.link('Terms & Conditions.', conditionsUrl));
        this.agreement.append(' Please see our ');
        this.agreement.appendChild(this.link('Full subscription information', termsUrl));
        this.agreement.append(' for your subscription rights and information.');

        content.append(this.termsPanel, this.agreement, wallet, el('p', 'subscriptionBuyNow-secure', 'Secure payment | Your personal details are protected'));
        this.buyNow.append(toggle, content);
        buttons.classList.add('subscriptionBuyNow-buttons');
        buttons.insertAdjacentElement('afterend', this.buyNow);

        // product-details.js hides the wallet when the product can't be purchased.
        const syncVisibility = () => {
            this.buyNow.hidden = wallet.style.display === 'none';
        };

        new MutationObserver(syncVisibility).observe(wallet, { attributes: true, attributeFilter: ['style'] });
        syncVisibility();
    }

    link(text, href) {
        if (!href) return document.createTextNode(text);

        const anchor = el('a', '', text);

        anchor.href = href;

        return anchor;
    }

    updateTermsPanel(value) {
        if (!this.termsPanel) return;

        const offer = this.offers.find(o => o.radio.value === value);
        const subscribed = !!offer && offer.group === SUBSCRIBE_GROUP;
        const image = this.scope.querySelector('[data-image-gallery-main] img');
        const title = this.scope.querySelector('.productView-title');

        renderTermsPanel(this.termsPanel, subscribed ? this.termsFor(offer) : null, {
            title: title && title.textContent,
            imageSrc: image && (image.currentSrc || image.src),
            infoUrl: this.config.termsUrl,
        });
        this.termsPanel.hidden = !subscribed;
        this.agreement.hidden = !subscribed;
    }

    buildOffers() {
        const offers = [];

        this.variants.edges.forEach(({ node: variant }) => {
            const offer = this.config.offers[variant.sku];
            const optionNode = variant.options.edges[0] && variant.options.edges[0].node;
            const valueNode = optionNode && optionNode.values.edges[0] && optionNode.values.edges[0].node;
            const radio = valueNode && this.radioGroup.querySelector(`input[type="radio"][value="${valueNode.entityId}"]`);

            if (!offer || !radio) return;

            offers.push({
                ...offer,
                sku: variant.sku,
                price: variant.prices.price.value,
                radio,
            });
        });

        return offers;
    }

    describe(offer, oneTimePrice) {
        const parts = [offer.label];
        const terms = this.termsFor(offer);

        if (terms.isIntro) {
            parts.push(terms.headline);
        } else {
            const renewal = offer.renewalPrice !== undefined ? offer.renewalPrice : offer.price;
            const months = offer.renewalMonths;
            const monthly = renewal / months;
            const oneTimeMonthly = oneTimePrice / ONE_TIME_MONTHS;

            if (oneTimePrice && oneTimeMonthly > monthly) {
                parts.push(`SAVE ${Math.round((1 - monthly / oneTimeMonthly) * 100)}%`);
            }
            parts.push(terms.headline);
        }

        return parts.join(' \u00B7 ');
    }

    termsFor(offer) {
        return buildTerms(offer, {
            formatMoney: value => this.formatter.format(value),
            formatDate: date => new Intl.DateTimeFormat(document.documentElement.lang || undefined, { dateStyle: 'long' }).format(date),
        });
    }

    renderSubscribeCard(root, offers, oneTime) {
        const oneTimePrice = oneTime && oneTime.price;
        const group = this.config.groups[SUBSCRIBE_GROUP] || {};
        const card = this.createCard(root, group.title);
        const selectId = `subscription-frequency-${Math.random().toString(36).slice(2, 8)}`;

        if (group.badge) card.title.appendChild(el('span', 'subscriptionOffers-badge', group.badge));

        const select = el('select', 'form-select subscriptionOffers-select');
        select.id = selectId;
        offers.forEach(offer => {
            const option = el('option', '', this.describe(offer, oneTimePrice));

            option.value = offer.radio.value;
            option.disabled = offer.radio.disabled;
            select.appendChild(option);
        });

        const price = el('div', 'subscriptionOffers-price');
        const updatePrice = () => {
            const offer = offers.find(o => o.radio.value === select.value);

            price.textContent = '';
            if (oneTimePrice && oneTimePrice > offer.price) {
                price.appendChild(el('s', 'subscriptionOffers-was', this.formatter.format(oneTimePrice)));
            }
            price.appendChild(el('strong', 'subscriptionOffers-now', this.formatter.format(offer.price)));
        };

        if (group.summary) card.summary.textContent = group.summary;
        card.header.appendChild(price);

        const frequency = el('div', 'subscriptionOffers-frequency');
        const label = el('label', 'subscriptionOffers-frequencyLabel', group.frequencyLabel || '');

        label.setAttribute('for', selectId);
        frequency.append(label, select);
        card.body.appendChild(frequency);
        if (group.footnote) card.body.appendChild(el('p', 'subscriptionOffers-footnote', group.footnote));

        select.addEventListener('change', () => {
            updatePrice();
            this.select(select.value);
        });
        card.input.addEventListener('change', () => this.select(select.value));

        updatePrice();

        return {
            card,
            offers,
            matches: value => offers.some(o => o.radio.value === value),
            show: value => {
                select.value = value;
                updatePrice();
            },
        };
    }

    renderOneTimeCard(root, offer) {
        const group = this.config.groups.oneTime || {};
        const card = this.createCard(root, group.title);

        if (group.summary) card.summary.textContent = group.summary;
        card.header.appendChild(el('div', 'subscriptionOffers-price', ''));
        card.header.lastChild.appendChild(el('strong', 'subscriptionOffers-now', this.formatter.format(offer.price)));
        card.input.addEventListener('change', () => this.select(offer.radio.value));

        return {
            card,
            offers: [offer],
            matches: value => offer.radio.value === value,
            show: () => {},
        };
    }

    createCard(root, titleText) {
        const card = el('div', 'subscriptionOffers-card');
        const header = el('label', 'subscriptionOffers-header');
        const input = el('input', 'subscriptionOffers-radio');
        const text = el('span', 'subscriptionOffers-text');
        const title = el('span', 'subscriptionOffers-title');
        const summary = el('span', 'subscriptionOffers-summary');
        const body = el('div', 'subscriptionOffers-body');

        input.type = 'radio';
        input.name = 'subscription-offer-group';
        title.appendChild(el('span', 'subscriptionOffers-titleText', titleText || ''));
        text.append(title, summary);
        header.append(input, text);
        card.append(header, body);
        root.appendChild(card);

        return { root: card, header, input, title, summary, body };
    }

    // Updates the native radio and notifies product-details.js (listens on the options wrapper).
    select(value) {
        const radio = this.radioGroup.querySelector(`input[type="radio"][value="${value}"]`);

        if (!radio || radio.checked) return;

        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        this.syncFromRadios();
    }

    syncFromRadios() {
        const checked = this.radioGroup.querySelector('input[type="radio"]:checked');
        const value = checked && checked.value;

        this.cards.forEach(entry => {
            const active = value !== null && entry.matches(value);

            entry.card.input.checked = active;
            entry.card.root.classList.toggle('is-selected', active);
            if (active) entry.show(value);
        });

        this.updateTermsPanel(value);
    }
}
