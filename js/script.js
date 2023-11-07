// Get the canvas element and its 2d rendering context
const canvas = document.getElementById("calculator");
const ctx = canvas.getContext("2d");

// Define button dimensions
const buttonWidth = 80;
const buttonHeight = 80;

// Set the canvas width and height based on the button layout
canvas.width = 5 * buttonWidth;
canvas.height = 5 * buttonHeight + 80;

// Define the text for buttons
const buttons = [
    "", "", "", "%", "/", 
    "(", "7", "8", "9", "X",
    ")", "4", "5", "6", "-",
    "Back", "1", "2", "3", "+",
    "0", ".", "=",
];

// Initialize the expression
let expression = "";

// Function to draw a button with specified text and width
function drawButton(x, y, text, width = buttonWidth) {
    ctx.fillStyle = "black";
    if (x >= 4 * buttonWidth) {
        ctx.fillStyle = "#ff9e0b";
    }
    else if (y === 80) {
        ctx.fillStyle = "#5f6065";
    }
    else {
        ctx.fillStyle = "#777a7e";
    }

    // Fill the button with a colored background
    ctx.fillRect(x, y, width, buttonHeight);

    // Draw a border for the button
    ctx.strokeStyle = "#4d5052"; // Set border color to #4d5052
    ctx.lineWidth = 2; // Set border width
    ctx.strokeRect(x, y, width, buttonHeight);
    
    // Set the text color to white
    ctx.fillStyle = "#fff";

    // Set the font for button text
    ctx.font = "24px Arial";

    // Calculate the text width for centering
    const textWidth = ctx.measureText(text).width;

    // Calculate the text position for horizontal centering
    const textX = x + (width - textWidth) / 2;
    // Calculate the text position for vertical centering
    const textY = y + buttonHeight / 1.5 + 6;

    // Draw the button text
    ctx.fillText(text, textX, textY);
}

// Function to draw the calculator interface
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

        // Draw the button
        drawButton(x, y, buttons[i], adjustedButtonWidth);
    }

    // Draw the expression output
    draw_output();
}

// Function to draw the expression output
function draw_output() {
    ctx.fillStyle = "#4d5052"; // Set the background color
    ctx.fillRect(0, 0, canvas.width, 80);

    // Set the text color to white
    ctx.fillStyle = "#fff";

    // Set the font for expression output
    ctx.font = "36px Arial";

    // Set text alignment to right
    ctx.textAlign = "right";

    // Calculate the starting position for text
    let a = canvas.width - 20;
    let b = 50;

    // Adjust font and position if expression contains multiple lines
    if (expression.includes("\n")){
        b = 30;
        ctx.font = "24px Arial";
    }

    // Split the expression into lines
    const lines = expression.split("\n");

    for (let i = 0; i < lines.length; i++) {
        if (i === 1){
            ctx.font = "36px Arial";
        }

        // Draw each line of the expression
        ctx.fillText(lines[i], a, b + i * 40);
    }

    // Reset text alignment
    ctx.textAlign = "left";
}

// Add click event listener for button interaction
canvas.addEventListener("click", (event) => {
    const x = event.clientX - canvas.getBoundingClientRect().left;
    const y = event.clientY - canvas.getBoundingClientRect().top;

    if (expression.includes("\n")) {
        expression = expression.split("\n").slice(-1)[0];
    }
    else if (expression.includes("Invalid Expression")){
        expression = "";
    }

    if (y >= 80) {
        const row = Math.floor((y - 80) / buttonHeight);
        const col = Math.floor(x / buttonWidth);

        let buttonText = "";

        if (row === 4) {
            if (col < 3) {
                buttonText = "0";
            } else if (col === 3) {
                buttonText = ".";
            } else if (col === 4) {
                buttonText = "=";
            }
        } else {
            buttonText = buttons[row * 5 + col];
        }

        if (buttonText === "=") {
            evalExpression();
        } 
        else if (buttonText === "Back") {
            if (expression.includes("Invalid Expression")){
                expression = "";
            }
            else if(expression.includes("\n")){
                expression = expression.split("\n")[0];
            }
            else{
                expression = expression.slice(0, -1);
            }
        }
        else if (buttonText === "X"){
            expression += "*";
        } 
        else {
            expression += buttonText;
        }
        draw_output();
    }
});

function evaluateExpression(expression) {
    const operators = [];
    const values = [];

    const precedence = {
        "+": 1,
        "-": 1,
        "*": 2,
        "/": 2,
        "%": 2,
    };

    function applyOperator() {
        const operator = operators.pop();
        const right = values.pop();
        const left = values.pop();
        values.push(performOperation(left, operator, right));
    }

    function performOperation(left, operator, right) {
        switch (operator) {
            case "+":
                return left + right;
            case "-":
                return left - right;
            case "*":
                return left * right;
            case "/":
                if (right === 0) {
                    throw new Error("Division by zero");
                }
                return left / right;
            case "%":
                if (right === 0) {
                    throw new Error("Modulo by zero");
                }
                return left % right;
            default:
                return null;
        }
    }

    for (const token of expression.match(/(\d+(\.\d+)?)|([\+\-\*\/%()])/g)) {
        if (/(\d+(\.\d+)?)/.test(token)) {
            values.push(parseFloat(token));
        } else if (token in precedence) {
            const currentPrecedence = precedence[token];
            while (
                operators.length > 0 &&
                operators[operators.length - 1] !== "(" &&
                precedence[operators[operators.length - 1]] >= currentPrecedence
            ) {
                applyOperator();
            }
            operators.push(token);
        } else if (token === "(") {
            operators.push(token);
        } else if (token === ")") {
            while (operators.length > 0 && operators[operators.length - 1] !== "(") {
                applyOperator();
            }
            if (operators.length === 0 || operators[operators.length - 1] !== "(") {
                throw new Error("Unmatched parentheses");
            }
            operators.pop(); // Remove the "("
        }
    }

    while (operators.length > 0) {
        applyOperator();
    }

    if (values.length !== 1 || typeof values[0] !== "number") {
        throw new Error("Invalid Expression");
    }

    return values[0];
}



// Function to evaluate the expression
function evalExpression() {
    try {
        const result = evaluateExpression(expression);
        expression = expression + "\n" + result.toString();
    } catch (error) {
        expression = "Invalid Expression";
    }
    draw_output();
}

// Initial rendering of the calculator
draw();
