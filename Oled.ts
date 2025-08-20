// OLED 1.3" I2C Display Driver for MakeCode - CORRIGÉ
// Basé sur contrôleur SSD1306/SSH1106

namespace OLED {
    // Adresse I2C - ESSAYEZ LES DEUX !
    let OLED_ADDRESS = 0x3C;
    // let OLED_ADDRESS = 0x3D; // Décommentez si 0x3C ne marche pas

    let _screenWidth = 128;
    let _screenHeight = 64;
    let _x = 0;
    let _y = 0;

    // Commandes
    const SSD1306_SETCONTRAST = 0x81;
    const SSD1306_DISPLAYALLON_RESUME = 0xA4;
    const SSD1306_DISPLAYALLON = 0xA5;
    const SSD1306_NORMALDISPLAY = 0xA6;
    const SSD1306_INVERTDISPLAY = 0xA7;
    const SSD1306_DISPLAYOFF = 0xAE;
    const SSD1306_DISPLAYON = 0xAF;
    const SSD1306_SETDISPLAYOFFSET = 0xD3;
    const SSD1306_SETCOMPINS = 0xDA;
    const SSD1306_SETVCOMDETECT = 0xDB;
    const SSD1306_SETDISPLAYCLOCKDIV = 0xD5;
    const SSD1306_SETPRECHARGE = 0xD9;
    const SSD1306_SETMULTIPLEX = 0xA8;
    const SSD1306_SETLOWCOLUMN = 0x00;
    const SSD1306_SETHIGHCOLUMN = 0x10;
    const SSD1306_SETSTARTLINE = 0x40;
    const SSD1306_MEMORYMODE = 0x20;
    const SSD1306_COLUMNADDR = 0x21;
    const SSD1306_PAGEADDR = 0x22;
    const SSD1306_COMSCANINC = 0xC0;
    const SSD1306_COMSCANDEC = 0xC8;
    const SSD1306_SEGREMAP = 0xA0;
    const SSD1306_CHARGEPUMP = 0x8D;
    const SSD1306_EXTERNALVCC = 0x1;
    const SSD1306_SWITCHCAPVCC = 0x2;

    let _buffer: Buffer;

    /**
     * Initialise l'écran OLED
     */
    //% block="initialiser OLED"
    //% weight=100
    export function init(): void {
        _buffer = pins.createBuffer(1024); // 128x64/8
        _buffer.fill(0);

        // Séquence d'initialisation
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

    /**
     * Efface l'écran
     */
    //% block="effacer écran"
    //% weight=90
    export function clear(): void {
        _buffer.fill(0);
        _x = 0;
        _y = 0;
    }

    /**
     * Met à jour l'affichage
     */
    //% block="mettre à jour affichage"
    //% weight=80
    export function update(): void {
        writeCommand(SSD1306_COLUMNADDR);
        writeCommand(0);
        writeCommand(127);
        writeCommand(SSD1306_PAGEADDR);
        writeCommand(0);
        writeCommand(7);

        // Envoi des données
        let data = pins.createBuffer(_buffer.length + 1);
        data[0] = 0x40; // Mode données
        for (let i = 0; i < _buffer.length; i++) {
            data[i + 1] = _buffer[i];
        }
        pins.i2cWriteBuffer(OLED_ADDRESS, data);
    }

    /**
     * Affiche du texte
     */
    //% block="afficher texte %text"
    //% weight=70
    export function showString(text: string): void {
        for (let i = 0; i < text.length; i++) {
            drawChar(text.charAt(i));
        }
        update();
    }

    /**
     * Positionne le curseur
     */
    //% block="positionner curseur x %x y %y"
    //% weight=60
    export function setCursor(x: number, y: number): void {
        _x = x * 6;
        _y = y * 8;
    }

    function drawChar(c: string): void {
        if (_x > 122) {
            _x = 0;
            _y += 8;
        }

        // Police très basique 5x8
        for (let i = 0; i < 5; i++) {
            let line = 0xFF; // Tous les pixels allumés pour test
            for (let j = 0; j < 8; j++) {
                if (line & (1 << j)) {
                    drawPixel(_x + i, _y + j, 1);
                }
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
        buf[0] = 0x00; // Mode commande
        buf[1] = cmd;
        pins.i2cWriteBuffer(OLED_ADDRESS, buf);
    }
}