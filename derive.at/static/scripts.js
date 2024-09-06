// Add scroll event handler
window.addEventListener('load', () => {
    const linkTop = document.querySelector('.to_top');
    let scrollActive = false;

    const pagination = document.querySelector('.pagination');
    let paginationDocked = false;

    const handleScroll = () => {
        if (document.scrollingElement.scrollTop === 0) {
            if (scrollActive) {
                linkTop.classList.remove('active');
                scrollActive = false;
            }
        } else if (!scrollActive) {
            linkTop.classList.add('active');
            scrollActive = true;
        }

        if (pagination) {
            if (pagination.getBoundingClientRect().top === 100) {
                if (!paginationDocked) {
                    pagination.classList.add('docked');
                    paginationDocked = true;
                }
            } else if (paginationDocked) {
                pagination.classList.remove('docked');
                paginationDocked = false;
            }
        }
    };

    handleScroll();

    document.addEventListener('scroll', handleScroll);
});

// Handle extra nav, filter checkboxes, etc.
document.addEventListener('click', event => {
    if (event.button !== 0) return;

    const showExtraButton = document.querySelector('.show_extra_button');
    if (showExtraButton && showExtraButton.contains(event.target)) {
        document.querySelector('.features').classList.add('show_extra');
        return;
    }

    const extraNavToggle = document.querySelector('.extra_nav_toggle');
    if (extraNavToggle.contains(event.target)) {
        document.querySelector('.extra_nav_widget').classList.toggle('active');
        return;
    }

    const toTopLink = document.querySelector('.to_top');
    if (toTopLink.contains(event.target)) {
        document.scrollingElement.scrollBy(0, -document.scrollingElement.scrollTop);
        return;
    }

    const filterToggleButton = document.querySelector('button[data-toggle-filters]');
    if (filterToggleButton && filterToggleButton.contains(event.target)) {
        document.querySelector('.search_filters').classList.toggle('shown');
        return;
    }

    const sectionCheckboxes = document.querySelectorAll('span[data-section]');
    for (const checkbox of sectionCheckboxes) {
        if (checkbox.contains(event.target)) {
            const section = checkbox.dataset.section;

            for (const checkboxReiterated of sectionCheckboxes) {
                if (checkboxReiterated.dataset.section === section) {
                    if (checkbox.classList.contains('icon-checkbox')) {
                        checkboxReiterated.classList.remove('icon-checkbox');
                        checkboxReiterated.classList.add('icon-checkbox-checked');
                    } else {
                        checkboxReiterated.classList.remove('icon-checkbox-checked');
                        checkboxReiterated.classList.add('icon-checkbox');
                    }
                }
            }

            return;
        }
    }
});

// Handle search submit from either header or search page itself
document.addEventListener('submit', event => {
    const headerSearchform = document.querySelector('#header_searchform');
    const pageSearchform = document.querySelector('.search_searchform');
    
    if (event.target === headerSearchform || event.target === pageSearchform) {
        event.preventDefault();

        const query = event.target.querySelector('input[name="query"]').value;

        let href = `/suche/?begriff=${encodeURIComponent(query)}`;

        if (event.target === pageSearchform) {
            const sections = Array.from(event.target.querySelectorAll('span[data-section]'))
                .filter(checkbox => checkbox.classList.contains('icon-checkbox-checked'))
                .map(checkbox => checkbox.dataset.section)
                .join(',');

            href += `&filter=${sections}`;
        }

        window.location.href = href;
    }
});