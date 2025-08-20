// OLED 1.3" I2C Display Driver for MakeCode
// Based on SSD1306/SSH1106 controller

namespace OLED {
    // OLED I2C address
    let OLED_ADDRESS = 0x3C;
    let _screenWidth = 128;
    let _screenHeight = 64;
    let _fontSize = 1;
    let _x = 0;
    let _y = 0;
    let _invert = false;

    // Command constants
    const SET_CONTRAST = 0x81;
    const SET_ENTIRE_ON = 0xA4;
    const SET_NORM_INV = 0xA6;
    const SET_DISP = 0xAE;
    const SET_MEM_ADDR = 0x20;
    const SET_COL_ADDR = 0x21;
    const SET_PAGE_ADDR = 0x22;
    const SET_DISP_START_LINE = 0x40;
    const SET_SEG_REMAP = 0xA0;
    const SET_MUX_RATIO = 0xA8;
    const SET_COM_OUT_DIR = 0xC0;
    const SET_DISP_OFFSET = 0xD3;
    const SET_COM_PIN_CFG = 0xDA;
    const SET_DISP_CLK_DIV = 0xD5;
    const SET_PRECHARGE = 0xD9;
    const SET_VCOM_DESEL = 0xDB;
    const SET_CHARGE_PUMP = 0x8D;

    // Buffer for the display
    let _screenBuffer: Buffer;

    /**
     * Initialize the OLED display
     * @param width screen width, eg: 128
     * @param height screen height, eg: 64
     */
    //% block="initialize OLED width %width height %height"
    //% weight=100
    export function init(width: number = 128, height: number = 64): void {
        _screenWidth = width;
        _screenHeight = height;
        _screenBuffer = pins.createBuffer(_screenWidth * _screenHeight / 8);
        _screenBuffer.fill(0);

        // Initialize the display
        writeCommand(SET_DISP | 0x00); // display off

        writeCommand(SET_DISP_CLK_DIV);
        writeCommand(0x80);

        writeCommand(SET_MUX_RATIO);
        writeCommand(_screenHeight - 1);

        writeCommand(SET_DISP_OFFSET);
        writeCommand(0x00);

        writeCommand(SET_DISP_START_LINE | 0x00);

        writeCommand(SET_CHARGE_PUMP);
        writeCommand(0x14);

        writeCommand(SET_MEM_ADDR);
        writeCommand(0x00); // horizontal addressing mode

        writeCommand(SET_SEG_REMAP | 0x01);
        writeCommand(SET_COM_OUT_DIR | 0x08);

        writeCommand(SET_COM_PIN_CFG);
        writeCommand(_screenHeight == 32 ? 0x02 : 0x12);

        writeCommand(SET_CONTRAST);
        writeCommand(0xCF);

        writeCommand(SET_PRECHARGE);
        writeCommand(0xF1);

        writeCommand(SET_VCOM_DESEL);
        writeCommand(0x40);

        writeCommand(SET_ENTIRE_ON);
        writeCommand(SET_NORM_INV);

        writeCommand(SET_DISP | 0x01); // display on

        clear();
        update();
    }

    /**
     * Clear the display buffer
     */
    //% block="clear display"
    //% weight=90
    export function clear(): void {
        _screenBuffer.fill(0);
        _x = 0;
        _y = 0;
    }

    /**
     * Update the display with the buffer content
     */
    //% block="update display"
    //% weight=80
    export function update(): void {
        writeCommand(SET_COL_ADDR);
        writeCommand(0);
        writeCommand(_screenWidth - 1);
        writeCommand(SET_PAGE_ADDR);
        writeCommand(0);
        writeCommand((_screenHeight / 8) - 1);

        let data = pins.createBuffer(_screenBuffer.length + 1);
        data[0] = 0x40; // Data mode
        for (let i = 0; i < _screenBuffer.length; i++) {
            data[i + 1] = _screenBuffer[i];
        }
        pins.i2cWriteBuffer(OLED_ADDRESS, data);
    }

    /**
     * Draw a pixel at specified coordinates
     * @param x X coordinate
     * @param y Y coordinate
     * @param color Pixel color (0=off, 1=on)
     */
    //% block="draw pixel at x %x y %y color %color"
    //% weight=70
    export function drawPixel(x: number, y: number, color: number): void {
        if (x < 0 || x >= _screenWidth || y < 0 || y >= _screenHeight) return;

        let page = Math.floor(y / 8);
        let bit = y % 8;
        let index = x + page * _screenWidth;

        if (color) {
            _screenBuffer[index] |= (1 << bit);
        } else {
            _screenBuffer[index] &= ~(1 << bit);
        }
    }

