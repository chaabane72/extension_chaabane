declare interface Math {
    floor(x: number): number;
}

//% color=#27b0ba icon="\uf26c"
namespace OLED {
    let font: Buffer;

    const SSD1306_SETCONTRAST = 0x81
    const SSD1306_SETCOLUMNADRESS = 0x21
    const SSD1306_SETPAGEADRESS = 0x22
    const SSD1306_DISPLAYALLON_RESUME = 0xA4
    const SSD1306_DISPLAYALLON = 0xA5
    const SSD1306_NORMALDISPLAY = 0xA6
    const SSD1306_INVERTDISPLAY = 0xA7
    const SSD1306_DISPLAYOFF = 0xAE
    const SSD1306_DISPLAYON = 0xAF
    const SSD1306_SETDISPLAYOFFSET = 0xD3
    const SSD1306_SETCOMPINS = 0xDA
    const SSD1306_SETVCOMDETECT = 0xDB
    const SSD1306_SETDISPLAYCLOCKDIV = 0xD5
    const SSD1306_SETPRECHARGE = 0xD9
    const SSD1306_SETMULTIPLEX = 0xA8
    const SSD1306_SETLOWCOLUMN = 0x00
    const SSD1306_SETHIGHCOLUMN = 0x10
    const SSD1306_SETSTARTLINE = 0x40
    const SSD1306_MEMORYMODE = 0x20
    const SSD1306_COMSCANINC = 0xC0
    const SSD1306_COMSCANDEC = 0xC8
    const SSD1306_SEGREMAP = 0xA0
    const SSD1306_CHARGEPUMP = 0x8D
    const chipAdress = 0x3C
    const xOffset = 0
    const yOffset = 0

    let charX = 0               // position X en pixels
    let charY = 0               // position Y en pages (8 px)
    let displayWidth = 128
    let displayHeight = 64 / 8  // en pages
    let screenSize = 0
    let loadStarted: boolean
    let loadPercent: number
    let fontSize = 1            // facteur 1, 2, 3

    function command(cmd: number) {
        let buf = pins.createBuffer(2)
        buf[0] = 0x00
        buf[1] = cmd
        pins.i2cWriteBuffer(chipAdress, buf, false)
    }

    //% block="effacer l'écran OLED"
    //% weight=3
    export function clear() {
        loadStarted = false
        loadPercent = 0
        command(SSD1306_SETCOLUMNADRESS)
        command(0x00)
        command(displayWidth - 1)
        command(SSD1306_SETPAGEADRESS)
        command(0x00)
        command(displayHeight - 1)
        let data = pins.createBuffer(17);
        data[0] = 0x40; // mode données
        for (let i = 1; i < 17; i++) data[i] = 0x00

        // envoi par paquets de 16 octets
        for (let i = 0; i < screenSize; i += 16) {
            pins.i2cWriteBuffer(chipAdress, data, false)
        }
        charX = xOffset
        charY = yOffset
    }

    function drawLoadingFrame() {
        command(SSD1306_SETCOLUMNADRESS)
        command(0x00)
        command(displayWidth - 1)
        command(SSD1306_SETPAGEADRESS)
        command(0x00)
        command(displayHeight - 1)
        let data = pins.createBuffer(17);
        data[0] = 0x40; // mode données
        let i = 1
        for (let page = 0; page < displayHeight; page++) {
            for (let col = 0; col < displayWidth; col++) {
                if (page === 3 && col > 12 && col < displayWidth - 12) {
                    data[i] = 0x60
                } else if (page === 5 && col > 12 && col < displayWidth - 12) {
                    data[i] = 0x06
                } else if (page === 4 && (col === 12 || col === 13 || col === displayWidth - 12 || col === displayWidth - 13)) {
                    data[i] = 0xFF
                } else {
                    data[i] = 0x00
                }
                if (i === 16) {
                    pins.i2cWriteBuffer(chipAdress, data, false)
                    i = 1
                } else {
                    i++
                }
            }
        }
        charX = 30
        charY = 2
        writeString("Loading:")
    }

    function drawLoadingBar(percent: number) {
        charX = 78
        charY = 2
        let num = Math.floor(percent)
        writeNum(num)
        writeString("%")
        let width = displayWidth - 14 - 13
        let lastStart = width * (loadPercent / displayWidth)
        command(SSD1306_SETCOLUMNADRESS)
        command(14 + lastStart)
        command(displayWidth - 13)
        command(SSD1306_SETPAGEADRESS)
        command(4)
        command(5)
        let data = pins.createBuffer(2);
        data[0] = 0x40; // mode données
        data[1] = 0x7E
        for (let i = lastStart; i < width * (Math.floor(percent) / 100); i++) {
            pins.i2cWriteBuffer(chipAdress, data, false)
        }
        loadPercent = num
    }

