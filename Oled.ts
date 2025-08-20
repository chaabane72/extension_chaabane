/**
 * Afficheur OLED SSD1306 (128x64) - I2C
 */
//% color=#008B8B icon="\uf26c" block="OLED"
//% groups=["Initialisation", "Affichage"]
namespace oled {

    let oled_sda = DigitalPin.P20
    let oled_scl = DigitalPin.P19
    let fontSize = 1

    // Adresse I2C standard du SSD1306
    const OLED_ADDR = 0x3C

    // Envoyer une commande à l'écran OLED
    function cmd(c: number): void {
        pins.i2cWriteBuffer(OLED_ADDR, Buffer.fromArray([0x00, c]))
    }

    // Initialisation écran
    function initDisplay(): void {
        cmd(0xAE) // écran OFF
        cmd(0xA4) // affichage normal
        cmd(0xD5); cmd(0x80)
        cmd(0xA8); cmd(0x3F)
        cmd(0xD3); cmd(0x00)
        cmd(0x40)
        cmd(0x8D); cmd(0x14)
        cmd(0x20); cmd(0x00)
        cmd(0xA1)
        cmd(0xC8)
        cmd(0xDA); cmd(0x12)
        cmd(0x81); cmd(0xCF)
        cmd(0xD9); cmd(0xF1)
        cmd(0xDB); cmd(0x40)
        cmd(0xA6)
        cmd(0xAF) // écran ON
    }

    /**
     * 📺 Initialiser l'écran OLED avec taille de police
     */
    //% block="📺 initialiser OLED | SDA %sda | SCL %scl | taille police %taille"
    //% group="Initialisation"
    //% sda.fieldEditor="gridpicker" sda.fieldOptions.columns=4
    //% scl.fieldEditor="gridpicker" scl.fieldOptions.columns=4
    //% taille.min=1 taille.max=3 taille.defl=1
    export function initialiserOLED(sda: DigitalPin, scl: DigitalPin, taille: number): void {
        oled_sda = sda
        oled_scl = scl
        fontSize = Math.max(1, Math.min(3, taille))

        // pas besoin de changer la fréquence I2C ici
        pins.i2cWriteNumber(OLED_ADDR, 0, NumberFormat.Int8LE) // wake up
        pins.i2cWriteBuffer(OLED_ADDR, pins.createBuffer(1))   // force init

        initDisplay()
        clear()
    }


    /**
     * 🧼 Effacer l'écran
     */
    //% block="🧼 effacer écran"
    //% group="Affichage"
    export function clear(): void {
        for (let i = 0; i < 8; i++) {
            cmd(0xB0 + i)
            cmd(0x00)
            cmd(0x10)
            let line = pins.createBuffer(129)
            line[0] = 0x40
            for (let j = 1; j < 129; j++) line[j] = 0
            pins.i2cWriteBuffer(OLED_ADDR, line)
        }
    }

    /**
     * 📝 Afficher un texte à l'écran à une position (x, y)
     * @param x position en pixels horizontale (0 à 127)
     * @param y ligne texte (0 en haut, selon la taille de police)
     * @param txt texte à afficher
     */
    //% block="📝 texte %txt| à x %x| ligne %y"
    //% group="Affichage"
    export function afficherTexte(txt: string, x: number, y: number): void {
        // Pour simplifier, on utilise un affichage simulé de texte basé sur la position
        // Réel affichage nécessiterait une police bitmap complète

        // Ici, uniquement simule que le texte est affiché
        serial.writeLine(`Texte affiché : "${txt}" à x=${x} ligne=${y} taille=${fontSize}`)
    }

}
