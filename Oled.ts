// Afficheur OLED pour micro:bit - Version débutant
namespace EcranOLED {
    let adresse = 0x3C
    let buffer: Buffer

    /**
     * Démarrer l'écran OLED
     */
    //% block="allumer écran OLED"
    export function demarrer(): void {
        buffer = pins.createBuffer(1024)
        buffer.fill(0)

        // Initialisation simple
        ecrireCommande(0xAE) // Display OFF
        ecrireCommande(0xD5) // Set clock
        ecrireCommande(0x80)
        ecrireCommande(0xA8) // Set multiplex
        ecrireCommande(0x3F)
        ecrireCommande(0xD3) // Set offset
        ecrireCommande(0x00)
        ecrireCommande(0x40) // Start line
        ecrireCommande(0x8D) // Charge pump
        ecrireCommande(0x14)
        ecrireCommande(0x20) // Memory mode
        ecrireCommande(0x00)
        ecrireCommande(0xA1) // Segment remap
        ecrireCommande(0xC8) // Com scan dec
        ecrireCommande(0xDA) // Set compins
        ecrireCommande(0x12)
        ecrireCommande(0x81) // Set contrast
        ecrireCommande(0xCF)
        ecrireCommande(0xD9) // Precharge
        ecrireCommande(0xF1)
        ecrireCommande(0xDB) // Vcom detect
        ecrireCommande(0x40)
        ecrireCommande(0xA4) // Display all on
        ecrireCommande(0xA6) // Normal display
        ecrireCommande(0xAF) // Display ON

        effacer()
    }

    /**
     * Nettoyer l'écran
     */
    //% block="nettoyer écran"
    export function effacer(): void {
        buffer.fill(0)
        mettreAJour()
    }

    /**
     * Actualiser l'affichage
     */
    function mettreAJour(): void {
        ecrireCommande(0x21) // Column address
        ecrireCommande(0)
        ecrireCommande(127)
        ecrireCommande(0x22) // Page address
        ecrireCommande(0)
        ecrireCommande(7)

        let data = pins.createBuffer(buffer.length + 1)
        data[0] = 0x40
        for (let i = 0; i < buffer.length; i++) {
            data[i + 1] = buffer[i]
        }
        pins.i2cWriteBuffer(adresse, data)
    }

    /**
     * Écrire du texte
     */
    //% block="écrire %texte"
    export function ecrire(texte: string): void {
        // Pour débutant: on dessine des carrés simples
        for (let i = 0; i < texte.length; i++) {
            let x = i * 8
            for (let j = 0; j < 8; j++) {
                for (let k = 0; k < 6; k++) {
                    dessinerPixel(x + k, j, 1)
                }
            }
        }
        mettreAJour()
    }

    function dessinerPixel(x: number, y: number, couleur: number): void {
        if (x < 0 || x >= 128 || y < 0 || y >= 64) return
        let page = Math.idiv(y, 8)
        let bit = y % 8
        let index = x + page * 128
        if (couleur) {
            buffer[index] |= (1 << bit)
        } else {
            buffer[index] &= ~(1 << bit)
        }
    }

    function ecrireCommande(cmd: number): void {
        let buf = pins.createBuffer(2)
        buf[0] = 0x00
        buf[1] = cmd
        pins.i2cWriteBuffer(adresse, buf)
    }
}