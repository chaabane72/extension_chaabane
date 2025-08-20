// OLED 1.3" I2C Display Driver for MakeCode
// Basé sur contrôleur SSD1306/SSH1106

namespace OLED {
    let OLED_ADDRESS = 0x3C;
    let _screenWidth = 128;
    let _screenHeight = 64;
    let _x = 0;
    let _y = 0;
    let _buffer: Buffer;

    // Commandes SSD1306
    const SSD1306_DISPLAYOFF = 0xAE;
    const SSD1306_SETDISPLAYCLOCKDIV = 0xD5;
    const SSD1306_SETMULTIPLEX = 0xA8;
    const SSD1306_SETDISPLAYOFFSET = 0xD3;
    const SSD1306_SETSTARTLINE = 0x40;
    const SSD1306_CHARGEPUMP = 0x8D;
    const SSD1306_MEMORYMODE = 0x20;
    const SSD1306_SEGREMAP = 0xA0;
    const SSD1306_COMSCANDEC = 0xC8;
    const SSD1306_SETCOMPINS = 0xDA;
    const SSD1306_SETCONTRAST = 0x81;
    const SSD1306_SETPRECHARGE = 0xD9;
    const SSD1306_SETVCOMDETECT = 0xDB;
    const SSD1306_DISPLAYALLON_RESUME = 0xA4;
    const SSD1306_NORMALDISPLAY = 0xA6;
    const SSD1306_DISPLAYON = 0xAF;
    const SSD1306_COLUMNADDR = 0x21;
    const SSD1306_PAGEADDR = 0x22;

    //% block="initialiser OLED"
    //% weight=100
    export function init(): void {
        _buffer = pins.createBuffer(1024);
        _buffer.fill(0);

        writeCommand(SSD1306_DISPLAYOFF);
        writeCommand(SSD1306_SETDISPLAYCLOCKDIV);
        writeCommand(0x80);
        writeCommand(SSD1306_SETMULTIPLEX);
        writeCommand(0x3F);
        writeCommand(SSD1306_SETDISPLAYOFFSET);
        writeCommand(0x00);
        writeCommand(SSD1306_SETSTARTLINE | 0x00);
        writeCommand(SSD1306_CHARGEPUMP);
        writeCommand(0x14);
        writeCommand(SSD1306_MEMORYMODE);
        writeCommand(0x00);
        writeCommand(SSD1306_SEGREMAP | 0x01);
        writeCommand(SSD1306_COMSCANDEC);
        writeCommand(SSD1306_SETCOMPINS);
        writeCommand(0x12);
        writeCommand(SSD1306_SETCONTRAST);
        writeCommand(0xCF);
        writeCommand(SSD1306_SETPRECHARGE);
        writeCommand(0xF1);
        writeCommand(SSD1306_SETVCOMDETECT);
        writeCommand(0x40);
        writeCommand(SSD1306_DISPLAYALLON_RESUME);
        writeCommand(SSD1306_NORMALDISPLAY);
        writeCommand(SSD1306_DISPLAYON);

        clear();
        update();
    }

    //% block="effacer écran"
    //% weight=90
    export function clear(): void {
        _buffer.fill(0);
        _x = 0;
        _y = 0;
    }

    //% block="mettre à jour affichage"
    //% weight=80
    export function update(): void {
        writeCommand(SSD1306_COLUMNADDR);
        writeCommand(0);
        writeCommand(127);
        writeCommand(SSD1306_PAGEADDR);
        writeCommand(0);
        writeCommand(7);

        let data = pins.createBuffer(_buffer.length + 1);
        data[0] = 0x40;
        for (let i = 0; i < _buffer.length; i++) {
            data[i + 1] = _buffer[i];
        }
        pins.i2cWriteBuffer(OLED_ADDRESS, data);
    }

    //% block="afficher texte %text"
    //% weight=70
    export function showString(text: string): void {
        for (let i = 0; i < text.length; i++) {
            drawChar(text.charAt(i));
        }
        update();
    }

    //% block="positionner curseur x %x y %y"
    //% weight=60
    export function setCursor(x: number, y: number): void {
        _x = x * 6;
        _y = y * 8;
    }

