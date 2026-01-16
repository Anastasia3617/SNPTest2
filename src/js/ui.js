import { todoList, controls } from '../index';

/**
 * Обновление элементов управления и блоков с информацией
 */
export const updateInterface = () => {
    const { count } = todoList;

    // "Всего"
    controls.spanAll.textContent = count.all;
    controls.progressAll.style.width = count.all > 0 ? '100%' : '0%';
    controls.spanAllPercent.textContent = count.all > 0 ? '100%' : '0%';

    // "Осталось"
    controls.spanActive.textContent = count.active;
    const progressActive =
        count.all > 0 ? Math.round((count.active / count.all) * 100) : 0;
    controls.progressActive.style.width = `${progressActive}%`;
    controls.spanActivePercent.textContent = `${progressActive}%`;

    // "Сделано"
    const completed = count.all - count.active;
    controls.spanCompleted.textContent = completed;
    const progressCompleted =
        count.all > 0 ? Math.round((completed / count.all) * 100) : 0;
    controls.progressCompleted.style.width = `${progressCompleted}%`;
    controls.spanCompletedPercent.textContent = `${progressCompleted}%`;

    // чекбокс "Выделить все задачи"
    controls.labelCheckboxTasks.classList.toggle(
        'button_disabled',
        count.all === 0,
    );
    controls.checkboxTasks.checked = count.all > 0 && count.active === 0;

    // кнопка "Удалить выполненные задачи"
    controls.buttonDeleteCompleted.classList.toggle('hidden', completed === 0);
};
