/**
 * Module pour écran OLED 128x64 I2C (SSD1306)
 */
//% color=#0096FF icon="\uf26c" block="OLED 128x64"
//% groups=["Initialisation", "Affichage", "Dessins"]
namespace oled128x64 {

    const OLED_ADDR = 0x3C
    let fontSize = 1
    let screen = pins.createBuffer(1024)

    // --- Commande I2C ---
    function cmd(c: number) {
        let buf = pins.createBuffer(2)
        buf[0] = 0x00
        buf[1] = c
        pins.i2cWriteBuffer(OLED_ADDR, buf)
    }

    // --- Initialisation écran SSD1306 ---
    function initDisplay() {
        cmd(0xAE)
        cmd(0xA4)
        cmd(0xD5)
        cmd(0x80)
        cmd(0xA8)
        cmd(0x3F)
        cmd(0xD3)
        cmd(0x00)
        cmd(0x40)
        cmd(0x8D)
        cmd(0x14)
        cmd(0x20)
        cmd(0x00)
        cmd(0xA1)
        cmd(0xC8)
        cmd(0xDA)
        cmd(0x12)
        cmd(0x81)
        cmd(0xCF)
        cmd(0xD9)
        cmd(0xF1)
        cmd(0xDB)
        cmd(0x40)
        cmd(0xA6)
        cmd(0xAF)
    }

    // --- Mise à jour de l'affichage ---
    function update() {
        for (let i = 0; i < 8; i++) {
            cmd(0xB0 + i)
            cmd(0x00)
            cmd(0x10)
            let content = screen.slice(i * 128, (i + 1) * 128)
            let line = pins.createBuffer(129)
            line[0] = 0x40
            for (let j = 0; j < 128; j++) {
                line[j + 1] = content[j]
            }
            pins.i2cWriteBuffer(OLED_ADDR, line)
        }
    }

    // --- Affichage d'un pixel ---
    function setPixel(x: number, y: number, color: number) {
        if (x < 0 || x > 127 || y < 0 || y > 63) return
        let page = y >> 3
        let byteIndex = x + page * 128
        let mask = 1 << (y % 8)
        if (color)
            screen[byteIndex] |= mask
        else
            screen[byteIndex] &= ~mask
    }

    // --- Nettoyage écran ---
    function clearScreen() {
        screen.fill(0)
        update()
    }

    // --- Initialisation (SDA = P20, SCL = P19) ---
    /**
     * 🖥️ Initialise l'écran OLED (SDA = P20, SCL = P19)
     * @param taillePolice taille du texte (1 à 3)
     */
    //% block="🖥️ initialiser OLED (SDA=P20, SCL=P19) taille %taillePolice"
    //% taillePolice.min=1 taillePolice.max=3 taillePolice.defl=1
    //% group="Initialisation"
    export function initialiserOLED(taillePolice: number): void {
        fontSize = Math.max(1, Math.min(3, taillePolice))
        pins.i2cWriteNumber(OLED_ADDR, 0, NumberFormat.Int8LE)
        pins.i2cWriteBuffer(OLED_ADDR, pins.createBuffer(1))
        initDisplay()
        clearScreen()
    }

    // --- Texte (affichage console uniquement) ---
    /**
     * Affiche un texte à une position donnée (affichage console pour test)
     * @param texte texte à afficher
     * @param x position horizontale (0..127)
     * @param y position verticale (0..63)
     */
    //% block="📝 afficher %texte à x %x y %y"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% group="Affichage"
    export function afficherTexte(texte: string, x: number, y: number): void {
        console.log(`Texte "${texte}" à (${x}, ${y})`)
        // Affichage réel non encore implémenté
    }

    // --- Dessin pixel ---
    /**
     * Dessine un pixel
     * @param x position x
     * @param y position y
     */
    //% block="🔲 pixel à x %x y %y"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% inlineInputMode=inline
    //% group="Dessins"
    export function pixel(x: number, y: number): void {
        setPixel(x, y, 1)
        update()
    }

    // --- Dessin ligne ---
    /**
     * Dessine une ligne entre deux points
     */
    //% block="📏 ligne de (%x1,%y1) à (%x2,%y2)"
    //% inlineInputMode=inline
    //% group="Dessins"
    export function ligne(x1: number, y1: number, x2: number, y2: number): void {
        let dx = Math.abs(x2 - x1)
        let dy = -Math.abs(y2 - y1)
        let sx = x1 < x2 ? 1 : -1
        let sy = y1 < y2 ? 1 : -1
        let err = dx + dy
        while (true) {
            setPixel(x1, y1, 1)
            if (x1 == x2 && y1 == y2) break
            let e2 = 2 * err
            if (e2 >= dy) { err += dy; x1 += sx }
            if (e2 <= dx) { err += dx; y1 += sy }
        }
        update()
    }

    // --- Dessin rectangle vide ---
    /**
     * Dessine un rectangle vide
     */
    //% block="⬛ rectangle x %x y %y largeur %largeur hauteur %hauteur"
    //% inlineInputMode=inline
    //% group="Dessins"
    export function rectangle(x: number, y: number, largeur: number, hauteur: number): void {
        ligne(x, y, x + largeur, y)
        ligne(x, y, x, y + hauteur)
        ligne(x + largeur, y, x + largeur, y + hauteur)
        ligne(x, y + hauteur, x + largeur, y + hauteur)
    }
}
