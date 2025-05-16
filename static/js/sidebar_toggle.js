// static/js/sidebar_toggle.js
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('appSidebar');
    const toggleButton = document.getElementById('sidebarToggle');
    const body = document.body;

    if (!sidebar || !toggleButton) {
        console.error("Sidebar or toggleButton element not found.");
        return;
    }

    // サイドバーの状態を適用し、localStorageに保存する関数
    const applySidebarState = (isCollapsing) => {
        if (isCollapsing) {
            body.classList.add('sidebar-is-collapsed');
            body.classList.remove('sidebar-is-open');
            localStorage.setItem('sidebarCollapsed', 'true');
        } else {
            body.classList.remove('sidebar-is-collapsed');
            body.classList.add('sidebar-is-open');
            localStorage.setItem('sidebarCollapsed', 'false');
        }

        // FullCalendarのサイズ再描画をトリガー
        // CSSトランジションの完了を待つ
        setTimeout(() => {
            if (window.myCalendar && window.myCalendar.updateSize) {
                console.log("Sidebar toggle: Forcing FullCalendar updateSize after transition (400ms).");
                window.myCalendar.updateSize();
            } else {
                console.warn("Sidebar toggle: window.myCalendar or updateSize not found at this time.");
            }
        }, 400); // CSS transition (0.3s) より少し長めに設定
    };

    toggleButton.addEventListener('click', function() {
        const isCurrentlyOpen = body.classList.contains('sidebar-is-open');
        applySidebarState(isCurrentlyOpen);
    });
});