    //% block="dessiner barre de chargement à $percent pourcent"
    //% percent.min=0 percent.max=100
    //% weight=2
    export function drawLoading(percent: number) {
        if (loadStarted) {
            drawLoadingBar(percent)
        } else {
            drawLoadingFrame()
            drawLoadingBar(percent)
            loadStarted = true
        }
    }

    //% block="afficher (sans retour) le texte $str"
    //% weight=6
    export function writeString(str: string) {
        for (let i = 0; i < str.length; i++) {
            if (charX > displayWidth - 6 * fontSize) {
                newLine()
            }
            drawChar(charX, charY, str.charAt(i))
            charX += 6 * fontSize
        }
    }

    //% block="afficher (sans retour) le nombre $n"
    //% weight=5
    export function writeNum(n: number) {
        let numString = n.toString()
        writeString(numString)
    }

    //% block="afficher le texte $str"
    //% weight=8
    export function writeStringNewLine(str: string) {
        writeString(str)
        newLine()
    }

    //% block="afficher le nombre $n"
    //% weight=7
    export function writeNumNewLine(n: number) {
        writeNum(n)
        newLine()
    }

    //% block="aller à la ligne"
    //% weight=4
    export function newLine() {
        // chaque ligne texte fait fontSize pages (8 * fontSize pixels)
        charY += fontSize
        charX = xOffset
    }

    //% block="curseur aller à la ligne $n"
    //% weight=3
    export function moveToLine(n: number) {
        // n est exprimé en pages (comme avant)
        charY = n
        charX = xOffset
    }

    // ====== Gestion des accents ======

    // // ====== Gestion des accents ======
    function decomposeChar(c: string): { base: string, accent: Array<{ col: number, row: number }> } {
        const code = c.charCodeAt(0)
        let base = c
        let acc: Array<{ col: number, row: number }> = []

        // petit utilitaire compatible MakeCode : push un point d'accent à la fois
        function add(col: number, row: number) {
            acc.push({ col: col, row: row })
        }

        // helpers qui n'appellent que add(...)
        function acute() {             // ´
            add(3, 0); add(4, 1)
        }
        function grave() {             // `
            add(1, 0); add(0, 1)
        }
        function circumflex() {        // ^
            add(2, 0); add(1, 1); add(3, 1)
        }
        function diaeresis() {         // ¨
            add(1, 0); add(3, 0)
        }
        function cedilla() {           // ¸ (approché)
            add(2, 7); add(3, 7)
        }

        // é É
        if (code === 233) { base = "e"; acute() }
        else if (code === 201) { base = "E"; acute() }
        // è È
        else if (code === 232) { base = "e"; grave() }
        else if (code === 200) { base = "E"; grave() }
        // ê Ê
        else if (code === 234) { base = "e"; circumflex() }
        else if (code === 202) { base = "E"; circumflex() }
        // ë Ë
        else if (code === 235) { base = "e"; diaeresis() }
        else if (code === 203) { base = "E"; diaeresis() }
        // à À
        else if (code === 224) { base = "a"; grave() }
        else if (code === 192) { base = "A"; grave() }
        // â Â
        else if (code === 226) { base = "a"; circumflex() }
        else if (code === 194) { base = "A"; circumflex() }
        // ä Ä
        else if (code === 228) { base = "a"; diaeresis() }
        else if (code === 196) { base = "A"; diaeresis() }
        // ù Ù
        else if (code === 249) { base = "u"; grave() }
        else if (code === 217) { base = "U"; grave() }
        // û Û
        else if (code === 251) { base = "u"; circumflex() }
        else if (code === 219) { base = "U"; circumflex() }
        // ü Ü
        else if (code === 252) { base = "u"; diaeresis() }
        else if (code === 220) { base = "U"; diaeresis() }
        // î Î
        else if (code === 238) { base = "i"; circumflex() }
        else if (code === 206) { base = "I"; circumflex() }
        // ï Ï
        else if (code === 239) { base = "i"; diaeresis() }
        else if (code === 207) { base = "I"; diaeresis() }
        // ô Ô
        else if (code === 244) { base = "o"; circumflex() }
        else if (code === 212) { base = "O"; circumflex() }
        // ö Ö
        else if (code === 246) { base = "o"; diaeresis() }
        else if (code === 214) { base = "O"; diaeresis() }
        // ç Ç
        else if (code === 231) { base = "c"; cedilla() }
        else if (code === 199) { base = "C"; cedilla() }

        return { base: base, accent: acc }
    }


