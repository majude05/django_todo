// static/js/calendar_style.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("カレンダースクリプト実行開始 (from calendar_style.js)");
    var calendarEl = document.getElementById('calendar');

    // --- タスク詳細モーダル関連の要素を取得 ---
    const taskDetailModal = document.getElementById('taskDetailModal'); // HTMLのIDと一致しているか確認
    const taskDetailModalCloseButton = taskDetailModal ? taskDetailModal.querySelector('.modal-close-button') : null;
    const modalTaskTitle = taskDetailModal ? taskDetailModal.querySelector('#modalTaskTitle') : null;
    const modalTaskStart = taskDetailModal ? taskDetailModal.querySelector('#modalTaskStart') : null;
    const modalTaskEnd = taskDetailModal ? taskDetailModal.querySelector('#modalTaskEnd') : null;
    const modalTaskDescription = taskDetailModal ? taskDetailModal.querySelector('#modalTaskDescription') : null;
    const modalTaskTags = taskDetailModal ? taskDetailModal.querySelector('#modalTaskTags') : null;
    const modalEditTaskLink = taskDetailModal ? taskDetailModal.querySelector('#modalEditTaskLink') : null;

    // --- 日付クリック確認モーダル関連の要素を取得 ---
    // HTML側のIDを 'dateClickConfirmModal' に修正してください (dete -> date)
    const dateClickConfirmModal = document.getElementById('dateClickConfirmModal');
    const dateClickConfirmModalCloseButton = dateClickConfirmModal ? dateClickConfirmModal.querySelector('#dateClickConfirmModalCloseButton') : null;
    const dateClickConfirmModalMessage = dateClickConfirmModal ? dateClickConfirmModal.querySelector('#dateClickConfirmModalMessage') : null;
    const dateClickConfirmModalCancelButton = dateClickConfirmModal ? dateClickConfirmModal.querySelector('#dateClickConfirmModalCancelButton') : null;
    const dateClickConfirmModalOkButton = dateClickConfirmModal ? dateClickConfirmModal.querySelector('#dateClickConfirmModalOkButton') : null;
    let selectedDateForTaskAdd = null; // クリックされた日付を一時的に保持

    // --- タスク詳細モーダルを閉じる処理 ---
    if (taskDetailModalCloseButton) {
        taskDetailModalCloseButton.onclick = function() {
            if (taskDetailModal) taskDetailModal.style.display = "none";
        }
    }
    // タスク詳細モーダルの背景クリックで閉じる
    // window.onclick は一つしか設定できないため、両方のモーダルに対応できるよう addEventListener を使う
    window.addEventListener('click', function(event) {
        if (taskDetailModal && event.target == taskDetailModal) {
            taskDetailModal.style.display = "none";
        }
        if (dateClickConfirmModal && event.target == dateClickConfirmModal) {
            dateClickConfirmModal.style.display = "none";
        }
    });


    // --- 日付クリック確認モーダルを閉じる処理 ---
    if (dateClickConfirmModalCloseButton) {
        dateClickConfirmModalCloseButton.onclick = function() {
            if (dateClickConfirmModal) dateClickConfirmModal.style.display = "none";
        }
    }
    if (dateClickConfirmModalCancelButton) {
        dateClickConfirmModalCancelButton.onclick = function() {
            if (dateClickConfirmModal) dateClickConfirmModal.style.display = "none";
        }
    }

    // --- 「はい、追加する」ボタンの処理 ---
    if (dateClickConfirmModalOkButton) {
        dateClickConfirmModalOkButton.onclick = function() {
            if (selectedDateForTaskAdd) {
                const addTaskUrl = `/add/?due_date=${selectedDateForTaskAdd}`;
                window.location.href = addTaskUrl;
            }
            if (dateClickConfirmModal) dateClickConfirmModal.style.display = "none";
        }
    }


    if (calendarEl) {
        var calendar = new FullCalendar.Calendar(calendarEl, {
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

                if (modalTaskTitle) modalTaskTitle.textContent = title;
                if (modalTaskStart) modalTaskStart.textContent = start;
                if (modalTaskEnd) modalTaskEnd.textContent = end;
                if (modalTaskDescription) modalTaskDescription.textContent = description;
                if (modalTaskTags) modalTaskTags.textContent = tags;

                if (modalEditTaskLink && editUrl) {
                    modalEditTaskLink.href = editUrl;
                    modalEditTaskLink.style.display = 'inline-block';
                } else if (modalEditTaskLink) {
                    modalEditTaskLink.style.display = 'none';
                }

                if (taskDetailModal) taskDetailModal.style.display = "block"; // taskDetailModal を表示
            },
            dateClick: function(info) {
                console.log("日付がクリックされました。日付：", info.dateStr);
                selectedDateForTaskAdd = info.dateStr; // クリックされた日付を保存

                if (dateClickConfirmModalMessage) {
                    const dateObj = new Date(info.dateStr + 'T00:00:00'); // 時間部分を補完
                    const formattedDate = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
                    dateClickConfirmModalMessage.textContent = `${formattedDate} に新しいタスクを追加しますか？`;
                }

                if (dateClickConfirmModal) { // 確認モーダルが存在すれば表示
                    dateClickConfirmModal.style.display = "block";
                } else {
                    console.error("日付クリック確認モーダル (dateClickConfirmModal) が見つかりません。");
                }
            },
            loading: function(isLoading) {
                // (変更なし)
            }
        });
        calendar.render();
        console.log("カレンダーのrenderが呼び出されました。 (from calendar_style.js)");
    } else {
        console.error("カレンダー要素 (id='calendar') がHTML内に見つかりません。 (from calendar_style.js)");
    }
});