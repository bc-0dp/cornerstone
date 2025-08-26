export default function serviceAccordion() {
    // Function to toggle accordion based on checkbox state
    function toggleAccordion(checkbox) {
        console.log('Toggling accordion for checkbox:', checkbox);

        // Find the accordion content by looking for the next sibling with accordion-content class
        const formField = checkbox.closest('.form-field');
        const accordionContent = formField.querySelector('.accordion-content');

        if (!accordionContent) return;

        if (checkbox.checked) {
            accordionContent.style.display = 'block';
            accordionContent.style.visibility = 'visible';
            accordionContent.style.opacity = '1';
        } else {
            accordionContent.style.display = 'none';
            accordionContent.style.visibility = 'hidden';
            accordionContent.style.opacity = '0';
        }
    }

    // Initialize accordion states on page load
    function initializeAccordions() {
        // More specific selector to target only checkboxes within form-fields that have accordion content
        const checkboxes = document.querySelectorAll('.form-field[data-product-attribute="input-checkbox"] .form-checkbox');

        checkboxes.forEach((checkbox) => {
            const formField = checkbox.closest('.form-field');
            const accordionContent =
                formField.querySelector('.accordion-content');

            if (accordionContent) {
                // Set initial state based on checkbox
                if (checkbox.checked) {
                    accordionContent.style.display = 'block';
                    accordionContent.style.visibility = 'visible';
                    accordionContent.style.opacity = '1';
                } else {
                    accordionContent.style.display = 'none';
                    accordionContent.style.visibility = 'hidden';
                    accordionContent.style.opacity = '0';
                }

                // Add event listener for changes
                checkbox.addEventListener('change', function () {
                    toggleAccordion(this);
                });
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAccordions);
    } else {
        initializeAccordions();
    }
}
