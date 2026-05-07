const SHAPES = {
    square: {
        name: 'Квадрат',
        parameters: [
            { name: 'side', label: 'Сторона a'}
        ],
        calculate: (values) => {
            const A = Number(values.side);
            return {
                AREA: A * A,
                PERIMETER: 4 * A
            };
        }
    },
    rectangle: {
        name: 'Прямоугольник',
        parameters: [
            { name: 'width', label: 'Ширина a'},
            { name: 'height', label: 'Высота b'}
        ],
        calculate: (values) => {
            const A = Number(values.width);
            const B = Number(values.height);
            return {
                AREA: A * B,
                PERIMETER: 2 * (A + B)
            };
        }
    },
    circle: {
        name: 'Круг',
        parameters: [
            { name: 'radius', label: 'Радиус r'}
        ],
        calculate: (values) => {
            const R = Number(values.radius);
            return {
                AREA: Math.PI * R * R,
                PERIMETER: 2 * Math.PI * R
            };
        }
    },
    triangle: {
        name: 'Треугольник',
        parameters: [
            { name: 'sideA', label: 'Сторона a'},
            { name: 'sideB', label: 'Сторона b'},
            { name: 'sideC', label: 'Сторона c'}
        ],
        calculate: (values) => {
            const A = Number(values.sideA);
            const B = Number(values.sideB);
            const C = Number(values.sideC);

            if (A * 1 + B * 1 <= C * 1 || A * 1 + C * 1 <= B * 1 
                    || B * 1 + C * 1 <= A * 1) {
                throw new Error('Треугольник с такими сторонами не существует');
            }

            const PERIMETER = Number(A + B + C); 
            const P = Number(PERIMETER / 2);
            const AREA = Number(Math.sqrt(P * (P - A) * (P - B)
                    * (P - C)));
            return { AREA, PERIMETER };
        }
    }
};

const Select = document.getElementById('Select');
const ParamsContainer = document.getElementById('paramsContainer');
const CalculateBtn = document.getElementById('calculateBtn');
const ClearBtn = document.getElementById('clearBtn');
const TableBody = document.getElementById('tableBody');
const MessageDiv = document.getElementById('message');

let currentShape = 'square';

/**
 * Обновляет поля ввода в зависимости от выбранной фигуры.
 */
function updateParams() {
    currentShape = Select.value;
    const SHAPE = SHAPES[currentShape];
    let html = '';
    SHAPE.parameters.forEach(parameter => {
        html +=`
            <div>
                <label>${parameter.label}:</label>
                <input type="number" id="${parameter.name}" required placeholder
                ="Введите число">
            </div>
        `;
    });
    ParamsContainer.innerHTML = html;
}

/**
 * Считывает значения полей ввода для текущей фигуры.
 * @returns {{ VALUES: Object, isValid: boolean }} Объект со значениями и флагом
 *  валидности.
 */
function getParametersValues() {
    const SHAPE = SHAPES[currentShape];
    const VALUES = {};
    let isValid = true;
    SHAPE.parameters.forEach(parameter => {
        const INPUT = document.getElementById(parameter.name);
        const VAL = INPUT.value;
        (isNaN(VAL) || VAL <= 0)? isValid = false : VALUES[parameter.name] = VAL;   
    });
    return { VALUES, isValid };
}

/**
 * Округляет число до двух знаков после запятой.
 * @param {number} num - Исходное число.
 * @returns {number} Округлённое число.
 */
function formatNumber(num) {
    const ROUND = 10;
    return Math.round(num * ROUND) / ROUND;
}

/**
 * Добавляет запись в таблицу результатов.
 * @param {string} shapeName - Название фигуры.
 * @param {string} paramsStr - Строка с параметрами.
 * @param {number} area - Площадь.
 * @param {number} perimeter - Периметр.
 */
function addResultToTable(shapeName, paramsStr, area, perimeter) {
    const ROW = document.createElement('tr');
    ROW.innerHTML = `
        <td>${shapeName}</td>
        <td>${paramsStr}</td>
        <td>${formatNumber(area)}</td>
        <td>${formatNumber(perimeter)}</td>
    `;
    TableBody.append(ROW);
}

/**
 * Проверяет, существует ли уже в таблице запись с такими же фигурой и
 * параметрами.
 * @param {string} name - Название фигуры.
 * @param {number} area - Площадь.
 * @param {number} perimeter - Периметр.
 * @returns {boolean} true, если дубликат найден, иначе false.
 */
function isDuplicate(name, area, perimeter) {
    const ROWS = TableBody.querySelectorAll('tr');
    for (const ROW of ROWS) {
        const Cells = ROW.cells;
        if (Cells) {
            const ExistingParams = Cells[0].textContent;
            const ExistingParams2 = Number(Cells[2].textContent);
            const ExistingParams3 = Number(Cells[3].textContent);
            if (ExistingParams === name && ExistingParams2 === area
                    && ExistingParams3 === perimeter) {
                throw new Error('Этот результат уже есть в таблице.');
            }
        }
    }
    return false;
}

/**
 * Добавляет результат расчёта в таблицу.
 */
function calculate() {
    const { VALUES, isValid } = getParametersValues();
    if (!isValid) {
        MessageDiv.innerHTML = '<div class="error"> Заполните все поля корректно\n\
            (положительные числа).</div>';
        return;
    }
 
    const SHAPE = SHAPES[currentShape];
    try {
        const Result = SHAPE.calculate(VALUES);

        let paramsStr = '';
        if (currentShape === 'square') {
            paramsStr = `a = ${VALUES.side}`;
        } else if (currentShape === 'rectangle') {
            paramsStr = `a = ${VALUES.width}, b = ${VALUES.height}`;
        } else if (currentShape === 'circle') {
            paramsStr = `r = ${VALUES.radius}`;
        } else if (currentShape === 'triangle') {
            paramsStr = `a = ${VALUES.sideA}, b = ${VALUES.sideB}, c = ${VALUES.sideC}`;
        }
        isDuplicate(SHAPE.name, Result.AREA, Result.PERIMETER);
        addResultToTable(SHAPE.name, paramsStr, Result.AREA, Result.PERIMETER);
        MessageDiv.innerHTML = '<div class="success"> Результат добавлен в таблицу.</div>';
    } catch (error) {
        MessageDiv.innerHTML = `<div class="error"> ${error.message}</div>`;
    }
}

/**
 * Очищает таблицу 
 */
function clearTable() {
    TableBody.innerHTML = '';
    MessageDiv.innerHTML = '<div class="success">️Таблица пуста.</div>';
}

Select.addEventListener('click', updateParams);
CalculateBtn.addEventListener('click', calculate);
ClearBtn.addEventListener('click', clearTable);

updateParams();
