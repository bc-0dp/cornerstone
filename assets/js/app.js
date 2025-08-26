__webpack_public_path__ = window.__webpack_public_path__; // eslint-disable-line


import Global from "./theme/global";
// import React from "react";
// import { createRoot } from "react-dom/client";
// import { ThemeProvider, createTheme } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";
// import CouponDrawer from "./components/CouponDrawer";

// Create a theme instance for MUI
// const theme = createTheme({
//     palette: {
//         primary: {
//             main: "#555555", // Customize to match your brand
//         },
//         secondary: {
//             main: "#f44336", // Customize to match your brand
//         },
//     },
// });

const getAccount = () => import('./theme/account');
const getLogin = () => import('./theme/auth');
const noop = null;

const pageClasses = {
    account_orderstatus: getAccount,
    account_order: getAccount,
    account_addressbook: getAccount,
    shippingaddressform: getAccount,
    account_new_return: getAccount,
    'add-wishlist': () => import('./theme/wishlist'),
    account_recentitems: getAccount,
    account_downloaditem: getAccount,
    editaccount: getAccount,
    account_inbox: getAccount,
    account_saved_return: getAccount,
    account_returns: getAccount,
    account_paymentmethods: getAccount,
    account_addpaymentmethod: getAccount,
    account_editpaymentmethod: getAccount,
    login: getLogin,
    createaccount_thanks: getLogin,
    createaccount: getLogin,
    getnewpassword: getLogin,
    forgotpassword: getLogin,
    blog: noop,
    blog_post: noop,
    brand: () => import('./theme/brand'),
    brands: noop,
    cart: () => import('./theme/cart'),
    category: () => import('./theme/category'),
    compare: () => import('./theme/compare'),
    page_contact_form: () => import('./theme/contact-us'),
    error: noop,
    404: noop,
    giftcertificates: () => import('./theme/gift-certificate'),
    giftcertificates_balance: () => import('./theme/gift-certificate'),
    giftcertificates_redeem: () => import('./theme/gift-certificate'),
    default: noop,
    page: noop,
    product: () => import('./theme/product'),
    amp_product_options: () => import('./theme/product'),
    search: () => import('./theme/search'),
    rss: noop,
    sitemap: noop,
    newsletter_subscribe: noop,
    wishlist: () => import('./theme/wishlist'),
    wishlists: () => import('./theme/wishlist'),
};

const customClasses = {
    'pages/custom/product/site-transfer': () => import('./theme/site-transfer'),
};


/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param pageType String
 * @param contextJSON
 * @returns {*}
 */
window.stencilBootstrap = function stencilBootstrap(pageType, contextJSON = null, loadGlobal = true) {
    const context = JSON.parse(contextJSON || '{}');

    console.log('Bootstrap called with pageType:', pageType);
    console.log('Template context:', context.template);

    return {
        load() {
            $(() => {
                // Load globals
                if (loadGlobal) {
                    Global.load(context);
                }

                const importPromises = [];

                // Find the appropriate page loader based on pageType
                const pageClassImporter = pageClasses[pageType];
                if (typeof pageClassImporter === 'function') {
                    console.log('Loading page class for:', pageType);
                    importPromises.push(pageClassImporter());
                }

                // See if there is a page class default for a custom template
                const customTemplateImporter = customClasses[context.template];
                if (typeof customTemplateImporter === 'function') {
                    console.log('Loading custom template class for:', context.template);
                    importPromises.push(customTemplateImporter());
                } else {
                    console.log('No custom template class found for:', context.template);
                }

                // Wait for imports to resolve, then call load() on them
                Promise.all(importPromises).then(imports => {
                    imports.forEach(imported => {
                        console.log('Calling load on imported class');
                        imported.default.load(context);
                    });
                });
            });
        },
    };
};

// const couponContainer = document.querySelector("#coupondrawer");

// if (couponContainer) {
//     const root = createRoot(couponContainer);
//     root.render(
//         <ThemeProvider theme={theme}>
//             <CssBaseline />
//             <CouponDrawer />
//         </ThemeProvider>
//     );
// }


// eslint-disable-next-line no-new
