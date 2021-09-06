// Add scroll event handler
window.addEventListener('load', () => { // TODO: DOMContentLoaded instead?
    const layoutScroll = document.querySelector('.layout__scroll');
    const header = document.querySelector('.header');
    const linkTop = document.querySelector('.sidebar__link__top');
    let scrollActive = false;

    const pagination = document.querySelector('.pagination');
    let paginationDocked = false;

    const handleScroll = () => {
        if (layoutScroll.scrollTop === 0) {
            if (scrollActive) {
                header.classList.remove('compact');
                linkTop.classList.remove('active');
                scrollActive = false;
            }
        } else if (!scrollActive) {
            header.classList.add('compact');
            linkTop.classList.add('active');
            scrollActive = true;
        }

        if (pagination) {
            if (pagination.getBoundingClientRect().top === 100) {
                if (!paginationDocked) {
                    pagination.classList.add('pagination--docked');
                    paginationDocked = true;
                }
            } else if (paginationDocked) {
                pagination.classList.remove('pagination--docked');
                paginationDocked = false;
            }
        }
    };

    handleScroll();

    layoutScroll.addEventListener('scroll', handleScroll);
});

// Handle sidebar buttons, filter checkboxes
document.addEventListener('click', event => {
    if (event.button !== 0) return;

    const widgetToggles = document.querySelectorAll('.sidebar__widget-toggle');
    for (const toggleLink of widgetToggles) {
        if (toggleLink.contains(event.target)) {
            for (const toggleLinkReiterated of widgetToggles) {
                if (toggleLinkReiterated === toggleLink) {
                    toggleLinkReiterated.classList.toggle('active');
                } else {
                    toggleLinkReiterated.classList.remove('active');
                }
            }

            if (toggleLink.classList.contains('sidebar__link__search')) {
                document.querySelector('input[name="query"]').focus();
            }

            return;
        }
    }

    const toTopLink = document.querySelector('.sidebar__link__top');
    if (toTopLink.contains(event.target)) {
        const layoutScroll = document.querySelector('.layout__scroll');
        layoutScroll.scrollBy(0, -layoutScroll.scrollTop);
        return;
    }

    const filterToggleButton = document.querySelector('button[data-toggle-filters]');
    if (filterToggleButton && filterToggleButton.contains(event.target)) {
        document.querySelector('.search__filters').classList.toggle('shown');
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

// Handle search submit from either sidebar or search page itself
document.addEventListener('submit', event => {
    const pageSearchform = document.querySelector('.search__searchform');
    const sidebarSearchform = document.querySelector('.sidebar__searchform');
    
    if (event.target === sidebarSearchform || event.target === pageSearchform) {
        event.preventDefault();

        const query = event.target.querySelector('input[name="query"]').value;
        
        const sections = Array.from(event.target.querySelectorAll('span[data-section]'))
            .filter(checkbox => checkbox.classList.contains('icon-checkbox-checked'))
            .map(checkbox => checkbox.dataset.section)
            .join(',');

        window.location.href = `/suche/?begriff=${encodeURIComponent(query)}&filter=${sections}`;
    }
});