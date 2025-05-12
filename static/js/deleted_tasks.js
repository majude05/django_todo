document.addEventListener("DOMContentLoaded", function () {
    const selectButton = document.getElementById("select-tasks");
    const deleteSelectedButton = document.getElementById("delete-selected");
    const bulkDeleteForm = document.getElementById("bulk-delete-form");
    const allCheckbox = document.getElementById("select-all"); // <input type="checkbox"> 本体
    const allCheckboxLabelContainer = document.getElementById("select-all-label-container"); // <label> コンテナ
    // const selectedCountDisplay = document.getElementById('selected-count-display'); // もし選択件数表示を追加する場合

    // 「すべて選択」チェックボックスの状態を更新する関数
    function updateSelectAllCheckboxVisualState() {
        if (!allCheckbox) return;

        const taskCheckboxes = document.querySelectorAll(".task-checkbox");
        if (!taskCheckboxes.length) { // タスクが一つもない場合
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
            allCheckbox.checked = false; // または true のまま中間状態を表示するならそれでも可
            allCheckbox.indeterminate = true;
        }
    }

    // 選択されているアイテム数を表示する関数 (もし実装する場合)
    /*
    function updateSelectedCountDisplay() {
        if (!selectedCountDisplay) return;
        const selectedCheckboxes = document.querySelectorAll(".task-checkbox:checked");
        if (selectedCheckboxes.length > 0) {
            selectedCountDisplay.textContent = `${selectedCheckboxes.length}件のタスクを選択中`;
        } else {
            selectedCountDisplay.textContent = '';
        }
    }
    */

    if (selectButton) {
        selectButton.addEventListener("click", function () {
            const taskCheckboxes = document.querySelectorAll(".task-checkbox");
            let isCurrentlySelecting = selectButton.dataset.selecting === 'true';

            isCurrentlySelecting = !isCurrentlySelecting; // 状態をトグル
            selectButton.dataset.selecting = isCurrentlySelecting;

            if (isCurrentlySelecting) { // これから選択モードになる
                selectButton.textContent = '選択解除';
                if (allCheckboxLabelContainer) allCheckboxLabelContainer.style.display = 'inline-flex'; // 表示スタイル変更
                if (deleteSelectedButton) deleteSelectedButton.style.display = 'inline-block';
                taskCheckboxes.forEach((checkbox) => {
                    checkbox.style.display = 'inline-block'; // 標準チェックボックスの表示（カスタム化する場合は変更）
                });
            } else { // これから選択モードを解除する
                selectButton.textContent = '選択';
                if (allCheckboxLabelContainer) allCheckboxLabelContainer.style.display = 'none';
                if (allCheckbox) {
                    allCheckbox.checked = false;
                    allCheckbox.indeterminate = false; // 中間状態もリセット
                }
                if (deleteSelectedButton) deleteSelectedButton.style.display = 'none';
                taskCheckboxes.forEach((checkbox) => {
                    checkbox.style.display = 'none';
                    checkbox.checked = false;
                });
            }
            updateSelectAllCheckboxVisualState(); // 選択モード切替時にも「すべて選択」の状態を更新
            // updateSelectedCountDisplay(); // 選択件数表示も更新 (もし実装する場合)
        });
    }

    if (allCheckbox) {
        allCheckbox.addEventListener("click", function () {
            const taskCheckboxes = document.querySelectorAll(".task-checkbox");
            taskCheckboxes.forEach((checkbox) => {
                checkbox.checked = allCheckbox.checked;
            });
            // allCheckbox.indeterminate = false; // 自身がクリックされたら中間状態は解除
            updateSelectAllCheckboxVisualState(); // 他のチェックボックスの状態と整合性を取るため再評価
            // updateSelectedCountDisplay(); // 選択件数表示も更新 (もし実装する場合)
        });
    }

    // 各タスクのチェックボックスが変更されたときにも「すべて選択」の状態を更新
    document.querySelectorAll(".task-checkbox").forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectAllCheckboxVisualState();
            // updateSelectedCountDisplay(); // 選択件数表示も更新 (もし実装する場合)
        });
    });


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

    // 初期読み込み時にも「すべて選択」の状態を（もし表示されていれば）確認
    // ただし、初期は非表示なので、選択ボタンクリック時に updateSelectAllCheckboxVisualState を呼ぶ方が適切
    // updateSelectAllCheckboxVisualState();
});