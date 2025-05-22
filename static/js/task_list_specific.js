// static/js/task_list_specific.js

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const initialSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        const body = document.body;

        if (initialSidebarCollapsed) {
            body.classList.add('sidebar-is-collapsed');
            body.classList.remove('sidebar-is-open');
        } else {
            body.classList.remove('sidebar-is-collapsed');
            body.classList.add('sidebar-is-open');
        }

        window.myCalendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ja',
            height: 700, // 'auto' にすると内容に応じて高さが変わる。固定したい場合は具体的な値を設定
            // contentHeight: 600, // または contentHeight で内容部分の高さを固定
            dayMaxEvents: 2, // ★ セル内に表示する最大イベント数（祝日名も含むので調整が必要な場合あり）
                            // true にすると高さに応じて自動調整（ただしセルの高さが可変になる可能性）
                            // 数字を指定すると、その数を超えたら "+n more" リンク表示

            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // 必要に応じて調整
            },
            events: "/api/task_events/",
            eventTimeFormat: { // タスクイベントの時間表示フォーマット
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            },
            /*
            dayNumberFormat: { // 日付表示フォーマット
                day: 'numeric',
            },
            */
        
            dayCellContent: function(arg) {
                // arg.dayNumberText にはデフォルトのテキスト（例: "8日"）が入っている
                // arg.date は日付のDateオブジェクト
                // 数字部分だけを取り出す
                let dayOfMonth = arg.date.getDate(); // Dateオブジェクトから日を取得
                return dayOfMonth.toString(); // 数字を文字列として返す
            },

            eventClick: function(info) {
                info.jsEvent.preventDefault(); // デフォルトの動作（URL遷移など）を抑制

                // モーダル表示のロジック（タスク、祝日名、記念日名共通で使えるように調整も検討）
                const eventType = info.event.extendedProps.type;
                const title = info.event.title;
                const startDateTime = info.event.start;
                const endDateTime = info.event.end; // タスクの場合のみ有効
                const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const start = startDateTime ? startDateTime.toLocaleString('ja-JP', options) : '未設定';
                let end = 'なし'; // デフォルト
                if (eventType === 'task' && endDateTime) {
                    end = endDateTime.toLocaleString('ja-JP', options);
                } else if (eventType === 'task' && !endDateTime) {
                    end = '未設定';
                }


                let description = info.event.extendedProps.description || 'なし';
                let tags = info.event.extendedProps.tags ? info.event.extendedProps.tags.join(', ') : 'なし';
                let editUrl = info.event.extendedProps.edit_url;


                document.getElementById('modalTaskTitle').textContent = title;
                document.getElementById('modalTaskStart').textContent = start;
                document.getElementById('modalTaskEnd').textContent = end; // タスク以外では「なし」

                if (eventType === 'task') {
                    document.getElementById('modalTaskDescription').textContent = description;
                    document.getElementById('modalTaskTags').textContent = tags;
                    if (editUrl) {
                        document.getElementById('modalEditTaskLink').href = editUrl;
                        document.getElementById('modalEditTaskLink').style.display = 'inline-block';
                    } else {
                        document.getElementById('modalEditTaskLink').style.display = 'none';
                    }
                } else { // 祝日・記念日の場合
                    document.getElementById('modalTaskDescription').textContent = 'なし'; // または祝日の説明など
                    document.getElementById('modalTaskTags').textContent = 'なし';
                    document.getElementById('modalEditTaskLink').style.display = 'none';
                }

                document.getElementById('taskDetailModal').style.display = "block";
            },
            dateClick: function(info) {
                let selectedDateForTaskAdd = info.dateStr;
                const dateClickConfirmModalMessage = document.getElementById('dateClickConfirmModalMessage');
                if (dateClickConfirmModalMessage) {
                    const dateObj = new Date(info.dateStr + 'T00:00:00'); // タイムゾーン考慮が必要な場合は調整
                    const formattedDate = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
                    dateClickConfirmModalMessage.textContent = `${formattedDate} に新しいタスクを追加しますか？`;
                }
                const dateClickConfirmModal = document.getElementById('dateClickConfirmModal');
                if (dateClickConfirmModal) {
                    dateClickConfirmModal.style.display = "block";
                }

                const dateClickConfirmModalOkButton = document.getElementById('dateClickConfirmModalOkButton');
                if(dateClickConfirmModalOkButton){
                    const newOkButton = dateClickConfirmModalOkButton.cloneNode(true); // イベントリスナーを再付与するため複製
                    dateClickConfirmModalOkButton.parentNode.replaceChild(newOkButton, dateClickConfirmModalOkButton);

                    newOkButton.onclick = function() { // 新しいボタンにイベントリスナーを設定
                        if (selectedDateForTaskAdd) {
                            const addTaskUrl = `/add/?due_date=${selectedDateForTaskAdd}`;
                            window.location.href = addTaskUrl;
                        }
                        if (dateClickConfirmModal) dateClickConfirmModal.style.display = "none";
                    }
                }
            },
            loading: function(isLoading) {
                const calendarContainer = document.getElementById('calendar');
                if (isLoading) {
                    if (calendarContainer) calendarContainer.classList.add('calendar-loading');
                } else {
                    if (calendarContainer) calendarContainer.classList.remove('calendar-loading');
                }
            },
            eventDidMount: function(arg) {
                if (arg.event.extendedProps && arg.event.extendedProps.type === 'statutory_holiday_background') {
                    let dayCellElement = arg.el.closest('.fc-daygrid-day');
                    if (dayCellElement) {
                        dayCellElement.classList.add('fc-day-is-statutory-holiday');
                    }
                }
                // ここで祝日名やタスクの順序をDOM操作で調整することも可能だが、複雑になるため
                // views.pyでのイベント生成順序とCSSでのスタイリングで対応するのが基本。
                // もし厳密なDOM順序が必要な場合は、eventOrder オプションや
                // eventContent フックでのカスタムレンダリングを検討。
            },
            viewDidMount: function(info) {
                if (window.myCalendar && window.myCalendar.updateSize) {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            window.myCalendar.updateSize();
                        });
                    });
                }
            },
            // イベントの表示順序を制御 (例: 祝日名を先頭に、次にタスクなど)
            // eventOrder: 'extendedProps.type,start', // typeでソート (例: 'holiday_name', 'task')
            // または、より具体的に order プロパティを extendedProps に追加してソート
            eventOrder: function(eventA, eventB) {
                const typeOrder = {
                    'statutory_holiday_name': 1,
                    'memorial_day_name': 1, // 祝日と記念日を同列1番目に
                    'task': 2 // タスクを2番目に
                };
                const orderA = typeOrder[eventA.extendedProps.type] || 99;
                const orderB = typeOrder[eventB.extendedProps.type] || 99;

                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                // 同じタイプの場合は開始日でソート（任意）
                if (eventA.start && eventB.start) {
                    return eventA.start.valueOf() - eventB.start.valueOf();
                }
                return 0;
            }
        });

        window.myCalendar.render();

        setTimeout(() => {
            if (window.myCalendar && window.myCalendar.updateSize) {
                window.myCalendar.updateSize();
            }
        }, 200);

        window.addEventListener('load', () => {
            setTimeout(() => {
                if (window.myCalendar && window.myCalendar.updateSize) {
                    window.myCalendar.updateSize();
                }
            }, 300);
        });
    }

    // モーダル関連の処理
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