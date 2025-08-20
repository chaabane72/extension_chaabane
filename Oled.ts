// OLED 1.3" I2C Display Driver for MakeCode - VERSION FRANÇAISE
// Basé sur contrôleur SSD1306/SSH1106

namespace AfficheurOLED {
    let OLED_ADDRESS = 0x3C;
    let _largeurEcran = 128;
    let _hauteurEcran = 64;
    let _x = 0;
    let _y = 0;

    // Commandes
    const SSD1306_DISPLAYOFF = 0xAE;
    const SSD1306_DISPLAYON = 0xAF;
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
    const SSD1306_COLUMNADDR = 0x21;
    const SSD1306_PAGEADDR = 0x22;

    let _buffer: Buffer;

    // Police de caractères 5x8
    const police: number[] = [
        0x00, 0x00, 0x00, 0x00, 0x00, // 32: espace
        0x00, 0x00, 0x5F, 0x00, 0x00, // 33: !
        0x00, 0x07, 0x00, 0x07, 0x00, // 34: "
        0x14, 0x7F, 0x14, 0x7F, 0x14, // 35: #
        0x24, 0x2A, 0x7F, 0x2A, 0x12, // 36: $
        0x23, 0x13, 0x08, 0x64, 0x62, // 37: %
        0x36, 0x49, 0x55, 0x22, 0x50, // 38: &
        0x00, 0x05, 0x03, 0x00, 0x00, // 39: '
        0x00, 0x1C, 0x22, 0x41, 0x00, // 40: (
        0x00, 0x41, 0x22, 0x1C, 0x00, // 41: )
        0x08, 0x2A, 0x1C, 0x2A, 0x08, // 42: *
        0x08, 0x08, 0x3E, 0x08, 0x08, // 43: +
        0x00, 0x50, 0x30, 0x00, 0x00, // 44: ,
        0x08, 0x08, 0x08, 0x08, 0x08, // 45: -
        0x00, 0x60, 0x60, 0x00, 0x00, // 46: .
        0x20, 0x10, 0x08, 0x04, 0x02, // 47: /
        0x3E, 0x51, 0x49, 0x45, 0x3E, // 48: 0
        0x00, 0x42, 0x7F, 0x40, 0x00, // 49: 1
        0x42, 0x61, 0x51, 0x49, 0x46, // 50: 2
        0x21, 0x41, 0x45, 0x4B, 0x31, // 51: 3
        0x18, 0x14, 0x12, 0x7F, 0x10, // 52: 4
        0x27, 0x45, 0x45, 0x45, 0x39, // 53: 5
        0x3C, 0x4A, 0x49, 0x49, 0x30, // 54: 6
        0x01, 0x71, 0x09, 0x05, 0x03, // 55: 7
        0x36, 0x49, 0x49, 0x49, 0x36, // 56: 8
        0x06, 0x49, 0x49, 0x29, 0x1E, // 57: 9
        0x00, 0x36, 0x36, 0x00, 0x00, // 58: :
        0x00, 0x56, 0x36, 0x00, 0x00, // 59: ;
        0x00, 0x08, 0x14, 0x22, 0x41, // 60: <
        0x14, 0x14, 0x14, 0x14, 0x14, // 61: =
        0x41, 0x22, 0x14, 0x08, 0x00, // 62: >
        0x02, 0x01, 0x51, 0x09, 0x06, // 63: ?
        0x32, 0x49, 0x79, 0x41, 0x3E, // 64: @
        0x7E, 0x11, 0x11, 0x11, 0x7E, // 65: A
        0x7F, 0x49, 0x49, 0x49, 0x36, // 66: B
        0x3E, 0x41, 0x41, 0x41, 0x22, // 67: C
        0x7F, 0x41, 0x41, 0x41, 0x3E, // 68: D
        0x7F, 0x49, 0x49, 0x49, 0x41, // 69: E
        0x7F, 0x09, 0x09, 0x09, 0x01, // 70: F
        0x3E, 0x41, 0x49, 0x49, 0x7A, // 71: G
        0x7F, 0x08, 0x08, 0x08, 0x7F, // 72: H
        0x00, 0x41, 0x7F, 0x41, 0x00, // 73: I
        0x20, 0x40, 0x41, 0x3F, 0x01, // 74: J
        0x7F, 0x08, 0x14, 0x22, 0x41, // 75: K
        0x7F, 0x40, 0x40, 0x40, 0x40, // 76: L
        0x7F, 0x02, 0x04, 0x02, 0x7F, // 77: M
        0x7F, 0x04, 0x08, 0x10, 0x7F, // 78: N
        0x3E, 0x41, 0x41, 0x41, 0x3E, // 79: O
        0x7F, 0x09, 0x09, 0x09, 0x06, // 80: P
        0x3E, 0x41, 0x51, 0x21, 0x5E, // 81: Q
        0x7F, 0x09, 0x19, 0x29, 0x46, // 82: R
        0x46, 0x49, 0x49, 0x49, 0x31, // 83: S
        0x01, 0x01, 0x7F, 0x01, 0x01, // 84: T
        0x7F, 0x40, 0x40, 0x40, 0x7F, // 85: U
        0x0F, 0x30, 0x40, 0x30, 0x0F, // 86: V
        0x7F, 0x20, 0x18, 0x20, 0x7F, // 87: W
        0x63, 0x14, 0x08, 0x14, 0x63, // 88: X
        0x03, 0x04, 0x78, 0x04, 0x03, // 89: Y
        0x61, 0x51, 0x49, 0x45, 0x43, // 90: Z
        0x00, 0x7F, 0x41, 0x41, 0x00, // 91: [
        0x02, 0x04, 0x08, 0x10, 0x20, // 92: backslash
        0x00, 0x41, 0x41, 0x7F, 0x00, // 93: ]
        0x04, 0x02, 0x01, 0x02, 0x04, // 94: ^
        0x40, 0x40, 0x40, 0x40, 0x40, // 95: _
        0x00, 0x01, 0x02, 0x04, 0x00, // 96: `
        0x20, 0x54, 0x54, 0x54, 0x78, // 97: a
        0x7F, 0x48, 0x44, 0x44, 0x38, // 98: b
        0x38, 0x44, 0x44, 0x44, 0x20, // 99: c
        0x38, 0x44, 0x44, 0x48, 0x7F, // 100: d
        0x38, 0x54, 0x54, 0x54, 0x18, // 101: e
        0x08, 0x7E, 0x09, 0x01, 0x02, // 极2: f
        0x08, 0x14, 0x54, 0x54, 0x3C, // 103: g
        0x7F, 0x08, 0x04, 0x04, 0x78, // 104: h
        0x00, 0x44, 0x7D, 0x40, 0x00, // 105: i
        0x20, 0x40, 0x44, 0x3D, 0x00, // 106: j
        0x7F, 0x10, 0x28, 0x44, 0x00, // 107: k
        0x00, 0x41, 0x7F, 0x40, 0x00, // 108: l
        0x7C, 0x04, 0x18, 0x04, 0x78, // 109: m
        0x7C, 0x08, 0x04, 0x04, 0x78, // 110: n
        0x38, 0x44, 0x44, 0x44, 0x38, // 111: o
        0x7C, 0x14, 0x14, 0x14, 0x08, // 112: p
        0x08, 0x14, 0x14, 0x18, 0x7C, // 113: q
        0x7C, 0x08, 0x04, 0x04, 0x08, // 114: r
        0x48, 0x54, 0x54, 0x54, 0x20, // 115: s
        0x04, 0x3F, 0x44, 0x40, 0x20, // 116: t
        0x3C, 0x40, 0x40, 0x20, 0x7C, // 117: u
        0x1C, 0x20, 0x40, 0x20, 0x1C, // 118: v
        0x3C, 0x40, 0x30, 0x40, 0x3C, // 119: w
        0x44, 0x28, 0x10, 0x28, 0x44, // 120: x
        0x0C, 0x50, 0x50, 0x50, 0x3C, // 121: y
        0x44, 0x64, 0x54, 0x4C, 0x44, // 122: z
        0x00, 0x08, 0x36, 0x41, 0x00, // 123: {
        0x00, 0x00, 0x7F, 0x00, 0x00, // 124: |
        0x00, 0x41, 0x36, 0x08, 0x00, // 125: }
        0x08, 0x04, 0x08, 0x10, 0x08, // 126: ~
    ];

