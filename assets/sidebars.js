// Collapsible sidebars: left Contents rail and right On this page rail.
// The collapsed state is applied before first paint by SIDEBAR_INIT in
// build-site.mjs; this script wires the toggle buttons and keeps their
// labels in sync with the state. Choice is remembered per reader.
(function () {
    var doc = document.documentElement;
    var sidebarToggle = document.getElementById('sidebarToggle');
    var tocToggle = document.getElementById('tocToggle');
    var tocExpand = document.getElementById('tocExpand');
    // On narrow screens the Contents list sits above the chapter, so the
    // same button opens it on demand instead of collapsing a side rail.
    var mobileNav = window.matchMedia('(max-width: 860px)');

    function store(key, value) {
        try { localStorage.setItem(key, value ? '1' : '0'); } catch (e) { /* private mode */ }
    }

    function setChevron(button, collapsed, collapseChar, expandChar) {
        var chevron = button ? button.querySelector('[aria-hidden="true"]') : null;
        if (chevron) chevron.textContent = collapsed ? expandChar : collapseChar;
    }

    function setSidebar(collapsed) {
        doc.classList.toggle('sidebar-collapsed', collapsed);
        if (sidebarToggle) {
            sidebarToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            sidebarToggle.setAttribute('aria-label', collapsed ? 'Expand contents panel' : 'Collapse contents panel');
            sidebarToggle.setAttribute('title', collapsed ? 'Expand contents panel' : 'Collapse contents panel');
            setChevron(sidebarToggle, collapsed, '\u2039', '\u203a');
        }
        store('sidebarCollapsed', collapsed);
    }

    function setToc(collapsed) {
        doc.classList.toggle('toc-collapsed', collapsed);
        if (tocToggle) {
            tocToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            tocToggle.setAttribute('aria-label', collapsed ? 'Expand on this page panel' : 'Collapse on this page panel');
            tocToggle.setAttribute('title', collapsed ? 'Expand on this page panel' : 'Collapse on this page panel');
            setChevron(tocToggle, collapsed, '\u203a', '\u2039');
        }
        store('tocCollapsed', collapsed);
    }

    function setMobileNav(open) {
        doc.classList.toggle('mobile-nav-open', open);
        if (sidebarToggle) {
            sidebarToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            sidebarToggle.setAttribute('aria-label', open ? 'Hide contents panel' : 'Show contents panel');
            sidebarToggle.setAttribute('title', open ? 'Hide contents panel' : 'Show contents panel');
            setChevron(sidebarToggle, !open, '\u25b4', '\u25be');
        }
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', function () {
        if (mobileNav.matches) {
            setMobileNav(!doc.classList.contains('mobile-nav-open'));
        } else {
            setSidebar(!doc.classList.contains('sidebar-collapsed'));
        }
    });
    if (tocToggle) tocToggle.addEventListener('click', function () {
        setToc(!doc.classList.contains('toc-collapsed'));
    });
    if (tocExpand) tocExpand.addEventListener('click', function () { setToc(false); });

    // Sync the buttons with the classes applied before first paint.
    // Re-sync the Contents button if the viewport crosses the mobile
    // breakpoint, so its label always matches what it does.
    function syncSidebarButton() {
        if (mobileNav.matches) {
            setMobileNav(doc.classList.contains('mobile-nav-open'));
        } else {
            setSidebar(doc.classList.contains('sidebar-collapsed'));
        }
    }
    syncSidebarButton();
    setToc(doc.classList.contains('toc-collapsed'));
    if (mobileNav.addEventListener) {
        mobileNav.addEventListener('change', syncSidebarButton);
    }
})();
