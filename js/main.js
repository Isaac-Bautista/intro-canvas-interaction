const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, image, speed) {
        this.radius = radius;
        this.color = color;
        this.image = image; // Imagen de la burbuja
        this.speed = speed;
        this.score = Math.floor(Math.random() * 16) - 5; // Puntuación aleatoria entre -5 y +10
        
        // Genera las posiciones de los círculos de abajo hacia arriba
        this.posX = Math.max(radius, Math.random() * (window_width - 2 * radius));
        this.posY = window_height + radius;
        
        // Velocidades aleatorias para simular el movimiento de burbujas
        this.dx = (Math.random() - 0.5) * this.speed * 2;
        this.dy = -Math.random() * this.speed;
    }

    draw(context) {
        context.beginPath();
        
        // Dibuja la imagen de la burbuja en lugar de texto
        context.drawImage(this.image, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);

        context.lineWidth = 2;
        context.strokeStyle = this.color;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
        
        // Dibuja la puntuación dentro del círculo
        context.font = "20px Arial";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.fillText(this.score, this.posX, this.posY);
    }

    update(context, circles) {
        this.draw(context);

        // Actualiza la posición de acuerdo a la velocidad
        this.posX += this.dx;
        this.posY += this.dy;

        // Detecta colisiones con las paredes
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        if ((this.posY - this.radius) < 0) {
            // Resta puntos si el círculo toca el borde superior
            this.score -= 1;
            this.posY = window_height + this.radius; // Reposiciona el círculo en la parte inferior
        }

        // Detecta colisiones con otros círculos
        for (let circle of circles) {
            if (circle !== this) {
                let dx = this.posX - circle.posX;
                let dy = this.posY - circle.posY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.radius + circle.radius) {
                    // Si hay colisión, ajusta las posiciones para evitar superposición
                    let overlap = this.radius + circle.radius - distance;
                    let angle = Math.atan2(dy, dx);
                    let moveX = overlap * Math.cos(angle);
                    let moveY = overlap * Math.sin(angle);

                    this.posX += moveX / 2;
                    this.posY += moveY / 2;
                    circle.posX -= moveX / 2;
                    circle.posY -= moveY / 2;

                    // Cambia las direcciones para simular el rebote
                    let tempDx = this.dx;
                    let tempDy = this.dy;
                    this.dx = circle.dx;
                    this.dy = circle.dy;
                    circle.dx = tempDx;
                    circle.dy = tempDy;

                    // Cambia el color del contorno
                    this.color = getRandomColor();
                    circle.color = getRandomColor();
                }
            }
        }
    }
}

// Array global de círculos
let circles = [];

// Función para generar un color aleatorio en formato hexadecimal
function getRandomColor() {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Cargar la imagen de la burbuja
const bubbleImage = new Image();
bubbleImage.src = "burbuja.jpg"; // Ruta relativa de la imagen

// Callback cuando la imagen se carga correctamente
bubbleImage.onload = function() {
    console.log("Imagen de burbuja cargada correctamente.");

    for (let i = 0; i < 10; i++) {
        let randomRadius = Math.floor(Math.random() * 100 + 30);
        let newCircle = new Circle(0, 0, randomRadius, getRandomColor(), bubbleImage, 2);
        circles.push(newCircle);
    }

    let updateCircles = function () {
        requestAnimationFrame(updateCircles);
        ctx.clearRect(0, 0, window_width, window_height);

        for (let circle of circles) {
            circle.update(ctx, circles);
        }
    };

    updateCircles();
};

// Agregar event listener para clics del mouse
canvas.addEventListener("click", function (event) {
    let rect = canvas.getBoundingClientRect(); // Obtener las dimensiones y posición del lienzo
    let mouseX = event.clientX - rect.left; // Ajustar la posición X del clic al lienzo
    let mouseY = event.clientY - rect.top; // Ajustar la posición Y del clic al lienzo

    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        let dx = mouseX - circle.posX;
        let dy = mouseY - circle.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= circle.radius) {
            // Si el clic está dentro del círculo, elimina el círculo del arreglo
            circles.splice(i, 1);
            break; // Salimos del bucle ya que solo queremos interactuar con un círculo a la vez
        }
    }
});