    // Dessin d'un caractère à l'échelle fontSize (gère les accents)
    function drawChar(x: number, yPage: number, c: string) {
        const comp = decomposeChar(c)
        const baseChar = comp.base
        const accent = comp.accent

        if (fontSize === 1) {
            // chemin optimisé: on écrit 2 pages d'un coup
            command(SSD1306_SETCOLUMNADRESS)
            command(x)
            command(x + 5)
            command(SSD1306_SETPAGEADRESS)
            command(yPage)
            command(yPage + 1)

            // préparer les 6 colonnes (5 de glyphe + 1 espace)
            let cols = pins.createBuffer(6)
            for (let i = 0; i < 6; i++) cols[i] = 0x00
            let charIndex = baseChar.charCodeAt(0)

            for (let col = 0; col < 5; col++) {
                cols[col] = font.getNumber(NumberFormat.UInt8BE, 5 * charIndex + col)
            }

            // ajouter les pixels d'accent
            for (let k = 0; k < accent.length; k++) {
                const a = accent[k]
                if (a.col >= 0 && a.col < 5 && a.row >= 0 && a.row < 8) {
                    cols[a.col] |= (1 << a.row)
                }
            }

            // envoyer
            let line = pins.createBuffer(2)
            line[0] = 0x40
            for (let i = 0; i < 6; i++) {
                line[1] = cols[i]
                pins.i2cWriteBuffer(chipAdress, line, false)
            }
            return
        }

        // Taille > 1 : rendu par liste de pixels
        let pixels: Array<Array<number>> = []
        let baseYpx = yPage * 8 * fontSize
        let charIndex = baseChar.charCodeAt(0)

        // corps de la lettre
        for (let col = 0; col < 5; col++) {
            let bits = font.getNumber(NumberFormat.UInt8BE, 5 * charIndex + col)
            for (let row = 0; row < 8; row++) {
                if ((bits >> row) & 0x01) {
                    let px = x + col * fontSize
                    let py = baseYpx + row * fontSize
                    for (let dx = 0; dx < fontSize; dx++) {
                        for (let dy = 0; dy < fontSize; dy++) {
                            let xx = px + dx
                            let yy = py + dy
                            if (xx >= 0 && xx < displayWidth && yy >= 0 && yy < displayHeight * 8) {
                                pixels.push([xx, yy])
                                if (pixels.length > 60) { drawShape(pixels); pixels = [] }
                            }
                        }
                    }
                }
            }
        }

        // accents
        for (let k = 0; k < accent.length; k++) {
            const a = accent[k]
            if (a.col >= 0 && a.col < 5 && a.row >= 0 && a.row < 8) {
                let px = x + a.col * fontSize
                let py = baseYpx + a.row * fontSize
                for (let dx = 0; dx < fontSize; dx++) {
                    for (let dy = 0; dy < fontSize; dy++) {
                        let xx = px + dx
                        let yy = py + dy
                        if (xx >= 0 && xx < displayWidth && yy >= 0 && yy < displayHeight * 8) {
                            pixels.push([xx, yy])
                            if (pixels.length > 60) { drawShape(pixels); pixels = [] }
                        }
                    }
                }
            }
        }

        if (pixels.length) drawShape(pixels)
    }