    /**
     * Draw a line between two points
     * @param x0 Start X
     * @param y0 Start Y
     * @param x1 End X
     * @param y1 End Y
     * @param color Line color
     */
    //% block="draw line from x %x0 y %y0 to x %x1 y %y1 color %color"
    //% weight=60
    export function drawLine(x0: number, y0: number, x1: number, y1: number, color: number): void {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            drawPixel(x0, y0, color);
            if (x0 === x1 && y0 === y1) break;
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    /**
     * Draw a rectangle
     * @param x X coordinate
     * @param y Y coordinate
     * @param width Width
     * @param height Height
     * @param color Color
     * @param filled Filled rectangle
     */
    //% block="draw rectangle x %x y %y width %width height %height color %color filled %filled"
    //% weight=50
    export function drawRectangle(x: number, y: number, width: number, height: number, color: number, filled: boolean = false): void {
        if (filled) {
            for (let i = x; i < x + width; i++) {
                for (let j = y; j < y + height; j++) {
                    drawPixel(i, j, color);
                }
            }
        } else {
            drawLine(x, y, x + width - 1, y, color);
            drawLine(x, y + height - 1, x + width - 1, y + height - 1, color);
            drawLine(x, y, x, y + height - 1, color);
            drawLine(x + width - 1, y, x + width - 1, y + height - 1, color);
        }
    }

    /**
     * Draw a circle
     * @param x Center X
     * @param y Center Y
     * @param radius Radius
     * @param color Color
     * @param filled Filled circle
     */
    //% block="draw circle x %x y %y radius %radius color %color filled %filled"
    //% weight=40
    export function drawCircle(x: number, y: number, radius: number, color: number, filled: boolean = false): void {
        let f = 1 - radius;
        let ddF_x = 1;
        let ddF_y = -2 * radius;
        let x0 = 0;
        let y0 = radius;

        drawPixel(x, y + radius, color);
        drawPixel(x, y - radius, color);
        drawPixel(x + radius, y, color);
        drawPixel(x - radius, y, color);

        if (filled) {
            drawLine(x - radius, y, x + radius, y, color);
        }

        while (x0 < y0) {
            if (f >= 0) {
                y0--;
                ddF_y += 2;
                f += ddF_y;
            }
            x0++;
            ddF_x += 2;
            f += ddF_x;

            if (filled) {
                drawLine(x - x0, y + y0, x + x0, y + y0, color);
                drawLine(x - x0, y - y0, x + x0, y - y0, color);
                drawLine(x - y0, y + x0, x + y0, y + x0, color);
                drawLine(x - y0, y - x0, x + y0, y - x0, color);
            } else {
                drawPixel(x + x0, y + y0, color);
                drawPixel(x - x0, y + y0, color);
                drawPixel(x + x0, y - y0, color);
                drawPixel(x - x0, y - y0, color);
                drawPixel(x + y0, y + x0, color);
                drawPixel(x - y0, y + x0, color);
                drawPixel(x + y0, y - x0, color);
                drawPixel(x - y0, y - x0, color);
            }
        }
    }

    /**
     * Display text at current position
     * @param text Text to display
     */
    //% block="show text %text"
    //% weight=30
    export function showString(text: string): void {
        for (let i = 0; i < text.length; i++) {
            drawChar(text.charAt(i));
        }
    }

    /**
     * Set cursor position
     * @param x X position
     * @param y Y position (0-7 for 8 rows of text)
     */
    //% block="set cursor x %x y %y"
    //% weight=20
    export function setCursor(x: number, y: number): void {
        _x = x;
        _y = y * 8; // Convert text row to pixel row
    }

    /**
     * Invert display colors
     * @param invert true to invert, false for normal
     */
    //% block="invert display %invert"
    //% weight=10
    export function invertDisplay(invert: boolean): void {
        _invert = invert;
        writeCommand(SET_NORM_INV | (invert ? 1 : 0));
    }

    function drawChar(char: string): void {
        // Simple 5x8 font implementation
        // This is a basic implementation - you might want to use a proper font
        const font: number[] = [
            // Basic ASCII characters (simplified)
            0x00, 0x00, 0x00, 0x00, 0x00, // space
            // Add more characters as needed
        ];

        let charCode = char.charCodeAt(0);
        if (charCode < 32 || charCode > 126) charCode = 32; // Default to space

        for (let i = 0; i < 5; i++) {
            let line = 0xFF; // Default pattern (simplified)
            for (let j = 0; j < 8; j++) {
                if (line & (1 << j)) {
                    drawPixel(_x + i, _y + j, 1);
                } else {
                    drawPixel(_x + i, _y + j, 0);
                }
            }
        }
        _x += 6;
        if (_x > _screenWidth - 6) {
            _x = 0;
            _y += 8;
        }
    }

    function writeCommand(cmd: number): void {
        let buffer = pins.createBuffer(2);
        buffer[0] = 0x80; // Command mode
        buffer[1] = cmd;
        pins.i2cWriteBuffer(OLED_ADDRESS, buffer);
    }

    function writeData(data: number): void {
        let buffer = pins.createBuffer(2);
        buffer[0] = 0x40; // Data mode
        buffer[1] = data;
        pins.i2cWriteBuffer(OLED_ADDRESS, buffer);
    }
}