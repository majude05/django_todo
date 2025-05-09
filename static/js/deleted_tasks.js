document.addEventListener("DOMContentLoaded", function () {
    const selectButton = document.getElementById("select-tasks");
    const deleteSelectedButton = document.getElementById("delete-selected");
    const bulkDeleteForm = document.getElementById("bulk-delete-form");
    const allCheckbox = document.getElementById("select-all");
    const allCheckboxLabel = document.getElementById("select-all-label"); // ラベルも取得

    
    if (selectButton) {
        selectButton.addEventListener("click", function () {
            const taskCheckboxes = document.querySelectorAll(".task-checkbox");
            
            let isCurrentlySelecting = selectButton.dataset.selecting === 'true';

            
            isCurrentlySelecting = !isCurrentlySelecting;
            selectButton.dataset.selecting = isCurrentlySelecting;

            if (isCurrentlySelecting) {
                selectButton.textContent = '選択解除';
                if (allCheckbox) allCheckbox.style.display = 'inline-block';
                if (allCheckboxLabel) allCheckboxLabel.style.display = 'inline-block'; 
                if (deleteSelectedButton) deleteSelectedButton.style.display = 'inline-block';
                taskCheckboxes.forEach((checkbox) => {
                    checkbox.style.display = 'inline-block';
                });
            } else { 
                selectButton.textContent = '選択';
                if (allCheckbox) {
                    allCheckbox.style.display = 'none';
                    allCheckbox.checked = false; 
                }
                if (allCheckboxLabel) allCheckboxLabel.style.display = 'none'; 
                if (deleteSelectedButton) deleteSelectedButton.style.display = 'none';
                taskCheckboxes.forEach((checkbox) => {
                    checkbox.style.display = 'none';
                    checkbox.checked = false;
                });
            }
        });
    }

    if (allCheckbox) {
        allCheckbox.addEventListener("click", function () {
            const taskCheckboxes = document.querySelectorAll(".task-checkbox");
            taskCheckboxes.forEach((checkbox) => {
                checkbox.checked = allCheckbox.checked;
            });
        });
    }

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