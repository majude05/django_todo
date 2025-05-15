// static/js/calendar_style.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("カレンダースクリプト実行開始 (from calendar_style.js)");
    var calendarEl = document.getElementById('calendar');

    // --- モーダル関連の要素を取得 ---
    const modal = document.getElementById('taskDetailModal');
    const modalCloseButton = document.querySelector('.modal-close-button');
    const modalTaskTitle = document.getElementById('modalTaskTitle');
    const modalTaskStart = document.getElementById('modalTaskStart');
    // const modalTaskEnd = document.getElementById('modalTaskEnd'); // end_dateがないためコメントアウト
    const modalTaskDescription = document.getElementById('modalTaskDescription');
    const modalTaskTags = document.getElementById('modalTaskTags');
    const modalEditTaskLink = document.getElementById('modalEditTaskLink');

    // --- モーダルを閉じる処理 ---
    if (modalCloseButton) {
        modalCloseButton.onclick = function() {
            if (modal) modal.style.display = "none";
        }
    }
    // モーダル背景クリックで閉じる (任意)
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

                // extendedPropsから詳細情報を取得
                const title = info.event.title;
                const start = info.event.start ? info.event.start.toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '未設定';
                // const end = info.event.end ? info.event.end.toLocaleString('ja-JP') : '未設定';
                const description = info.event.extendedProps.description || 'なし';
                const tags = info.event.extendedProps.tags.join(', ') || 'なし';
                const taskId = info.event.id; // APIから渡されるタスクID

                // モーダルに情報をセット
                if (modalTaskTitle) modalTaskTitle.textContent = title;
                if (modalTaskStart) modalTaskStart.textContent = start;
                // if (modalTaskEnd) modalTaskEnd.textContent = end;
                if (modalTaskDescription) modalTaskDescription.textContent = description;
                if (modalTaskTags) modalTaskTags.textContent = tags;

                // 編集ボタンのリンク先を設定 (DjangoのURLリバースはJavaScriptでは直接使えないので、ベースURLを組み立てる)
                if (modalEditTaskLink && taskId) {
                    // 注意: このURLはプロジェクトのURL構造に依存します。
                    // settings.pyの 'todo_app.views.edit_task' の name が 'edit_task' の場合
                    modalEditTaskLink.href = `/edit/${taskId}/`; // 実際のURL構造に合わせてください
                }


                // モーダルを表示
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