    /**
     * Initialiser l'écran OLED
     */
    //% block="initialiser OLED"
    //% weight=100
    export function initialiser(): void {
        _buffer = pins.createBuffer(1024);
        _buffer.fill(0);

        ecrireCommande(SSD1306_DISPLAYOFF);
        ecrireCommande(SSD1306_SETDISPLAYCLOCKDIV);
        ecrireCommande(0x80);
        ecrireCommande(SSD1306_SETMULTIPLEX);
        ecrireCommande(0x3F);
        ecrireCommande(SSD1306_SETDISPLAYOFFSET);
        ecrireCommande(0x00);
        ecrireCommande(SSD1306_SETSTARTLINE | 0x00);
        ecrireCommande(SSD1306_CHARGEPUMP);
        ecrireCommande(0x14);
        ecrireCommande(SSD1306_MEMORYMODE);
        ecrireCommande(0x00);
        ecrireCommande(SSD1306_SEGREMAP | 0x01);
        ecrireCommande(SSD1306_COMSCANDEC);
        ecrireCommande(SSD1306_SETCOMPINS);
        ecrireCommande(0x12);
        ecrireCommande(SSD1306_SETCONTRAST);
        ecrireCommande(0xCF);
        ecrireCommande(SSD1306_SETPRECHARGE);
        ecrireCommande(0xF1);
        ecrireCommande(SSD1306_SETVCOMDETECT);
        ecrireCommande(0x40);
        ecrireCommande(SSD1306_DISPLAYALLON_RESUME);
        ecrireCommande(SSD1306_NORMALDISPLAY);
        ecrireCommande(SSD1306_DISPLAYON);

        effacer();
    }

