document.addEventListener('DOMContentLoaded', () => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const head = document.querySelector('.gh-head');
    const menu = head?.querySelector('.gh-head-menu');
    const nav = menu?.querySelector('.nav');
    if (!nav) return;

    const navHTML = nav.innerHTML;
    let dropdownInitialized = false;
    let resizeTimeout;

    const makeDropdown = async function () {
        if (mediaQuery.matches || dropdownInitialized) return;
        dropdownInitialized = true;

        const navItems = Array.from(nav.querySelectorAll('li[class^="nav-"]'));
        for (const li of navItems) {
            const a = li.querySelector('a[href*="/tag/"]');
            if (!a) continue;
            const url = new URL(a.href, location.origin);
            const pathParts = url.pathname.replace(/^\/|\/$/g, '').split('/');
            if (pathParts.length !== 2 || pathParts[0] !== 'tag') continue;

            const tagSlug = pathParts[1];

            try {
                const res = await fetch(`/api/nav-dropdown-tag?tag=${tagSlug}`);
                const data = await res.json();
                const posts = data.posts;

                if (posts.length === 0) continue;

                const dropdown = document.createElement('ul');
                dropdown.className = 'nav-submenu is-hidden';

                posts.forEach(post => {
                    const subLi = document.createElement('li');
                    const subA = document.createElement('a');
                    subA.className = 'dropdown-post-link';
                    subA.href = post.url;
                    subA.textContent = post.title;
                    subLi.appendChild(subA);
                    dropdown.appendChild(subLi);
                });

                li.classList.add('nav-has-dropdown');
                li.style.position = 'relative';
                li.appendChild(dropdown);

                li.addEventListener('mouseenter', () => {
                    dropdown.classList.remove('is-hidden');
                });
                li.addEventListener('mouseleave', () => {
                    dropdown.classList.add('is-hidden');
                });
            } catch (e) {
                console.warn(`無法載入 tag: ${tagSlug} 的文章`, e);
            }
        }

        document.body.classList.add('is-dropdown-loaded');
    };

    imagesLoaded(head, makeDropdown);

    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            document.body.classList.remove('is-dropdown-loaded');
            dropdownInitialized = false;
            nav.innerHTML = navHTML;
            makeDropdown();
        }, 300);
    });
});
