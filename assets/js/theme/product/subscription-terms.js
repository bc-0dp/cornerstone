/*
 Builds the DMCCA subscription terms for an offer. Pure and DOM-free so it can be reused
 outside the theme (e.g. a checkout service).
 */
export const REMINDER_DAYS = 28;
export const CANCEL_NOTICE_DAYS = 10;
export const COOLING_OFF_TEXT = 'You have a 14-day initial cooling-off right and may also have a 14-day renewal cooling-off right.';

export function addMonths(date, months) {
    const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();

    result.setDate(Math.min(date.getDate(), lastDay));

    return result;
}

/**
 * @param {Object} offer  { price (paid today), initialMonths, renewalPrice, renewalMonths }
 * @param {Object} opts   { formatMoney(number), formatDate(Date), today }
 */
export function buildTerms(offer, { formatMoney, formatDate, today = new Date() }) {
    const renewalPrice = offer.renewalPrice !== undefined ? offer.renewalPrice : offer.price;
    const renewalMonths = offer.renewalMonths;
    const initialMonths = offer.initialMonths || renewalMonths;
    const isIntro = offer.price !== renewalPrice || initialMonths !== renewalMonths;

    const headline = isIntro
        ? `Try ${initialMonths} months for ${formatMoney(offer.price)}, then pay ${formatMoney(renewalPrice)} every ${renewalMonths} months`
        : `Pay ${formatMoney(renewalPrice)} every ${renewalMonths} months`;

    return {
        headline,
        isIntro,
        payToday: formatMoney(offer.price),
        equivalent: `Equivalent to ${formatMoney(offer.price / initialMonths)} per month`,
        items: [
            {
                icon: 'renew',
                title: 'Automatically continues',
                text: `Your subscription will automatically renew unless you cancel. Your next payment of ${formatMoney(renewalPrice)} will be due on ${formatDate(addMonths(today, initialMonths))}.`,
            },
            {
                icon: 'payment',
                title: `Minimum payment: ${formatMoney(offer.price)}`,
                text: `No minimum term after the first ${initialMonths} months.`,
            },
            {
                icon: 'cancel',
                title: 'How to cancel',
                text: `You can cancel your subscription online through My Account > Manage Subscription at least ${CANCEL_NOTICE_DAYS} days before your next renewal payment is due.`,
                strong: ['My Account > Manage Subscription', `${CANCEL_NOTICE_DAYS} days`],
            },
            {
                icon: 'reminder',
                title: 'We\u2019ll send you a reminder before renewal',
                text: `We\u2019ll email you at least ${REMINDER_DAYS} days before each renewal payment is due.`,
                strong: [`${REMINDER_DAYS} days`],
            },
            {
                icon: 'shield',
                title: 'Your cooling-off rights',
                text: COOLING_OFF_TEXT,
            },
        ],
    };
}
