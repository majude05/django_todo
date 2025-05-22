// static/js/task_list_specific.js

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    // --- 日付クリック確認モーダル関連の要素を取得 ---
    // (taskDetailModal関連の要素取得は変更なしなので省略)
    const dateClickConfirmModal = document.getElementById('dateClickConfirmModal');
    const dateClickConfirmModalMessage = dateClickConfirmModal ? dateClickConfirmModal.querySelector('#dateClickConfirmModalMessage') : null;
    let selectedDateForTaskAdd = null; // クリックされた日付を一時的に保持

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
            height: 700,
            dayMaxEvents: 2,
            displayEventTime: false,
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
            dayPopoverFormat: {},
            dayCellContent: function(arg) {
                let dayOfMonth = arg.date.getDate();
                return dayOfMonth.toString();
            },
            eventClick: function(info) {
                info.jsEvent.preventDefault();

                const eventType = info.event.extendedProps.type;
                const modalEditLink = document.getElementById('modalEditTaskLink');
                const modalDeleteForm = document.getElementById('modalDeleteTaskForm');

                // ★修正点: タスク以外のイベントクリック時にはタスク詳細モーダルを表示しない
                if (eventType !== 'task') {
                    // 祝日名などのイベントがクリックされた場合は、タスク追加モーダルを表示
                    const dateStr = info.event.startStr.substring(0, 10); // YYYY-MM-DD を取得
                    selectedDateForTaskAdd = dateStr;

                    if (dateClickConfirmModalMessage) {
                        const dateObj = new Date(dateStr + 'T00:00:00');
                        const formattedDate = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
                        dateClickConfirmModalMessage.textContent = `${formattedDate} に新しいタスクを追加しますか？`;
                    }
                    if (dateClickConfirmModal) {
                        dateClickConfirmModal.style.display = "block";
                    }
                    // 非タスクイベントの場合は編集・削除ボタンを非表示
                    if (modalEditLink) modalEditLink.style.display = 'none';
                    if (modalDeleteForm) modalDeleteForm.style.display = 'none'; // ★ 削除フォームも非表示
                    return;
                }

                // 以下は eventType が 'task' の場合の既存の処理
                const title = info.event.title;
                const startDateTime = info.event.start;
                const endDateTime = info.event.end;
                const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const start = startDateTime ? startDateTime.toLocaleString('ja-JP', options) : '未設定';
                let end = 'なし';
                if (eventType === 'task' && endDateTime) {
                    end = endDateTime.toLocaleString('ja-JP', options);
                } else if (eventType === 'task' && !endDateTime) {
                    end = '未設定';
                }

                let description = info.event.extendedProps.description || 'なし';
                let tags = info.event.extendedProps.tags ? info.event.extendedProps.tags.join(', ') : 'なし';
                let editUrl = info.event.extendedProps.edit_url;
                let deleteUrl = info.event.extendedProps.delete_url; // ★ delete_url を取得

                document.getElementById('modalTaskTitle').textContent = title;
                document.getElementById('modalTaskStart').textContent = start;
                document.getElementById('modalTaskEnd').textContent = end;
                document.getElementById('modalTaskDescription').textContent = description;
                document.getElementById('modalTaskTags').textContent = tags;

                if (editUrl && modalEditLink) {
                    modalEditLink.href = editUrl;
                    modalEditLink.style.display = 'inline-block';
                } else if (modalEditLink) {
                    modalEditLink.style.display = 'none';
                }

                // ★ 削除フォームの action を設定し、表示する
                if (deleteUrl && modalDeleteForm) {
                    modalDeleteForm.action = deleteUrl;
                    modalDeleteForm.style.display = 'inline-block'; 
                } else if (modalDeleteForm) {
                    modalDeleteForm.style.display = 'none';
                }
                
                document.getElementById('taskDetailModal').style.display = "block";
            },
            dateClick: function(info) {
                selectedDateForTaskAdd = info.dateStr;
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
            eventOrder: function(eventA, eventB) {
                const typeOrder = {
                    'statutory_holiday_name': 1,
                    'memorial_day_name': 1,
                    'task': 2
                };
                const orderA = typeOrder[eventA.extendedProps.type] || 99;
                const orderB = typeOrder[eventB.extendedProps.type] || 99;

                if (orderA !== orderB) {
                    return orderA - orderB;
                }
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

    // モーダル関連の処理 (変更なし)
    const taskDetailModal = document.getElementById('taskDetailModal');
    const taskDetailModalCloseButton = taskDetailModal ? taskDetailModal.querySelector('.modal-close-button') : null;
    if (taskDetailModalCloseButton) {
        taskDetailModalCloseButton.onclick = function() {
            if (taskDetailModal) taskDetailModal.style.display = "none";
        }
    }

    const dateClickConfirmModalElement = document.getElementById('dateClickConfirmModal'); // 変数名を変更して衝突を避ける
    const dateClickConfirmModalClose = dateClickConfirmModalElement ? dateClickConfirmModalElement.querySelector('#dateClickConfirmModalCloseButton') : null;
    const dateClickConfirmModalCancelButton = dateClickConfirmModalElement ? dateClickConfirmModalElement.querySelector('#dateClickConfirmModalCancelButton') : null;

    if(dateClickConfirmModalClose) {
        dateClickConfirmModalClose.onclick = function() {
            if(dateClickConfirmModalElement) dateClickConfirmModalElement.style.display = "none";
        }
    }
    if(dateClickConfirmModalCancelButton) {
        dateClickConfirmModalCancelButton.onclick = function() {
            if(dateClickConfirmModalElement) dateClickConfirmModalElement.style.display = "none";
        }
    }

    window.addEventListener('click', function(event) {
        if (taskDetailModal && event.target == taskDetailModal) {
            taskDetailModal.style.display = "none";
        }
        if (dateClickConfirmModalElement && event.target == dateClickConfirmModalElement) { // 正しい変数を使用
            dateClickConfirmModalElement.style.display = "none";
        }
    });
});