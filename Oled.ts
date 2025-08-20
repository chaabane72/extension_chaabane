/**
 * Écran OLED SSD1306 128x64 via I²C
 * Fonctions: init, clear, show, pixel, line, rect
 */
//% color=#222222 icon="\uf108" block="OLED 128x64"
//% groups=["Configuration","Affichage","Dessin"]
namespace oled {

    const WIDTH = 128
    const HEIGHT = 64
    const PAGES = HEIGHT / 8 // 8
    let _addr = 0x3C
    let _buf = control.createBuffer(WIDTH * PAGES) // 1024 octets
    let _inited = false

    // --- bas niveau I2C ---
    function cmd(c: number) {
        const b = control.createBuffer(2)
        b[0] = 0x00 // control byte: command
        b[1] = c & 0xFF
        pins.i2cWriteBuffer(_addr, b)
    }
    function dataChunk(chunk: Buffer) {
        // on préfixe d'un octet 0x40 (control byte = data)
        const out = control.createBuffer(1 + chunk.length)
        out[0] = 0x40
        out.write(1, chunk)
        pins.i2cWriteBuffer(_addr, out)
    }
    function sendInitSeq() {
        cmd(0xAE)            // display off
        cmd(0xD5); cmd(0x80) // clock
        cmd(0xA8); cmd(0x3F) // multiplex 1/64
        cmd(0xD3); cmd(0x00) // offset
        cmd(0x40)            // start line = 0
        cmd(0x8D); cmd(0x14) // charge pump on
        cmd(0x20); cmd(0x00) // horizontal addressing mode
        cmd(0xA1)            // segment remap
        cmd(0xC8)            // COM scan dec
        cmd(0xDA); cmd(0x12) // COM pins config
        cmd(0x81); cmd(0xCF) // contrast
        cmd(0xD9); cmd(0xF1) // precharge
        cmd(0xDB); cmd(0x40) // VCOM detect
        cmd(0xA4)            // resume to RAM
        cmd(0xA6)            // normal (A7= inverse)
        cmd(0x2E)            // stop scroll
        cmd(0xAF)            // display on
    }

    // ----------------- BLOCS -----------------

    /**
     * Initialiser l'écran (adresse par défaut 0x3C)
     */
    //% block="🖥️ initialiser OLED (SSD1306) adresse %addr"
    //% addr.defl=0x3C
    //% group="Configuration"
    export function init(addr: number = 0x3C): void {
        _addr = addr
        basic.pause(10)
        // I2C du micro:bit : SDA=P20, SCL=P19 (routés par la carte)
        // en général rien d'autre à configurer
        clear()
        sendInitSeq()
        show()
        _inited = true
    }

    /**
     * Effacer le tampon (écran vide au prochain show)
     */
    //% block="🧹 effacer l'écran"
    //% group="Affichage"
    export function clear(): void {
        for (let i = 0; i < _buf.length; i++) _buf[i] = 0
    }

    /**
     * Envoyer le tampon à l'écran (rafraîchir)
     */
    //% block="📤 afficher (show)"
    //% group="Affichage"
    export function show(): void {
        if (!_inited) return
        // positionne zone entière puis envoie page par page
        cmd(0x21); cmd(0); cmd(WIDTH - 1) // set column address
        cmd(0x22); cmd(0); cmd(PAGES - 1) // set page address
        for (let p = 0; p < PAGES; p++) {
            const start = p * WIDTH
            dataChunk(_buf.slice(start, start + WIDTH))
        }
    }

    /**
     * Mettre/unset un pixel (x:0..127, y:0..63)
     */
    //% block="• pixel x %x y %y | %on"
    //% on.shadow=toggleOnOff
    //% x.min=0 x.max=127 y.min=0 y.max=63
    //% group="Dessin"
    export function pixel(x: number, y: number, on: boolean = true): void {
        if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return
        const page = y >> 3
        const bit = 1 << (y & 7)
        const idx = page * WIDTH + x
        if (on) _buf[idx] |= bit
        else _buf[idx] &= (~bit) & 0xFF
    }

    /**
     * Tracer une ligne (algorithme de Bresenham)
     */
    //% block="— ligne de x %x0 y %y0 à x %x1 y %y1"
    //% x0.min=0 x0.max=127 y0.min=0 y0.max=63 x1.min=0 x1.max=127 y1.min=0 y1.max=63
    //% group="Dessin"
    export function ligne(x0: number, y0: number, x1: number, y1: number): void {
        let dx = Math.abs(x1 - x0)
        let sx = x0 < x1 ? 1 : -1
        let dy = -Math.abs(y1 - y0)
        let sy = y0 < y1 ? 1 : -1
        let err = dx + dy
        while (true) {
            pixel(x0, y0, true)
            if (x0 == x1 && y0 == y1) break
            const e2 = 2 * err
            if (e2 >= dy) { err += dy; x0 += sx }
            if (e2 <= dx) { err += dx; y0 += sy }
        }
    }

    /**
     * Rectangle (plein si rempli=true)
     */
    //% block="▭ rectangle x %x y %y largeur %w hauteur %h rempli %rempli"
    //% x.min=0 x.max=127 y.min=0 y.max=63 w.min=1 w.max=128 h.min=1 h.max=64
    //% group="Dessin"
    export function rectangle(x: number, y: number, w: number, h: number, rempli: boolean): void {
        if (rempli) {
            for (let yy = y; yy < y + h; yy++) {
                for (let xx = x; xx < x + w; xx++) pixel(xx, yy, true)
            }
        } else {
            ligne(x, y, x + w - 1, y)
            ligne(x, y + h - 1, x + w - 1, y + h - 1)
            ligne(x, y, x, y + h - 1)
            ligne(x + w - 1, y, x + w - 1, y + h - 1)
        }
    }
}
