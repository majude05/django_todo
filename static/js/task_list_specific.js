// static/js/task_list_specific.js
document.addEventListener('DOMContentLoaded', function() {
    // タスクリストの開閉機能 (未完了・完了済み共通化)
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(header => {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.toggle-icon');

        // 未完了タスクの初期表示状態を設定 (デフォルトで開く)
        if (header.textContent.includes('未完了のタスク') && content) {
            // 初期状態で開いておく場合は何もしないか、明示的に display = "block"
            // アイコンも対応するものを表示
            if (icon) icon.textContent = '-';
        } else if (content) { // 完了タスクは初期状態で閉じる
            content.style.display = "none";
            if (icon) icon.textContent = '+';
        }


        header.addEventListener('click', function() {
            if (content) { // content が null でないことを確認
                const isHidden = content.style.display === "none" || content.style.display === "";
                content.style.display = isHidden ? "block" : "none";
                if (icon) icon.textContent = isHidden ? '-' : '+';
            }
        });
    });

    // FullCalendarの初期化処理 (変更なし)
    var calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        window.myCalendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ja',
            height: 'auto',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            },
            events: "/api/task_events/",
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            },
            eventClick: function(info) {
                info.jsEvent.preventDefault();

                const title = info.event.title;
                const startDateTime = info.event.start;
                const endDateTime = info.event.end;
                const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const start = startDateTime ? startDateTime.toLocaleString('ja-JP', options) : '未設定';
                const end = endDateTime ? endDateTime.toLocaleString('ja-JP', options) : '未設定';
                const description = info.event.extendedProps.description || 'なし';
                const tags = info.event.extendedProps.tags.join(', ') || 'なし';
                const editUrl = info.event.extendedProps.edit_url;

                document.getElementById('modalTaskTitle').textContent = title;
                document.getElementById('modalTaskStart').textContent = start;
                document.getElementById('modalTaskEnd').textContent = end;
                document.getElementById('modalTaskDescription').textContent = description;
                document.getElementById('modalTaskTags').textContent = tags;
                if (editUrl) {
                    document.getElementById('modalEditTaskLink').href = editUrl;
                    document.getElementById('modalEditTaskLink').style.display = 'inline-block';
                } else {
                    document.getElementById('modalEditTaskLink').style.display = 'none';
                }
                document.getElementById('taskDetailModal').style.display = "block";
            },
            dateClick: function(info) {
                let selectedDateForTaskAdd = info.dateStr;
                const dateClickConfirmModalMessage = document.getElementById('dateClickConfirmModalMessage');
                if (dateClickConfirmModalMessage) {
                    const dateObj = new Date(info.dateStr + 'T00:00:00');
                    const formattedDate = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
                    dateClickConfirmModalMessage.textContent = `${formattedDate} に新しいタスクを追加しますか？`;
                }
                const dateClickConfirmModal = document.getElementById('dateClickConfirmModal');
                if (dateClickConfirmModal) {
                    dateClickConfirmModal.style.display = "block";
                }

                const dateClickConfirmModalOkButton = document.getElementById('dateClickConfirmModalOkButton');
                if(dateClickConfirmModalOkButton){
                    const newOkButton = dateClickConfirmModalOkButton.cloneNode(true);
                    dateClickConfirmModalOkButton.parentNode.replaceChild(newOkButton, dateClickConfirmModalOkButton);

                    newOkButton.onclick = function() {
                        if (selectedDateForTaskAdd) {
                            const addTaskUrl = `/add/?due_date=${selectedDateForTaskAdd}`;
                            window.location.href = addTaskUrl;
                        }
                        if (dateClickConfirmModal) dateClickConfirmModal.style.display = "none";
                    }
                }
            },
            loading: function(isLoading) {
                // ローディング処理
            }
        });
        window.myCalendar.render();
    }

    // モーダル関連の処理 (変更なし)
    const taskDetailModal = document.getElementById('taskDetailModal');
    const taskDetailModalCloseButton = taskDetailModal ? taskDetailModal.querySelector('.modal-close-button') : null;
    if (taskDetailModalCloseButton) {
        taskDetailModalCloseButton.onclick = function() {
            if (taskDetailModal) taskDetailModal.style.display = "none";
        }
    }

    const dateClickConfirmModal = document.getElementById('dateClickConfirmModal');
    const dateClickConfirmModalClose = dateClickConfirmModal ? dateClickConfirmModal.querySelector('#dateClickConfirmModalCloseButton') : null;
    const dateClickConfirmModalCancelButton = dateClickConfirmModal ? dateClickConfirmModal.querySelector('#dateClickConfirmModalCancelButton') : null;

    if(dateClickConfirmModalClose) {
        dateClickConfirmModalClose.onclick = function() {
            if(dateClickConfirmModal) dateClickConfirmModal.style.display = "none";
        }
    }
    if(dateClickConfirmModalCancelButton) {
        dateClickConfirmModalCancelButton.onclick = function() {
            if(dateClickConfirmModal) dateClickConfirmModal.style.display = "none";
        }
    }

    window.addEventListener('click', function(event) {
        if (taskDetailModal && event.target == taskDetailModal) {
            taskDetailModal.style.display = "none";
        }
        if (dateClickConfirmModal && event.target == dateClickConfirmModal) {
            dateClickConfirmModal.style.display = "none";
        }
    });
});