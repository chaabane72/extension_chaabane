/**
 * Module pour écran OLED 128x64 I2C (SSD1306)
 */
//% color=#0096FF icon="\uf26c" block="OLED 128x64"
//% groups=["Initialisation", "Affichage", "Dessins"]
namespace oled128x64 {

    const OLED_ADDR = 0x3C
    let fontSize = 1

    // --- FONCTIONS INTERNES ---
    function sendCommand(cmd: number) {
        let buf = pins.createBuffer(2)
        buf[0] = 0x00
        buf[1] = cmd
        pins.i2cWriteBuffer(OLED_ADDR, buf)
    }

    function initDisplay() {
        sendCommand(0xAE)
        sendCommand(0xA4)
        sendCommand(0xD5)
        sendCommand(0x80)
        sendCommand(0xA8)
        sendCommand(0x3F)
        sendCommand(0xD3)
        sendCommand(0x00)
        sendCommand(0x40)
        sendCommand(0x8D)
        sendCommand(0x14)
        sendCommand(0x20)
        sendCommand(0x00)
        sendCommand(0xA1)
        sendCommand(0xC8)
        sendCommand(0xDA)
        sendCommand(0x12)
        sendCommand(0x81)
        sendCommand(0xCF)
        sendCommand(0xD9)
        sendCommand(0xF1)
        sendCommand(0xDB)
        sendCommand(0x40)
        sendCommand(0xA6)
        sendCommand(0xAF)
    }

    function clear() {
        for (let y = 0; y < 8; y++) {
            let line = pins.createBuffer(129)
            line[0] = 0x40
            for (let i = 1; i < 129; i++) {
                line[i] = 0x00
            }
            sendCommand(0xB0 + y)
            sendCommand(0x00)
            sendCommand(0x10)
            pins.i2cWriteBuffer(OLED_ADDR, line)
        }
    }

    // --- INITIALISATION ---

    /**
     * Initialise l'écran OLED connecté à P20 (SDA) et P19 (SCL)
     * @param taillePolice 1 (petite), 2 (moyenne), 3 (grande)
     */
    //% block="🖥️ initialiser OLED (SDA=P20, SCL=P19) taille %taillePolice"
    //% taillePolice.min=1 taillePolice.max=3 taillePolice.defl=1
    //% group="Initialisation"
    export function initialiserOLED(taillePolice: number): void {
        fontSize = Math.max(1, Math.min(3, taillePolice))
        pins.i2cWriteNumber(OLED_ADDR, 0, NumberFormat.Int8LE)
        pins.i2cWriteBuffer(OLED_ADDR, pins.createBuffer(1))
        initDisplay()
        clear()
    }

    // --- AFFICHAGE TEXTE ---

    /**
     * Affiche un texte à la position indiquée (affichage console pour test)
     * @param texte le texte à afficher
     * @param x position horizontale (0..127)
     * @param y position verticale (0..63)
     */
    //% block="📝 afficher %texte à x %x y %y"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% group="Affichage"
    export function afficherTexte(texte: string, x: number, y: number): void {
        console.log(`Texte "${texte}" à (${x},${y})`)
    }

    // --- DESSINS SIMPLES ---

    /**
     * Dessine un pixel à une position donnée
     */
    //% block="🔲 pixel à x %x y %y"
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% inlineInputMode=inline
    //% group="Dessins"
    export function pixel(x: number, y: number): void {
        console.log(`Pixel à (${x},${y})`)
    }

    /**
     * Dessine une ligne entre deux points
     */
    //% block="📏 ligne de (%x1,%y1) à (%x2,%y2)"
    //% inlineInputMode=inline
    //% group="Dessins"
    export function ligne(x1: number, y1: number, x2: number, y2: number): void {
        console.log(`Ligne de (${x1},${y1}) à (${x2},${y2})`)
    }

    /**
     * Dessine un rectangle vide à la position donnée
     */
    //% block="⬛ rectangle x %x y %y largeur %largeur hauteur %hauteur"
    //% inlineInputMode=inline
    //% group="Dessins"
    export function rectangle(x: number, y: number, largeur: number, hauteur: number): void {
        console.log(`Rectangle à (${x},${y}) de ${largeur}x${hauteur}`)
    }
}
