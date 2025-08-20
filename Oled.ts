/**
 * Extension OLED pour écran SSD1306 128x64 en I2C sur micro:bit V2
 */
//% color=#007ACC icon="\uf26c" block="OLED 128x64"
//% groups="['Initialisation', 'Affichage']"
namespace oled128x64 {

    const OLED_ADDR = 0x3C
    let screen = pins.createBuffer(1024) // 128 x 64 / 8
    let cursorX = 0
    let cursorY = 0

    /**
     * Initialise l'écran OLED SSD1306 connecté en I2C (SDA=P20, SCL=P19)
     */
    //% block="initialiser OLED"
    //% group="Initialisation"
    export function init(): void {
        const cmd = (c: number) => {
            let buf = pins.createBuffer(2)
            buf[0] = 0x00
            buf[1] = c
            pins.i2cWriteBuffer(OLED_ADDR, buf)
        }

        // Initialisation SSD1306
        cmd(0xAE)
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
        cmd(0xA4)
        cmd(0xA6)
        cmd(0xAF)

        clear()
        update()
    }

    /**
     * Efface l'écran
     */
    //% block="effacer écran"
    //% group="Affichage"
    export function clear(): void {
        screen.fill(0)
        cursorX = 0
        cursorY = 0
    }

    /**
     * Affiche une chaîne de caractères à la position (x, y)
     * @param texte le texte à afficher
     * @param x position en pixels (0-127)
     * @param y position en pixels (0-63)
     */
    //% block="afficher %texte à x %x y %y"
    //% group="Affichage"
    export function afficher(texte: string, x: number, y: number): void {
        cursorX = x
        cursorY = y
        // Ce bloc n'affiche rien pour l'instant : à compléter si on ajoute une vraie police
    }

    /**
     * Met à jour l'écran avec le contenu du tampon
     */
    //% block="mettre à jour l'écran"
    //% group="Affichage"
    export function update(): void {
        for (let page = 0; page < 8; page++) {
            let control = pins.createBuffer(1)
            control[0] = 0x40

            let line = screen.slice(page * 128, (page + 1) * 128)
            let data = control.concat(line)

            let setPage = pins.createBuffer(3)
            setPage[0] = 0x00
            setPage[1] = 0xB0 + page
            setPage[2] = 0x00
            pins.i2cWriteBuffer(OLED_ADDR, setPage)

            pins.i2cWriteBuffer(OLED_ADDR, data)
        }
    }

    /**
     * Dessine un pixel
     */
    export function drawPixel(x: number, y: number, color: boolean): void {
        if (x < 0 || x >= 128 || y < 0 || y >= 64) return
        let page = Math.floor(y / 8)
        let index = x + page * 128
        let mask = 1 << (y % 8)

        if (color) {
            screen[index] |= mask
        } else {
            screen[index] &= ~mask
        }
    }
}
