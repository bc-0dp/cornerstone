export default class SiteTransfer {
    constructor() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () =>
                this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    static load() {
        return new SiteTransfer();
    }

    bindEvents() {
        console.log('SiteTransfer initialized');
        const addToCartForm = document.querySelector('[data-cart-item-add]');
        const addToCartButton = document.querySelector('#form-action-addToCart');

        if (addToCartButton && addToCartForm) {
            // Use capturing phase and high priority to ensure our handler runs first
            addToCartButton.addEventListener('click', (event) => {
                console.log('Add to Cart button clicked');

                // Process all accordion checkboxes and serialize data
                const validationResult = this.processAccordionData();

                if (!validationResult.isValid) {
                    console.log('Validation failed:', validationResult.errorMessage);
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    this.showError(validationResult.errorMessage);
                    return false;
                }

                console.log('Validation passed, data serialized, submitting form');
                // Data has been serialized, now submit the form normally
                // Don't prevent default - let BigCommerce handle the submission
            }, true); // Use capturing phase

            // Also bind to the form submit event as a backup
            addToCartForm.addEventListener('submit', (event) => {
                console.log('Form submit event triggered');

                const validationResult = this.processAccordionData();

                if (!validationResult.isValid) {
                    console.log('Form validation failed:', validationResult.errorMessage);
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    this.showError(validationResult.errorMessage);
                    return false;
                }

                console.log('Form validation passed, allowing submission');
                return true;
            }, true); // Use capturing phase
        }
    }

    processAccordionData() {
        console.log('Processing accordion data...');
        const accordionTypes = ['transfer_installer', 'transfer_ownership', 'add_users'];
        let hasError = false;
        let errorMessage = '';

        accordionTypes.forEach(type => {
            // Check if checkbox is checked by looking for the corresponding input fields
            let checkbox = null;
            let isChecked = false;

            // Try different ways to find the checkbox
            if (type === 'transfer_installer') {
                // Look for the transfer_installer input field, then find its associated checkbox
                const installerInput = document.querySelector('#transfer_installer');
                if (installerInput) {
                    // Find the checkbox in the same form-field container
                    const formField = installerInput.closest('[data-product-attribute="input-checkbox"]');
                    if (formField) {
                        checkbox = formField.querySelector('input[type="checkbox"]');
                    }
                }
            } else if (type === 'transfer_ownership') {
                // Look for transfer_ownership checkbox by checking if it has transfer_ownership in its container
                const checkboxes = document.querySelectorAll('[data-product-attribute="input-checkbox"] input[type="checkbox"]');
                for (const cb of checkboxes) {
                    const container = cb.closest('[data-product-attribute="input-checkbox"]');
                    if (container && container.innerHTML.includes('transfer_ownership')) {
                        checkbox = cb;
                        break;
                    }
                }
            } else if (type === 'add_users') {
                // Look for add_users checkbox by checking if it has add_users in its container
                const checkboxes = document.querySelectorAll('[data-product-attribute="input-checkbox"] input[type="checkbox"]');
                for (const cb of checkboxes) {
                    const container = cb.closest('[data-product-attribute="input-checkbox"]');
                    if (container && container.innerHTML.includes('add_users')) {
                        checkbox = cb;
                        break;
                    }
                }
            }

            isChecked = checkbox && checkbox.checked;

            console.log(`Checking ${type}: checkbox found=${!!checkbox}, checked=${isChecked}`);

            if (isChecked) {
                console.log(`Processing ${type} data...`);
                const result = this.serializeAccordionData(type);
                console.log(`Result for ${type}:`, result);
                if (!result.isValid) {
                    hasError = true;
                    errorMessage = result.errorMessage;
                }
            }
        });

        console.log('Final validation result:', { isValid: !hasError, errorMessage });
        return {
            isValid: !hasError,
            errorMessage,
        };
    }

    serializeAccordionData(type) {
        switch (type) {
        case 'transfer_installer':
            return this.handleTransferInstaller();
        case 'transfer_ownership':
            return this.handleTransferOwnership();
        case 'add_users':
            return this.handleAddUsers();
        default:
            return { isValid: true };
        }
    }

    handleTransferInstaller() {
        const installerInput = document.querySelector('#transfer_installer');
        const installerAgainInput = document.querySelector('#transfer_installer_again');
        // Look for textarea with display_name 'transfer_installer_data'
        const dataTextarea = document.querySelector('[id*="transfer_installer_data"]') ||
                            document.querySelector('textarea[name*="transfer_installer_data"]');

        console.log('handleTransferInstaller called');
        console.log('installerInput found:', !!installerInput);
        console.log('installerAgainInput found:', !!installerAgainInput);
        console.log('dataTextarea found:', !!dataTextarea);

        if (!installerInput) {
            console.log('No installer input found, skipping validation');
            return { isValid: true }; // Skip if input doesn't exist
        }

        const installerValue = installerInput.value.trim();
        const installerAgainValue = installerAgainInput ? installerAgainInput.value.trim() : '';

        console.log('installerValue:', installerValue);
        console.log('installerAgainValue:', installerAgainValue);

        // Validation
        if (!installerValue) {
            console.log('Validation failed: empty installer value');
            return {
                isValid: false,
                errorMessage: 'Please enter a New Installer / Account ID',
            };
        }

        if (installerAgainInput && installerValue !== installerAgainValue) {
            console.log('Validation failed: values do not match');
            return {
                isValid: false,
                errorMessage: 'Installer / Account ID fields do not match',
            };
        }

        // Only serialize data if textarea exists
        if (dataTextarea) {
            const serializedData = JSON.stringify({
                account_id: installerValue,
            });

            dataTextarea.value = serializedData;
            console.log('Data serialized to textarea:', serializedData);
        } else {
            console.log('No textarea found, skipping serialization');
        }

        console.log('Validation passed');
        return { isValid: true };
    }

    handleTransferOwnership() {
        // Look for textarea with display_name 'transfer_ownership_data'
        const dataTextarea = document.querySelector('[id*="transfer_ownership_data"]') ||
                            document.querySelector('textarea[name*="transfer_ownership_data"]');

        console.log('handleTransferOwnership called');
        console.log('dataTextarea found:', !!dataTextarea);

        if (!dataTextarea) {
            console.log('No textarea found for transfer_ownership, skipping');
            return { isValid: true }; // Skip if textarea doesn't exist
        }

        // Get all the form fields
        const previousOwnerInput = document.querySelector('#transfer_ownership-previous_owner_name');
        const newSiteNameInput = document.querySelector('#transfer_ownership-new_site_name');
        const firstNameInput = document.querySelector('#transfer_ownership-new_owner_first_name');
        const lastNameInput = document.querySelector('#transfer_ownership-new_owner_last_name');
        const emailInput = document.querySelector('#transfer_ownership-new_owner_email');
        const emailAgainInput = document.querySelector('#transfer_ownership-new_owner_email_again');
        const phoneInput = document.querySelector('#transfer_ownership-new_owner_phone');

        // Get values
        const previousOwner = previousOwnerInput ? previousOwnerInput.value.trim() : '';
        const newSiteName = newSiteNameInput ? newSiteNameInput.value.trim() : '';
        const firstName = firstNameInput ? firstNameInput.value.trim() : '';
        const lastName = lastNameInput ? lastNameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const emailAgain = emailAgainInput ? emailAgainInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';

        console.log('Transfer ownership values:', {
            previousOwner, newSiteName, firstName, lastName, email, emailAgain, phone
        });

        // Validation
        if (!previousOwner) {
            console.log('Validation failed: missing previous owner name');
            return {
                isValid: false,
                errorMessage: 'Please enter the name of the previous owner',
            };
        }

        if (!firstName) {
            console.log('Validation failed: missing new owner first name');
            return {
                isValid: false,
                errorMessage: 'Please enter the new owner first name',
            };
        }

        if (!lastName) {
            console.log('Validation failed: missing new owner last name');
            return {
                isValid: false,
                errorMessage: 'Please enter the new owner last name',
            };
        }

        if (!email) {
            console.log('Validation failed: missing new owner email');
            return {
                isValid: false,
                errorMessage: 'Please enter the new owner email',
            };
        }

        if (emailAgainInput && email !== emailAgain) {
            console.log('Validation failed: emails do not match');
            return {
                isValid: false,
                errorMessage: 'New owner email addresses do not match',
            };
        }

        // Serialize data into the specified format
        const serializedData = JSON.stringify({
            previous_owner: previousOwner,
            new_site_name: newSiteName,
            firstname: firstName,
            lastname: lastName,
            email,
            phone,
        });

        dataTextarea.value = serializedData;
        console.log('Transfer ownership data serialized:', serializedData);

        return { isValid: true };
    }

    handleAddUsers() {
        // Look for textarea with display_name 'add_users_data'
        const dataTextarea = document.querySelector('[id*="add_users_data"]') ||
                            document.querySelector('textarea[name*="add_users_data"]');

        if (!dataTextarea) {
            return { isValid: true }; // Skip if textarea doesn't exist
        }

        // Collect any form data within the add_users accordion
        const accordionContent = document.querySelector('[data-product-attribute="input-checkbox"] input[value*="add_users"]')
            ?.closest('[data-product-attribute="input-checkbox"]')
            ?.querySelector('.accordion-content');

        const formData = {};
        if (accordionContent) {
            const inputs = accordionContent.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.name && input.value) {
                    formData[input.name] = input.value;
                }
            });
        }

        // Serialize data into textarea
        const serializedData = JSON.stringify({
            type: 'add_users',
            form_data: formData,
            timestamp: new Date().toISOString(),
        });

        dataTextarea.value = serializedData;

        return { isValid: true };
    }

    showError(message) {
        const alertBox = document.querySelector('.productAttributes-message');
        const alertMessage = document.querySelector('.productAttributes-message .alertBox-message');

        if (alertBox && alertMessage) {
            alertMessage.textContent = message;
            alertBox.style.display = 'block';

            // Hide after 5 seconds
            setTimeout(() => {
                alertBox.style.display = 'none';
            }, 5000);
        } else {
            // Fallback to alert if no message container found
            alert(message);
        }
    }
}
