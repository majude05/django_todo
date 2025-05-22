// static/js/sidebar_toggle.js

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('appSidebar');
    const toggleButton = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent'); // メインコンテンツを取得
    const resizer = document.getElementById('sidebarResizer'); // リサイズハンドルを取得
    const body = document.body;

    const initialSidebarWidth = 300; // 初期幅（CSSの元の値と合わせる）
    const minSidebarWidth = 200;   // 最小幅（CSSのmin-widthと合わせる）
    const maxSidebarWidth = 600;   // 最大幅（CSSのmax-widthと合わせる）

    // --- 既存のトグルボタンの処理 ---
    const applySidebarState = (isCollapsing, newWidth = null) => {
        let targetWidth = localStorage.getItem('sidebarWidth') ? parseInt(localStorage.getItem('sidebarWidth'), 10) : initialSidebarWidth;
        if (newWidth !== null) {
            targetWidth = newWidth;
        }

        if (isCollapsing) { // 閉じる時
            body.classList.add('sidebar-is-collapsed');
            body.classList.remove('sidebar-is-open');
            if (sidebar) sidebar.style.width = '0px'; // JSで幅を0に
            if (resizer) resizer.style.display = 'none';
            if (mainContent) mainContent.style.marginLeft = '0px';
            localStorage.setItem('sidebarCollapsed', 'true');
        } else { // 開く時
            body.classList.remove('sidebar-is-collapsed');
            body.classList.add('sidebar-is-open');
            if (sidebar) sidebar.style.width = targetWidth + 'px'; // JSで幅を設定
            if (resizer) {
                resizer.style.left = targetWidth + 'px';
                resizer.style.display = 'block';
            }
            if (mainContent) mainContent.style.marginLeft = targetWidth + 'px';
            localStorage.setItem('sidebarCollapsed', 'false');
        }
        triggerCalendarResize();
    };

    // --- カレンダーリサイズ関数 (既存のもの) ---
    const triggerCalendarResize = () => {
        setTimeout(() => {
            if (window.myCalendar && window.myCalendar.updateSize) {
                window.myCalendar.updateSize();
            }
        }, 350); // CSS transition (0.3s) より少し長めに設定 + 幅変更の transition も考慮
    };

    // --- トグルボタンのクリックイベント (既存のものを少し修正) ---
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const isCurrentlyOpen = body.classList.contains('sidebar-is-open');
            applySidebarState(isCurrentlyOpen); // isCollapsing は isCurrentlyOpen と同じ
        });
    }

    // --- リサイズ処理 ---
    let isResizing = false;

    if (resizer && sidebar && mainContent) {
        resizer.addEventListener('mousedown', function(e) {
            e.preventDefault(); // デフォルトのドラッグ動作をキャンセル
            isResizing = true;
            body.classList.add('sidebar-resizing'); // ドラッグ中のテキスト選択防止クラス

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        function handleMouseMove(e) {
            if (!isResizing) return;

            let newWidth = e.clientX - sidebar.getBoundingClientRect().left;

            if (newWidth < minSidebarWidth) {
                newWidth = minSidebarWidth;
            } else if (newWidth > maxSidebarWidth) {
                newWidth = maxSidebarWidth;
            }

            sidebar.style.width = newWidth + 'px';
            resizer.style.left = newWidth + 'px';
            mainContent.style.marginLeft = newWidth + 'px';
            triggerCalendarResize(); // 幅変更中もカレンダーサイズを更新
        }

        function handleMouseUp() {
            if (!isResizing) return;
            isResizing = false;
            body.classList.remove('sidebar-resizing');

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // 現在の幅をlocalStorageに保存
            const currentWidth = parseInt(sidebar.style.width, 10);
            if (!isNaN(currentWidth)) {
                localStorage.setItem('sidebarWidth', currentWidth);
            }
            triggerCalendarResize(); // ドラッグ終了後にもう一度
        }
    }

    // --- 初期表示処理 (既存のものを修正) ---
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    let currentSidebarWidth = localStorage.getItem('sidebarWidth') ? parseInt(localStorage.getItem('sidebarWidth'), 10) : initialSidebarWidth;
    if (currentSidebarWidth < minSidebarWidth) currentSidebarWidth = minSidebarWidth;
    if (currentSidebarWidth > maxSidebarWidth) currentSidebarWidth = maxSidebarWidth;

    if (sidebarCollapsed) {
        applySidebarState(true, currentSidebarWidth); // 閉じた状態で初期化
    } else {
        applySidebarState(false, currentSidebarWidth); // 開いた状態で初期化
    }

});