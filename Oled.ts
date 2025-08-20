// OLED 1.3" I2C Display Driver for MakeCode avec police ASCII 5x8
namespace OLED {
    let OLED_ADDRESS = 0x3C;
    let _x = 0;
    let _y = 0;
    let _buffer: Buffer;

    // Table ASCII 5x8 (extrait simplifié pour démonstration)
    const font: number[][] = [
        [0x00, 0x00, 0x00, 0x00, 0x00], // espace
        [0x00, 0x00, 0x5F, 0x00, 0x00], // !
        [0x00, 0x07, 0x00, 0x07, 0x00], // "
        [0x14, 0x7F, 0x14, 0x7F, 0x14], // #
        [0x24, 0x2A, 0x7F, 0x2A, 0x12], // $
        [0x23, 0x13, 0x08, 0x64, 0x62], // %
        [0x36, 0x49, 0x55, 0x22, 0x50], // &
        [0x00, 0x05, 0x03, 0x00, 0x00], // '
        [0x00, 0x1C, 0x22, 0x41, 0x00], // (
        [0x00, 0x41, 0x22, 0x1C, 0x00], // )
        [0x14, 0x08, 0x3E, 0x08, 0x14], // *
        [0x08, 0x08, 0x3E, 0x08, 0x08], // +
        [0x00, 0x50, 0x30, 0x00, 0x00], // ,
        [0x08, 0x08, 0x08, 0x08, 0x08], // -
        [0x00, 0x60, 0x60, 0x00, 0x00], // .
        [0x20, 0x10, 0x08, 0x04, 0x02], // /
        // ... ajoute plus tard jusqu'à ~ (code ASCII 126)
    ];

    //% block="initialiser OLED"
    export function init(): void {
        _buffer = pins.createBuffer(1024); // 128x64 / 8
        _buffer.fill(0);
        writeCommand(0xAE); // display off
        writeCommand(0x20); writeCommand(0x00); // horizontal mode
        writeCommand(0xA1); // segment remap
        writeCommand(0xC8); // COM output scan
        writeCommand(0xDA); writeCommand(0x12);
        writeCommand(0x81); writeCommand(0xCF);
        writeCommand(0xA4);
        writeCommand(0xA6);
        writeCommand(0xD5); writeCommand(0x80);
        writeCommand(0x8D); writeCommand(0x14);
        writeCommand(0xAF); // display ON
        clear();
        update();
    }

    //% block="effacer écran"
    export function clear(): void {
        _buffer.fill(0);
        _x = 0;
        _y = 0;
    }

    //% block="mettre à jour l'affichage"
    export function update(): void {
        writeCommand(0x21); writeCommand(0); writeCommand(127);
        writeCommand(0x22); writeCommand(0); writeCommand(7);
        let data = pins.createBuffer(_buffer.length + 1);
        data[0] = 0x40;
        for (let i = 0; i < _buffer.length; i++) {
            data[i + 1] = _buffer[i];
        }
        pins.i2cWriteBuffer(OLED_ADDRESS, data);
    }

    //% block="afficher texte %text"
    export function showString(text: string): void {
        for (let i = 0; i < text.length; i++) {
            drawChar(text.charAt(i));
        }
        update();
    }

    //% block="position curseur x %x y %y"
    export function setCursor(x: number, y: number): void {
        _x = x * 6;
        _y = y * 8;
    }

    function drawChar(c: string): void {
        if (_x > 122) {
            _x = 0;
            _y += 8;
        }

        let code = c.charCodeAt(0);
        if (code < 32 || code > 126) code = 32;
        let charData = font[code - 32];

        for (let i = 0; i < 5; i++) {
            let line = charData[i];
            for (let j = 0; j < 8; j++) {
                drawPixel(_x + i, _y + j, (line >> j) & 1);
            }
        }
        _x += 6;
    }

    function drawPixel(x: number, y: number, color: number): void {
        if (x < 0 || x >= 128 || y < 0 || y >= 64) return;
        let page = Math.idiv(y, 8);
        let bit = y % 8;
        let index = x + page * 128;
        if (color) _buffer[index] |= (1 << bit);
        else _buffer[index] &= ~(1 << bit);
    }

    function writeCommand(cmd: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = 0x00;
        buf[1] = cmd;
        pins.i2cWriteBuffer(OLED_ADDRESS, buf);
    }
}