    function drawShape(pixels: Array<Array<number>>) {
        if (!pixels.length) return
        let x1 = displayWidth
        let y1 = displayHeight * 8
        let x2 = 0
        let y2 = 0
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i][0] < x1) x1 = pixels[i][0]
            if (pixels[i][0] > x2) x2 = pixels[i][0]
            if (pixels[i][1] < y1) y1 = pixels[i][1]
            if (pixels[i][1] > y2) y2 = pixels[i][1]
        }
        let page1 = Math.floor(y1 / 8)
        let page2 = Math.floor(y2 / 8)
        let line = pins.createBuffer(2)
        line[0] = 0x40
        for (let x = x1; x <= x2; x++) {
            for (let page = page1; page <= page2; page++) {
                line[1] = 0x00
                for (let i = 0; i < pixels.length; i++) {
                    if (pixels[i][0] === x) {
                        if (Math.floor(pixels[i][1] / 8) === page) {
                            line[1] |= Math.pow(2, (pixels[i][1] % 8))
                        }
                    }
                }
                if (line[1] !== 0x00) {
                    command(SSD1306_SETCOLUMNADRESS)
                    command(x)
                    command(x + 1)
                    command(SSD1306_SETPAGEADRESS)
                    command(page)
                    command(page + 1)
                    pins.i2cWriteBuffer(chipAdress, line, false)
                }
            }
        }
    }

    //% block="dessiner ligne de :|x: $x0 y: $y0 vers| x: $x1 y: $y1"
    //% x0.defl=0
    //% y0.defl=0
    //% x1.defl=20
    //% y1.defl=20
    //% weight=1
    export function drawLine(x0: number, y0: number, x1: number, y1: number) {
        let pixels: Array<Array<number>> = []
        let kx: number, ky: number, c: number, i: number
        let targetX = x1
        let targetY = y1
        x1 -= x0; kx = 0; if (x1 > 0) kx = +1; if (x1 < 0) { kx = -1; x1 = -x1; } x1++
        y1 -= y0; ky = 0; if (y1 > 0) ky = +1; if (y1 < 0) { ky = -1; y1 = -y1; } y1++
        if (x1 >= y1) {
            c = x1
            for (i = 0; i < x1; i++, x0 += kx) {
                pixels.push([x0, y0])
                c -= y1; if (c <= 0) { if (i != x1 - 1) pixels.push([x0 + kx, y0]); c += x1; y0 += ky; if (i != x1 - 1) pixels.push([x0, y0]); }
                if (pixels.length > 20) {
                    drawShape(pixels)
                    pixels = []
                    drawLine(x0, y0, targetX, targetY)
                    return
                }
            }
        } else {
            c = y1
            for (i = 0; i < y1; i++, y0 += ky) {
                pixels.push([x0, y0])
                c -= x1; if (c <= 0) { if (i != y1 - 1) pixels.push([x0, y0 + ky]); c += y1; x0 += kx; if (i != y1 - 1) pixels.push([x0, y0]); }
                if (pixels.length > 20) {
                    drawShape(pixels)
                    pixels = []
                    drawLine(x0, y0, targetX, targetY)
                    return
                }
            }
        }
        drawShape(pixels)
    }

    //% block="dessiner rectangle de :|x: $x0 y: $y0 vers| x: $x1 y: $y1"
    //% x0.defl=0
    //% y0.defl=0
    //% x1.defl=20
    //% y1.defl=20
    //% weight=0
    export function drawRectangle(x0: number, y0: number, x1: number, y1: number) {
        drawLine(x0, y0, x1, y0)
        drawLine(x0, y1, x1, y1)
        drawLine(x0, y0, x0, y1)
        drawLine(x1, y0, x1, y1)
    }

    //% block="initialiser OLED largeur $width hauteur $height police $taillePolice"
    //% width.defl=128
    //% height.defl=64
    //% taillePolice.defl=1 taillePolice.min=1 taillePolice.max=3
    //% weight=9
    export function init(width: number, height: number, taillePolice: number) {
        command(SSD1306_DISPLAYOFF);
        command(SSD1306_SETDISPLAYCLOCKDIV);
        command(0x80);                                  // ratio recommandé 0x80
        command(SSD1306_SETMULTIPLEX);
        command(0x3F);
        command(SSD1306_SETDISPLAYOFFSET);
        command(0x0);                                   // pas de décalage
        command(SSD1306_SETSTARTLINE | 0x0);            // ligne #0
        command(SSD1306_CHARGEPUMP);
        command(0x14);
        command(SSD1306_MEMORYMODE);
        command(0x00);                                  // 0x0 comme ks0108
        command(SSD1306_SEGREMAP | 0x1);
        command(SSD1306_COMSCANDEC);
        command(SSD1306_SETCOMPINS);
        command(0x12);
        command(SSD1306_SETCONTRAST);
        command(0xCF);
        command(SSD1306_SETPRECHARGE);
        command(0xF1);
        command(SSD1306_SETVCOMDETECT);
        command(0x40);
        command(SSD1306_DISPLAYALLON_RESUME);
        command(SSD1306_NORMALDISPLAY);
        command(SSD1306_DISPLAYON);

        displayWidth = width
        displayHeight = height / 8
        screenSize = displayWidth * displayHeight
        fontSize = Math.max(1, Math.min(3, Math.floor(taillePolice)))
        charX = xOffset
        charY = yOffset

        font = hex`
    0000000000
    3E5B4F5B3E
    3E6B4F6B3E
    1C3E7C3E1C
    183C7E3C18
    1C577D571C
    1C5E7F5E1C
    00183C1800
    FFE7C3E7FF
    0018241800
    FFE7DBE7FF
    30483A060E
    2629792926
    407F050507
    407F05253F
    5A3CE73C5A
    7F3E1C1C08
    081C1C3E7F
    14227F2214
    5F5F005F5F
    06097F017F
    006689956A
    6060606060
    94A2FFA294
    08047E0408
    10207E2010
    08082A1C08
    081C2A0808
    1E10101010
    0C1E0C1E0C
    30383E3830
    060E3E0E06
    0000000000
    00005F0000
    0007000700
    147F147F14
    242A7F2A12
    2313086462
    3649562050
    0008070300
    001C224100
    0041221C00
    2A1C7F1C2A
    08083E0808
    0080703000
    0808080808
    0000606000
    2010080402
    3E5149453E
    00427F4000
    7249494946
    2141494D33
    1814127F10
    2745454539
    3C4A494931
    4121110907
    3649494936
    464949291E
    0000140000
    0040340000
    0008142241
    1414141414
    0041221408
    0201590906
    3E415D594E
    7C1211127C
    7F49494936
    3E41414122
    7F4141413E
    7F49494941
    7F09090901
    3E41415173
    7F0808087F
    00417F4100
    2040413F01
    7F08142241
    7F40404040
    7F021C027F
    7F0408107F
    3E4141413E
    7F09090906
    3E4151215E
    7F09192946
    2649494932
    03017F0103
    3F4040403F
    1F2040201F
    3F4038403F
    6314081463
    0304780403
    6159494D43
    007F414141
    0204081020
    004141417F
    0402010204
    4040404040
    0003070800
    2054547840
    7F28444438
    3844444428
    384444287F
    3854545418
    00087E0902
    18A4A49C78
    7F08040478
    00447D4000
    2040403D00
    7F10284400
    00417F4000
    7C04780478
    7C08040478
    3844444438
    FC18242418
    18242418FC
    7C08040408
    4854545424
    04043F4424
    3C4040207C
    1C2040201C
    3C4030403C
    4428102844
    4C9090907C
    4464544C44
    0008364100
    0000770000
    0041360800
    0201020402
    3C2623263C
    1EA1A16112
    3A4040207A
    3854545559
    2155557941
    2154547841
    2155547840
    2054557940
    0C1E527212
    3955555559
    3954545459
    3955545458
    0000457C41
    0002457D42
    0001457C40
    F0292429F0
    F0282528F0
    7C54554500
    2054547C54
    7C0A097F49
    3249494932
    3248484832
    324A484830
    3A4141217A
    3A42402078
    009DA0A07D
    3944444439
    3D4040403D
    3C24FF2424
    487E494366
    2B2FFC2F2B
    FF0929F620
    C0887E0903
    2054547941
    0000447D41
    3048484A32
    384040227A
    007A0A0A72
    7D0D19317D
    2629292F28
    2629292926
    30484D4020
    3808080808
    0808080838
    2F10C8ACBA
    2F102834FA
    00007B0000
    08142A1422
    22142A1408
    AA005500AA
    AA55AA55AA
    000000FF00
    101010FF00
    141414FF00
    1010FF00FF
    1010F010F0
    141414FC00
    1414F700FF
    0000FF00FF
    1414F404FC
    141417101F
    10101F101F
    1414141F00
    101010F000
    0000001F10
    1010101F10
    101010F010
    000000FF10
    1010101010
    101010FF10
    000000FF14
    0000FF00FF
    00001F1017
    0000FC04F4
    1414171017
    1414F404F4
    0000FF00F7
    1414141414
    1414F700F7
    1414141714
    10101F101F
    141414F414
    1010F010F0
    00001F101F
    0000001F14
    000000FC14
    0000F010F0
    1010FF10FF
    141414FF14
    1010101F00
    000000F010
    FFFFFFFFFF
    F0F0F0F0F0
    FFFFFF0000
    000000FFFF
    0F0F0F0F0F
    3844443844
    7C2A2A3E14
    7E02020606
    027E027E02
    6355494163
    3844443C04
    407E201E20
    06027E0202
    99A5E7A599
    1C2A492A1C
    4C7201724C
    304A4D4D30
    3048784830
    BC625A463D
    3E49494900
    7E0101017E
    2A2A2A2A2A
    44445F4444
    40514A4440
    40444A5140
    0000FF0103
    E080FF0000
    08086B6B08
    3612362436
    060F090F06
    0000181800
    0000101000
    3040FF0101
    001F01011E
    00191D1712
    003C3C3C3C
    0000000000`
        loadStarted = false
        loadPercent = 0
        clear()
    }
}