    function drawChar(c: string): void {
        const font: number[][] = [
            [0x00, 0x00, 0x00, 0x00, 0x00], // ' '
            [0x00, 0x00, 0x5F, 0x00, 0x00], // '!'
            [0x00, 0x07, 0x00, 0x07, 0x00], // '"'
            [0x14, 0x7F, 0x14, 0x7F, 0x14], // '#'
            [0x24, 0x2A, 0x7F, 0x2A, 0x12], // '$'
            [0x23, 0x13, 0x08, 0x64, 0x62], // '%'
            [0x36, 0x49, 0x55, 0x22, 0x50], // '&'
            [0x00, 0x05, 0x03, 0x00, 0x00], // '''
            [0x00, 0x1C, 0x22, 0x41, 0x00], // '('
            [0x00, 0x41, 0x22, 0x1C, 0x00], // ')'
            [0x14, 0x08, 0x3E, 0x08, 0x14], // '*'
            [0x08, 0x08, 0x3E, 0x08, 0x08], // '+'
            [0x00, 0x50, 0x30, 0x00, 0x00], // ','
            [0x08, 0x08, 0x08, 0x08, 0x08], // '-'
            [0x00, 0x60, 0x60, 0x00, 0x00], // '.'
            [0x20, 0x10, 0x08, 0x04, 0x02], // '/'
            [0x3E, 0x51, 0x49, 0x45, 0x3E], // '0'
            [0x00, 0x42, 0x7F, 0x40, 0x00], // '1'
            [0x42, 0x61, 0x51, 0x49, 0x46], // '2'
            [0x21, 0x41, 0x45, 0x4B, 0x31], // '3'
            [0x18, 0x14, 0x12, 0x7F, 0x10], // '4'
            [0x27, 0x45, 0x45, 0x45, 0x39], // '5'
            [0x3C, 0x4A, 0x49, 0x49, 0x30], // '6'
            [0x01, 0x71, 0x09, 0x05, 0x03], // '7'
            [0x36, 0x49, 0x49, 0x49, 0x36], // '8'
            [0x06, 0x49, 0x49, 0x29, 0x1E], // '9'
            [0x00, 0x36, 0x36, 0x00, 0x00], // ':'
            [0x00, 0x56, 0x36, 0x00, 0x00], // ';'
            [0x08, 0x14, 0x22, 0x41, 0x00], // '<'
            [0x14, 0x14, 0x14, 0x14, 0x14], // '='
            [0x00, 0x41, 0x22, 0x14, 0x08], // '>'
            [0x02, 0x01, 0x51, 0x09, 0x06], // '?'
            [0x32, 0x49, 0x79, 0x41, 0x3E], // '@'
            [0x7E, 0x11, 0x11, 0x11, 0x7E], // 'A'
            [0x7F, 0x49, 0x49, 0x49, 0x36], // 'B'
            [0x3E, 0x41, 0x41, 0x41, 0x22], // 'C'
            [0x7F, 0x41, 0x41, 0x22, 0x1C], // 'D'
            [0x7F, 0x49, 0x49, 0x49, 0x41], // 'E'
            [0x7F, 0x09, 0x09, 0x09, 0x01], // 'F'
            [0x3E, 0x41, 0x49, 0x49, 0x7A], // 'G'
            [0x7F, 0x08, 0x08, 0x08, 0x7F], // 'H'
            [0x00, 0x41, 0x7F, 0x41, 0x00], // 'I'
            [0x20, 0x40, 0x41, 0x3F, 0x01], // 'J'
            [0x7F, 0x08, 0x14, 0x22, 0x41], // 'K'
            [0x7F, 0x40, 0x40, 0x40, 0x40], // 'L'
            [0x7F, 0x02, 0x0C, 0x02, 0x7F], // 'M'
            [0x7F, 0x04, 0x08, 0x10, 0x7F], // 'N'
            [0x3E, 0x41, 0x41, 0x41, 0x3E], // 'O'
            [0x7F, 0x09, 0x09, 0x09, 0x06], // 'P'
            [0x3E, 0x41, 0x51, 0x21, 0x5E], // 'Q'
            [0x7F, 0x09, 0x19, 0x29, 0x46], // 'R'
            [0x46, 0x49, 0x49, 0x49, 0x31], // 'S'
            [0x01, 0x01, 0x7F, 0x01, 0x01], // 'T'
            [0x3F, 0x40, 0x40, 0x40, 0x3F], // 'U'
            [0x1F, 0x20, 0x40, 0x20, 0x1F], // 'V'
            [0x3F, 0x40, 0x38, 0x40, 0x3F], // 'W'
            [0x63, 0x14, 0x08, 0x14, 0x63], // 'X'
            [0x07, 0x08, 0x70, 0x08, 0x07], // 'Y'
            [0x61, 0x51, 0x49, 0x45, 0x43]  // 'Z'
        ];

        let charCode = c.charCodeAt(0);
        if (charCode < 32 || charCode > 90) charCode = 32;

        let lines = font[charCode - 32];

        for (let i = 0; i < 5; i++) {
            let line = lines[i];
            for (let j = 0; j < 8; j++) {
                let pixel = (line >> j) & 0x01;
                drawPixel(_x + i, _y + j, pixel);
            }
        }
        _x += 6;
    }

    function drawPixel(x: number, y: number, color: number): void {
        if (x < 0 || x >= 128 || y < 0 || y >= 64) return;

        let page = Math.idiv(y, 8);
        let bit = y % 8;
        let index = x + page * 128;

        if (color) {
            _buffer[index] |= (1 << bit);
        } else {
            _buffer[index] &= ~(1 << bit);
        }
    }

    function writeCommand(cmd: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = 0x00;
        buf[1] = cmd;
        pins.i2cWriteBuffer(OLED_ADDRESS, buf);
    }
}
