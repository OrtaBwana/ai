
let canvas, ctx;
let drawing = false;
let currentTool = 'pencil';
let pencilColor = '#000000'; // Color inicial del lápiz
let shapes = []; // Array para almacenar figuras
let selectedShape = null;
let offsetX = 0;
let offsetY = 0;

function initCanvas() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Configura el tamaño del lienzo basado en su tamaño en pantalla
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Dibuja un fondo blanco al iniciar
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Eventos del mouse
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    // Eventos táctiles
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchmove', handleTouchMove);
}


function handleMouseDown(event) {
    const { x, y } = getMousePosition(event);
    handleStartDrawing(x, y);
}

function handleMouseUp() {
    handleStopDrawing();
}

function handleMouseMove(event) {
    const { x, y } = getMousePosition(event);
    handleDrawing(x, y);
}

function handleTouchStart(event) {
    const { x, y } = getTouchPosition(event);
    handleStartDrawing(x, y);
}

function handleTouchEnd() {
    handleStopDrawing();
}

function handleTouchMove(event) {
    const { x, y } = getTouchPosition(event);
    handleDrawing(x, y);
    event.preventDefault(); // Evitar el desplazamiento de la página
}

function handleStartDrawing(x, y) {
    if (currentTool === 'pencil' || currentTool === 'eraser') {
        startDrawing(x, y);
    } else {
        selectedShape = getShapeAtPosition(x, y);
        if (selectedShape) {
            offsetX = x - selectedShape.x;
            offsetY = y - selectedShape.y;
        } else {
            shapes.push({ type: currentTool, x, y });
            drawShape(currentTool, x, y);
        }
    }
}

function handleStopDrawing() {
    if (selectedShape) {
        selectedShape = null;
    }
    stopDrawing();
}

function handleDrawing(x, y) {
    if (drawing) {
        draw(x, y);
    } else if (selectedShape) {
        moveShape(selectedShape, x - offsetX, y - offsetY);
        redrawCanvas();
    }
}

function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

function getTouchPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = event.touches[0];
    return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
    };
}

function startDrawing(x, y) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(x, y) {
    if (!drawing) return;

    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    if (currentTool === 'pencil') {
        ctx.strokeStyle = pencilColor;
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10; // Tamaño del borrador
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function setPencil() {
    currentTool = 'pencil';
    ctx.lineWidth = 1; // Tamaño del lápiz
}

function setEraser() {
    currentTool = 'eraser';
}

function clearCanvas() {
    ctx.fillStyle = '#FFFFFF'; // Color de fondo blanco
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    shapes = []; // Limpiar el array de figuras
}

function setPencilColor(event) {
    pencilColor = event.target.value;
}

function drawShape(shape, x, y) {
    const size = 20;

    ctx.beginPath();
    ctx.strokeStyle = pencilColor;
    ctx.lineWidth = 2;

    if (shape === 'circle') {
        ctx.arc(x, y, size, 0, 2 * Math.PI);
    } else if (shape === 'square') {
        ctx.rect(x - size, y - size, size * 2, size * 2);
    } else if (shape === 'triangle') {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
    }

    ctx.stroke();
}

function getShapeAtPosition(x, y) {
    return shapes.find(shape => {
        const size = 50;
        const dist = Math.sqrt((shape.x - x) ** 2 + (shape.y - y) ** 2);
        return shape.type === 'circle' ? dist <= size :
            shape.type === 'square' ? x >= shape.x - size && x <= shape.x + size &&
                y >= shape.y - size && y <= shape.y + size :
                shape.type === 'triangle' ? pointInTriangle(x, y, shape) : false;
    });
}

function pointInTriangle(x, y, shape) {
    const size = 50;
    const x1 = shape.x;
    const y1 = shape.y - size;
    const x2 = shape.x - size;
    const y2 = shape.y + size;
    const x3 = shape.x + size;
    const y3 = shape.y + size;

    const area = Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
    const area1 = Math.abs((x * (y2 - y3) + x2 * (y3 - y) + x3 * (y - y2)) / 2);
    const area2 = Math.abs((x1 * (y - y3) + x * (y3 - y1) + x3 * (y1 - y)) / 2);
    const area3 = Math.abs((x1 * (y2 - y) + x2 * (y - y1) + x * (y1 - y2)) / 2);

    return (area === area1 + area2 + area3);
}

function moveShape(shape, x, y) {
    shape.x = x;
    shape.y = y;
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    shapes.forEach(shape => {
        drawShape(shape.type, shape.x, shape.y);
    });
}

function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

document.addEventListener('DOMContentLoaded', initCanvas);