    /**
     * Effacer l'écran
     */
    //% block="effacer écran"
    //% weight=90
    export function effacer(): void {
        _buffer.fill(0);
        _x = 0;
        _y = 0;
        mettreAJour();
    }

    /**
     * Mettre à jour l'affichage
     */
    //% block="mettre à jour affichage"
    //% weight=80
    export function mettreAJour(): void {
        ecrireCommande(SSD1306_COLUMNADDR);
        ecrireCommande(0);
        ecrireCommande(127);
        ecrireCommande(SSD1306_PAGEADDR);
        ecrireCommande(0);
        ecrireCommande(7);

        let donnees = pins.createBuffer(_buffer.length + 1);
        donnees[0] = 0x40;
        for (let i = 0; i < _buffer.length; i++) {
            donnees[i + 1] = _buffer[i];
        }
        pins.i2cWriteBuffer(OLED_ADDRESS, donnees);
    }

    /**
     * Afficher du texte
     * @param texte Le texte à afficher
     */
    //% block="afficher texte %texte"
    //% weight=70
    export function afficherTexte(texte: string): void {
        for (let i = 0; i < texte.length; i++) {
            dessinerCaractere(texte.charAt(i));
        }
        mettreAJour();
    }

    /**
     * Positionner le curseur
     * @param x Position X (0-20)
     * @param y Position Y (0-7)
     */
    //% block="positionner curseur x %x y %y"
    //% weight=60
    //% x.min=0 x.max=20
    //% y.min=0 y.max=7
    export function positionnerCurseur(x: number, y: number): void {
        _x = x * 6;
        _y = y * 8;
    }

    /**
     * Dessiner un pixel
     * @param x Position X
     * @param y Position Y
     * @param couleur Couleur (0=éteint, 1=allumé)
     */
    //% block="dessiner pixel x %x y %y couleur %couleur"
    //% weight=50
    //% couleur.shadow="toggleNumber"
    export function dessinerPixel(x: number, y: number, couleur: number): void {
        if (x < 0 || x >= 128 || y < 0 || y >= 64) return;

        let page = Math.idiv(y, 8);
        let bit = y % 8;
        let index = x + page * 128;

        if (couleur) {
            _buffer[index] |= (1 << bit);
        } else {
            _buffer[index] &= ~(1 << bit);
        }
    }

    /**
     * Dessiner une ligne
     * @param x0 Début X
     * @param y0 Début Y
     * @param x1 Fin X
     * @param y1 Fin Y
     * @param couleur Couleur de la ligne
     */
    //% block="dessiner ligne de x %x0 y %y0 à x %x1 y %y1 couleur %couleur"
    //% weight=40
    export function dessinerLigne(x0: number, y0: number, x1: number, y1: number, couleur: number): void {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            dessinerPixel(x0, y0, couleur);
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
        mettreAJour();
    }

