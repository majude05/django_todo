// static/js/sidebar_toggle.js
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('appSidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle'); // 画面固定のトグルボタン
    const body = document.body;

    if (!sidebar) {
        console.error("Sidebar element (id='appSidebar') not found.");
        return;
    }
    if (!mainContent) {
        console.error("Main content element (id='mainContent') not found.");
        return;
    }
    if (!toggleButton) {
        console.error("Sidebar toggle button (id='sidebarToggle') not found.");
        return;
    }

    const applySidebarState = (isCollapsed) => {
        if (isCollapsed) {
            sidebar.classList.add('sidebar-collapsed');
            mainContent.classList.add('sidebar-collapsed'); // メインコンテンツのpadding調整用
            body.classList.add('sidebar-is-collapsed');     // bodyに状態クラス追加 (ボタン位置調整などに使用可)
            body.classList.remove('sidebar-is-open');
        } else {
            sidebar.classList.remove('sidebar-collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            body.classList.remove('sidebar-is-collapsed');
            body.classList.add('sidebar-is-open');
        }
        localStorage.setItem('sidebarCollapsed', isCollapsed.toString()); // 文字列として保存

        // FullCalendarのサイズ再描画をトリガー
        if (window.myCalendar && typeof window.myCalendar.updateSize === 'function') {
            // アニメーション完了後に再描画
            setTimeout(() => {
                window.myCalendar.updateSize();
                console.log("FullCalendar size updated after sidebar toggle.");
            }, 350); // CSSのtransition時間より少し長めに設定
        } else {
            // カレンダーがないページや、myCalendarが未定義の場合の警告
            // console.warn("window.myCalendar is not defined or not a FullCalendar instance.");
        }
    };

    // 初期状態をlocalStorageから読み込む
    // localStorageの値は文字列なので、'true'と比較
    const initialIsCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    applySidebarState(initialIsCollapsed);

    toggleButton.addEventListener('click', function() {
        const isCurrentlyCollapsed = sidebar.classList.contains('sidebar-collapsed');
        applySidebarState(!isCurrentlyCollapsed); // 現在の状態を反転
    });
});