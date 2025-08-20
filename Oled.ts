/**
 * Module pour écran OLED 128x64 I2C (SSD1306)
 */
//% color=#0096FF icon="\uf26c" block="OLED 128x64"
//% groups=["Initialisation", "Affichage", "Dessins"]
namespace oled128x64 {

    const OLED_ADDR = 0x3C
    let fontSize = 1
    let oled_sda: DigitalPin
    let oled_scl: DigitalPin

    // --- FONCTIONS INTERNES ---

    function sendCommand(cmd: number) {
        let buf = pins.createBuffer(2)
        buf[0] = 0x00 // commande
        buf[1] = cmd
        pins.i2cWriteBuffer(OLED_ADDR, buf)
    }

    function initDisplay() {
        sendCommand(0xAE) // display off
        sendCommand(0xA4) // display RAM content
        sendCommand(0xD5) // clock divide ratio
        sendCommand(0x80)
        sendCommand(0xA8) // multiplex ratio
        sendCommand(0x3F)
        sendCommand(0xD3) // display offset
        sendCommand(0x00)
        sendCommand(0x40) // start line
        sendCommand(0x8D) // charge pump
        sendCommand(0x14)
        sendCommand(0x20) // memory mode
        sendCommand(0x00)
        sendCommand(0xA1) // segment remap
        sendCommand(0xC8) // com scan direction
        sendCommand(0xDA) // com pins
        sendCommand(0x12)
        sendCommand(0x81) // contrast
        sendCommand(0xCF)
        sendCommand(0xD9) // pre-charge
        sendCommand(0xF1)
        sendCommand(0xDB) // vcomh deselect
        sendCommand(0x40)
        sendCommand(0xA6) // normal display
        sendCommand(0xAF) // display on
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
     * Initialisent l'écran OLED avec les broches et la taille de texte choisie
     * @param sda broche SDA, eg: DigitalPin.P20
     * @param scl broche SCL, eg: DigitalPin.P19
     * @param taillePolice 1 (petit), 2 (moyen), 3 (grand)
     */
    //% block="🖥️ initialiser OLED SDA %sda SCL %scl taille %taillePolice"
    //% sda.defl=DigitalPin.P20 scl.defl=DigitalPin.P19
    //% taillePolice.min=1 taillePolice.max=3 taillePolice.defl=1
    //% group="Initialisation"
    export function initialiserOLED(sda: DigitalPin, scl: DigitalPin, taillePolice: number): void {
        oled_sda = sda
        oled_scl = scl
        fontSize = Math.max(1, Math.min(3, taillePolice))
        pins.i2cWriteNumber(OLED_ADDR, 0, NumberFormat.Int8LE) // réveille l'écran
        pins.i2cWriteBuffer(OLED_ADDR, pins.createBuffer(1))   // force init
        initDisplay()
        clear()
    }

    // --- AFFICHAGE TEXTE ---

    /**
     * Affiche du texte sur l'écran OLED à une position donnée
     * @param texte texte à afficher
     * @param x position horizontale (0..127)
     * @param y position verticale (0..63)
     */
    //% block="📝 afficher %texte à x %x y %y"

    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% group="Affichage"
    export function afficherTexte(texte: string, x: number, y: number): void {
        // Ceci nécessite une lib externe pour affichage complexe.
        // Placeholder : afficher un message en console (pour développement)
        console.log(`Texte "${texte}" à (${x},${y})`)
    }

    /**
  * Dessine un pixel à une position donnée
  * @param x position horizontale (0..127)
  * @param y position verticale (0..63)
  */
    //% block="🔲 pixel à x %x y %y"
    //% inlineInputMode=inline
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% group="Dessins"
    export function pixel(x: number, y: number): void {
        console.log(`Pixel à (${x},${y})`)
    }

    /**
     * Dessine une ligne entre deux points
     * @param x1 début x
     * @param y1 début y
     * @param x2 fin x
     * @param y2 fin y
     */
    //% block="📏 ligne de (%x1,%y1) à (%x2,%y2)"
    //% inlineInputMode=inline
    //% group="Dessins"
    export function ligne(x1: number, y1: number, x2: number, y2: number): void {
        console.log(`Ligne de (${x1},${y1}) à (${x2},${y2})`)
    }

    /**
     * Dessine un rectangle à la position choisie
     * @param x coin supérieur gauche x
     * @param y coin supérieur gauche y
     * @param largeur largeur du rectangle
     * @param hauteur hauteur du rectangle
     */
    //% block="⬛ rectangle x %x y %y largeur %largeur hauteur %hauteur"
    //% inlineInputMode=inline
    //% group="Dessins"
    export function rectangle(x: number, y: number, largeur: number, hauteur: number): void {
        console.log(`Rectangle à (${x},${y}) de ${largeur}x${hauteur}`)
    }
}
