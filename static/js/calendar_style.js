// static/js/calendar_style.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("カレンダースクリプト実行開始 (from calendar_style.js)");
    var calendarEl = document.getElementById('calendar');

    // --- モーダル関連の要素を取得 ---
    const modal = document.getElementById('taskDetailModal'); // HTMLのIDと一致しているか再確認
    const modalCloseButton = modal ? modal.querySelector('.modal-close-button') : null;
    const modalTaskTitle = modal ? modal.querySelector('#modalTaskTitle') : null;
    const modalTaskStart = modal ? modal.querySelector('#modalTaskStart') : null;
    const modalTaskEnd = modal ? modal.querySelector('#modalTaskEnd') : null;
    const modalTaskDescription = modal ? modal.querySelector('#modalTaskDescription') : null;
    const modalTaskTags = modal ? modal.querySelector('#modalTaskTags') : null;
    const modalEditTaskLink = modal ? modal.querySelector('#modalEditTaskLink') : null;

    // --- モーダルを閉じる処理 ---
    if (modalCloseButton) {
        modalCloseButton.onclick = function() {
            if (modal) modal.style.display = "none";
        }
    }
    if (modal) {
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
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
                const startDateTime = info.event.start; // Dateオブジェクトを取得
                const endDateTime = info.event.end;     // Dateオブジェクトを取得

                const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

                const start = startDateTime ? startDateTime.toLocaleString('ja-JP', options) : '未設定';
                const end = endDateTime ? endDateTime.toLocaleString('ja-JP', options) : '未設定'; // ★修正点: options を適用★

                const description = info.event.extendedProps.description || 'なし';
                const tags = info.event.extendedProps.tags.join(', ') || 'なし';
                // const taskId = info.event.id; // taskId を使う場合は宣言する

                const editUrl = info.event.extendedProps.edit_url; // APIから渡された編集用URL

                if (modalTaskTitle) modalTaskTitle.textContent = title;
                if (modalTaskStart) modalTaskStart.textContent = start;
                if (modalTaskEnd) modalTaskEnd.textContent = end; // ★修正されたend文字列をセット★
                if (modalTaskDescription) modalTaskDescription.textContent = description;
                if (modalTaskTags) modalTaskTags.textContent = tags;

                if (modalEditTaskLink && editUrl) {
                    modalEditTaskLink.href = editUrl;
                    modalEditTaskLink.style.display = 'inline-block';
                } else if (modalEditTaskLink) {
                    modalEditTaskLink.style.display = 'none';
                }

                if (modal) modal.style.display = "block";
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