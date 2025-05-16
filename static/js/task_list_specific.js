// static/js/task_list_specific.js
document.addEventListener('DOMContentLoaded', function() {
    // タスクリストの開閉機能 (未完了・完了済み共通化)
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(header => {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.toggle-icon');

        if (header.textContent.includes('未完了のタスク') && content) {
            if (icon) icon.textContent = '-';
        } else if (content) {
            content.style.display = "none";
            if (icon) icon.textContent = '+';
        }

        header.addEventListener('click', function() {
            if (content) {
                const isHidden = content.style.display === "none" || content.style.display === "";
                content.style.display = isHidden ? "block" : "none";
                if (icon) icon.textContent = isHidden ? '-' : '+';
            }
        });
    });

    var calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const initialSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        const body = document.body;

        // サイドバーの初期状態をbodyクラスにまず適用
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
            height: 'auto',
            // windowResizeDelay: 250, // 必要であれば調整
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
                const calendarContainer = document.getElementById('calendar');
                if (isLoading) {
                    if (calendarContainer) calendarContainer.classList.add('calendar-loading');
                } else {
                    if (calendarContainer) calendarContainer.classList.remove('calendar-loading');
                }
            },
            viewDidMount: function(info) {
                if (window.myCalendar && window.myCalendar.updateSize) {
                    // 二重のrequestAnimationFrameで、より描画が安定するのを待つ
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            console.log("viewDidMount: Forcing FullCalendar updateSize via double requestAnimationFrame.");
                            window.myCalendar.updateSize();
                        });
                    });
                }
            }
        });

        window.myCalendar.render();
        console.log("FullCalendar rendered (task_list_specific.js)");

        // DOMContentLoaded直後の遅延実行 - 遅延を200msに
        setTimeout(() => {
            if (window.myCalendar && window.myCalendar.updateSize) {
                console.log("DOMContentLoaded: Forcing FullCalendar updateSize after short delay (200ms).");
                window.myCalendar.updateSize();
            }
        }, 200); // 150ms -> 200ms (前回のユーザー提供コードは150msだったので、ここを最終調整案に合わせる)

        // window.onload を使って、すべてのリソース読み込み後に再度リサイズ - 遅延を300msに
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (window.myCalendar && window.myCalendar.updateSize) {
                    console.log("window.onload: Forcing FullCalendar updateSize after longer delay (300ms).");
                    window.myCalendar.updateSize();
                }
            }, 300); // 250ms -> 300ms (前回のユーザー提供コードは250msだったので、ここを最終調整案に合わせる)
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