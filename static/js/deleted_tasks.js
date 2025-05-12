document.addEventListener("DOMContentLoaded", function () {
    const selectButton = document.getElementById("select-tasks");
    const deleteSelectedButton = document.getElementById("delete-selected");
    const bulkDeleteForm = document.getElementById("bulk-delete-form");
    const allCheckbox = document.getElementById("select-all");
    const allCheckboxLabelContainer = document.getElementById("select-all-label-container");
    const selectedCountDisplay = document.getElementById('selected-count-display');
    console.log('[初期状態] selectedCountDisplay 要素:', selectedCountDisplay); // ★ログ1★

    function updateSelectAllCheckboxVisualState() {
        if (!allCheckbox) return;
        const taskCheckboxes = document.querySelectorAll(".task-checkbox");
        if (!taskCheckboxes.length) {
            allCheckbox.checked = false;
            allCheckbox.indeterminate = false;
            return;
        }
        const checkedCount = Array.from(taskCheckboxes).filter(cb => cb.checked).length;
        if (checkedCount === 0) {
            allCheckbox.checked = false;
            allCheckbox.indeterminate = false;
        } else if (checkedCount === taskCheckboxes.length) {
            allCheckbox.checked = true;
            allCheckbox.indeterminate = false;
        } else {
            allCheckbox.checked = false;
            allCheckbox.indeterminate = true;
        }
    }

    function updateSelectedCountDisplay() {
        console.log('[関数呼び出し] updateSelectedCountDisplay が呼ばれました。'); // ★ログ2★
        if (!selectedCountDisplay) {
            console.error('[エラー] selectedCountDisplay 要素が見つかりません！'); // ★ログ3★
            return;
        }
        const selectedCheckboxes = document.querySelectorAll(".task-checkbox:checked");
        console.log('[件数確認] 選択されたチェックボックスの数:', selectedCheckboxes.length); // ★ログ4★

        if (selectedCheckboxes.length > 0) {
            selectedCountDisplay.textContent = `${selectedCheckboxes.length}件のタスクを選択中`;
            selectedCountDisplay.style.display = 'inline';
            console.log('[表示処理] 件数を表示します:', selectedCountDisplay.textContent); // ★ログ5★
        } else {
            selectedCountDisplay.textContent = '';
            selectedCountDisplay.style.display = 'none';
            console.log('[表示処理] 件数表示を非表示にします。'); // ★ログ6★
        }
    }

    if (selectButton) {
        selectButton.addEventListener("click", function () {
            console.log('[イベント] 「選択」ボタンがクリックされました。'); // ★ログ7★
            const taskCheckboxes = document.querySelectorAll(".task-checkbox");
            let isCurrentlySelecting = selectButton.dataset.selecting === 'true';

            isCurrentlySelecting = !isCurrentlySelecting;
            selectButton.dataset.selecting = isCurrentlySelecting;
            console.log('[状態変更] isCurrentlySelecting:', isCurrentlySelecting); // ★ログ8★

            const displayStyleForControls = isCurrentlySelecting ? 'inline-flex' : 'none';
            const displayStyleForButtons = isCurrentlySelecting ? 'inline-block' : 'none';
            const displayStyleForTaskCb = isCurrentlySelecting ? 'inline-block' : 'none';
            const displayStyleForCount = isCurrentlySelecting ? 'inline' : 'none';

            selectButton.textContent = isCurrentlySelecting ? '選択解除' : '選択';

            if (allCheckboxLabelContainer) {
                allCheckboxLabelContainer.style.display = displayStyleForControls;
            }
            if (selectedCountDisplay) {
                selectedCountDisplay.style.display = displayStyleForCount;
                console.log('[表示制御] selectedCountDisplay の表示を次のように設定:', displayStyleForCount); // ★ログ9★
            }
            if (deleteSelectedButton) {
                deleteSelectedButton.style.display = displayStyleForButtons;
            }

            taskCheckboxes.forEach((checkbox) => {
                checkbox.style.display = displayStyleForTaskCb;
                if (!isCurrentlySelecting) {
                    checkbox.checked = false;
                }
            });

            if (!isCurrentlySelecting && allCheckbox) {
                allCheckbox.checked = false;
                allCheckbox.indeterminate = false;
            }

            updateSelectAllCheckboxVisualState();
            updateSelectedCountDisplay();
        });
    }

    if (allCheckbox) {
        allCheckbox.addEventListener("click", function () {
            console.log('[イベント] 「すべて選択」チェックボックスがクリックされました。'); // ★ログ10★
            const taskCheckboxes = document.querySelectorAll(".task-checkbox");
            taskCheckboxes.forEach((checkbox) => {
                checkbox.checked = allCheckbox.checked;
            });
            updateSelectAllCheckboxVisualState();
            updateSelectedCountDisplay();
        });
    }

    document.querySelectorAll(".task-checkbox").forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            console.log('[イベント] 個別のタスクチェックボックスの状態が変更されました。'); // ★ログ11★
            updateSelectAllCheckboxVisualState();
            updateSelectedCountDisplay();
        });
    });

    // ... (deleteSelectedButton と deleteAllButton の処理は変更なし) ...
    if (deleteSelectedButton && bulkDeleteForm) {
        deleteSelectedButton.addEventListener("click", function () {
            const selectedCheckboxes = document.querySelectorAll(".task-checkbox:checked");
            if (selectedCheckboxes.length === 0) {
                alert("削除するタスクを選択してください。");
                return;
            }
            const selectedTaskIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
            document.getElementById("task-ids").value = JSON.stringify(selectedTaskIds);

            if (confirm("選択したタスクを完全に削除しますか？この操作は取り消せません。")) {
                bulkDeleteForm.submit();
            }
        });
    }

    const deleteAllButton = document.getElementById("delete-all");
    const deleteAllForm = document.getElementById("delete-all-form");

    if (deleteAllButton && deleteAllForm) {
        deleteAllButton.addEventListener("click", function (event) {
            event.preventDefault();
            if (confirm("すべての削除済みタスクを完全に削除しますか？この操作は取り消せません。")) {
                deleteAllForm.submit();
            }
        });
    }
});