    /**
     * Dessiner un rectangle
     * @param x Position X
     * @param y Position Y
     * @param largeur Largeur
     * @param hauteur Hauteur
     * @param couleur Couleur
     * @param rempli Rectangle rempli ou vide
     */
    //% block="dessiner rectangle x %x y %y largeur %largeur hauteur %hauteur couleur %couleur rempli %rempli"
    //% weight=30
    export function dessinerRectangle(x: number, y: number, largeur: number, hauteur: number, couleur: number, rempli: boolean = false): void {
        if (rempli) {
            for (let i = x; i < x + largeur; i++) {
                for (let j = y; j < y + hauteur; j++) {
                    dessinerPixel(i, j, couleur);
                }
            }
        } else {
            dessinerLigne(x, y, x + largeur - 1, y, couleur);
            dessinerLigne(x, y + hauteur - 1, x + largeur - 1, y + hauteur - 1, couleur);
            dessinerLigne(x, y, x, y + hauteur - 1, couleur);
            dessinerLigne(x + largeur - 1, y, x + largeur - 1, y + hauteur - 1, couleur);
        }
        mettreAJour();
    }

    /**
     * Dessiner un cercle
     * @param x Centre X
     * @param y Centre Y
     * @param rayon Rayon
     * @param couleur Couleur
     * @param rempli Cercle rempli ou vide
     */
    //% block="dessiner cercle x %x y %y rayon %rayon couleur %couleur rempli %rempli"
    //% weight=20
    export function dessinerCercle(x: number, y: number, rayon: number, couleur: number, rempli: boolean = false): void {
        let f = 1 - rayon;
        let ddF_x = 1;
        let ddF_y = -2 * rayon;
        let x0 = 0;
        let y0 = rayon;

        dessinerPixel(x, y + rayon, couleur);
        dessinerPixel(x, y - rayon, couleur);
        dessinerPixel(x + rayon, y, couleur);
        dessinerPixel(x - rayon, y, couleur);

        if (rempli) {
            dessinerLigne(x - rayon, y, x + rayon, y, couleur);
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

            if (rempli) {
                dessinerLigne(x - x0, y + y0, x + x0, y + y0, couleur);
                dessinerLigne(x - x0, y - y0, x + x0, y - y0, couleur);
                dessinerLigne(x - y0, y + x0, x + y0, y + x0, couleur);
                dessinerLigne(x - y0, y - x0, x + y0, y - x0, couleur);
            } else {
                dessinerPixel(x + x0, y + y0, couleur);
                dessinerPixel(x - x0, y + y0, couleur);
                dessinerPixel(x + x0, y - y0, couleur);
                dessinerPixel(x - x0, y - y0, couleur);
                dessinerPixel(x + y0, y + x0, couleur);
                dessinerPixel(x - y0, y + x0, couleur);
                dessinerPixel(x + y0, y - x0, couleur);
                dessinerPixel(x - y0, y - x0, couleur);
            }
        }
        mettreAJour();
    }

    /**
     * Inverser l'affichage
     * @param inverser True pour inverser, false pour normal
     */
    //% block="inverser affichage %inverser"
    //% weight=10
    export function inverserAffichage(inverser: boolean): void {
        ecrireCommande(SSD1306_NORMALDISPLAY | (inverser ? 1 : 0));
    }

    function dessinerCaractere(c: string): void {
        let codeCaractere = c.charCodeAt(0);
        if (codeCaractere < 32 || codeCaractere > 126) codeCaractere = 32;

        let index = (codeCaractere - 32) * 5;

        for (let i = 0; i < 5; i++) {
            let ligne = police[index + i];
            for (let j = 0; j < 8; j++) {
                if (ligne & (1 << j)) {
                    dessinerPixel(_x + i, _y + j, 1);
                } else {
                    dessinerPixel(_x + i, _y + j, 0);
                }
            }
        }
        _x += 6;

        if (_x > 122) {
            _x = 0;
            _y += 8;
        }
    }

    function ecrireCommande(cmd: number): void {
        let tampon = pins.createBuffer(2);
        tampon[0] = 0x00;
        tampon[1] = cmd;
        pins.i2cWriteBuffer(OLED_ADDRESS, tampon);
    }
}