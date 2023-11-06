const canvas = document.getElementById("calculator");
const ctx = canvas.getContext("2d");

const buttonWidth = 80;
const buttonHeight = 80;

canvas.width = 5 * buttonWidth;
canvas.height = 5 * buttonHeight + 80;

const buttons = [
    "", "", "", "%", "/", 
    "(", "7", "8", "9", "*",
    ")", "4", "5", "6", "-",
    "Back", "1", "2", "3", "+",
    "0", ".", "=",
];

let expression = "";

function drawButton(x, y, text, width = buttonWidth) {
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(x, y, width, buttonHeight);
    ctx.fillStyle = "#000";
    ctx.font = "24px Arial";
    
    // Calculate the text width for centering
    const textWidth = ctx.measureText(text).width;

    // Calculate the text position for horizontal centering
    const textX = x + (width - textWidth) / 2;
    // Calculate the text position for vertical centering
    const textY = y + buttonHeight / 1.5 + 6;

    ctx.fillText(text, textX, textY);
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < buttons.length; i++) {
        const row = Math.floor(i / 5);
        const col = i % 5;
        let x = col * buttonWidth;
        let y = 80 + row * buttonHeight;

        let adjustedButtonWidth = buttonWidth;

        if (buttons[i] === "0" && row === 4) {
            adjustedButtonWidth = buttonWidth * 3;
        }
        else if (buttons[i] === "." && row === 4) {
            x = 3 * buttonWidth;
        }
        else if (buttons[i] === "=" && row === 4) {
            x = 4 * buttonWidth;
        }
        drawButton(x, y, buttons[i], adjustedButtonWidth);
    }

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillStyle = "#000";
    ctx.font = "36px Arial";
    ctx.fillText(expression, 20, 50);
}

canvas.addEventListener("click", (event) => {
    const x = event.clientX - canvas.getBoundingClientRect().left;
    const y = event.clientY - canvas.getBoundingClientRect().top;

    if (y >= 80) {
        const buttonIndex = Math.floor(x / buttonWidth) + Math.floor((y - 80) / buttonHeight) * 5;
        const buttonText = buttons[buttonIndex];
        if (buttonText === "=") {
            evalExpression();
        } else if (buttonText === "Back") {
            expression = expression.slice(0, -1);
        } else {
            expression += buttonText;
        }
        draw();
    }
});

function evalExpression() {
    try {
        let exp = expression.replace("x", "*");
        const result = eval(exp);
        expression = result.toString();
    } catch (error) {
        expression = "Invalid Expression";
    }
    draw();
}

draw();
