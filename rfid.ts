/**
 * Module pour lire des badges RFID UART (RDM6300 / EM4100)
 */
//% color=#2E86C1 icon="\uf2c2" block="RFID"
//% groups=["Lecteur", "Lecture", "Événements", "Aide"]
namespace rfid {

    // ---------- CONSTANTES & ÉTAT INTERNE ----------
    const EVT_SRC = 3100
    const EVT_NEW_TAG = 1

    let _initialise = false
    let _lastHex = ""
    let _lastDec = 0
    let _hasNew = false
    let _buffer = ""

    /**
     * Format de l'identifiant à renvoyer
     */
    //% blockNamespace=rfid
    export enum FormatID {
        //% block="hexadécimal"
        Hex = 0,
        //% block="décimal"
        Dec = 1
    }

    // ---------- OUTILS INTERNES ----------

    // convertit 10 caractères hex (5 octets) en entier décimal (32 bits)
    function hex10ToDec(hex10: string): number {
        // tronque/sécurise
        if (!hex10) return 0
        hex10 = hex10.trim().toUpperCase()
        if (hex10.length > 10) hex10 = hex10.substr(0, 10)
        let val = 0
        for (let i = 0; i < hex10.length; i++) {
            const c = hex10.charCodeAt(i)
            let n = 0
            if (c >= 48 && c <= 57) n = c - 48                 // 0-9
            else if (c >= 65 && c <= 70) n = 10 + (c - 65)      // A-F
            else continue
            val = (val << 4) | n
        }
        return val
    }

    // Calcule le checksum XOR des 5 octets de données (en binaire),
    // et compare au checksum ASCII (2 hex) fourni par le lecteur.
    function checksumOk(data10Hex: string, checksum2Hex: string): boolean {
        if (data10Hex.length != 10 || checksum2Hex.length != 2) return false
        let xor = 0
        for (let i = 0; i < 10; i += 2) {
            const byteHex = data10Hex.substr(i, 2)
            const b = hex10ToDec(byteHex) & 0xFF
            xor ^= b
        }
        const chk = hex10ToDec(checksum2Hex) & 0xFF
        return xor == chk
    }

    // Essaie d'extraire une trame RDM6300 complète depuis _buffer
    // Trame : 0x02 + 10 HEX (ID) + 2 HEX (CHK) + 0x03
    function tryParseFrames(): void {
        const STX = String.fromCharCode(0x02)
        const ETX = String.fromCharCode(0x03)

        while (true) {
            const s = _buffer.indexOf(STX)
            if (s < 0) {
                // pas de début -> si trop long, on garde la fin
                if (_buffer.length > 64) _buffer = _buffer.substr(_buffer.length - 32)
                return
            }
            // on ne garde que depuis STX
            if (s > 0) _buffer = _buffer.substr(s)

            const e = _buffer.indexOf(ETX, 1)
            if (e < 0) {
                // pas encore la fin de trame
                return
            }

            const frame = _buffer.slice(1, e) // entre STX et ETX
            // après extraction, on coupe le buffer pour chercher d'autres trames éventuelles
            _buffer = _buffer.slice(e + 1)

            // frame attendue = 12 caractères ASCII hex (10 data + 2 checksum)
            if (frame.length >= 12) {
                const data = frame.substr(0, 10)
                const chk = frame.substr(10, 2)
                // vérifie que data/chk ne contiennent que [0-9A-Fa-f]
                if (onlyHex(frame.substr(0, 12)) && checksumOk(data, chk)) {
                    const hexId = data.toUpperCase()
                    const decId = hex10ToDec(hexId)
                    if (hexId != _lastHex) {
                        _lastHex = hexId
                        _lastDec = decId
                        _hasNew = true
                        control.raiseEvent(EVT_SRC, EVT_NEW_TAG)
                    }
                }
            }
            // boucle pour chercher d'autres trames
        }
    }

    function onlyHex(s: string): boolean {
        for (let i = 0; i < s.length; i++) {
            const c = s.charCodeAt(i)
            const isNum = c >= 48 && c <= 57
            const isAF = (c >= 65 && c <= 70) || (c >= 97 && c <= 102)
            if (!(isNum || isAF)) return false
        }
        return true
    }

    // boucle de lecture en arrière-plan
    function startReaderLoop(): void {
        control.inBackground(function () {
            while (true) {
                // lit ce qui est disponible (peut être vide)
                const chunk = serial.readString()
                if (chunk && chunk.length > 0) {
                    _buffer = _buffer + chunk
                    tryParseFrames()
                }
                basic.pause(10)
            }
        })
    }

    // ---------- GROUPE : Lecteur ----------

    /**
     * Démarre le lecteur RFID (UART) sur les broches choisies
     * @param rx broche RX du micro:bit (reliée au TX du module RFID)
     * @param tx broche TX du micro:bit (souvent inutilisée par ces lecteurs)
     * @param baud débit série du module, eg: BaudRate.BaudRate9600
     */
    //% block="📡 démarrer le RFID | RX %rx | TX %tx | à %baud"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=4
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=4
    //% baud.defl=BaudRate.BaudRate9600
    //% group="Lecteur"
    export function demarrer(rx: SerialPin, tx: SerialPin, baud: BaudRate): void {
        serial.redirect(tx, rx, baud)
        serial.setRxBufferSize(64)
        _initialise = true
        // vide l'état
        _buffer = ""
        _lastHex = ""
        _lastDec = 0
        _hasNew = false
        startReaderLoop()
    }

    /**
     * Est-ce qu'un badge vient d'être détecté ?
     */
    //% block="🔎 un nouveau badge a été détecté ?"
    //% group="Lecture"
    export function nouveauBadge(): boolean {
        return _hasNew
    }

    /**
     * Renvoie l'identifiant du dernier badge détecté
     * @param format format de l'identifiant (hex ou décimal)
     */
    //% block="🆔 obtenir l'ID du dernier badge en %format"
    //% format.defl=FormatID.Hex
    //% group="Lecture"
    export function idDernierBadge(format: FormatID): string {
        if (!_initialise) return ""
        _hasNew = false
        return format == FormatID.Dec ? ("" + _lastDec) : _lastHex
    }

    /**
     * Attend qu'un badge soit lu et renvoie son ID
     * @param format format de l'identifiant (hex ou décimal)
     */
    //% block="⏳ attendre un badge et renvoyer l'ID en %format"
    //% format.defl=FormatID.Hex
    //% group="Lecture"
    export function attendreBadge(format: FormatID): string {
        if (!_initialise) return ""
        // si on a déjà un nouveau badge en attente
        if (_hasNew) {
            _hasNew = false
            return format == FormatID.Dec ? ("" + _lastDec) : _lastHex
        }
        // sinon on attend l'événement
        control.waitForEvent(EVT_SRC, EVT_NEW_TAG)
        _hasNew = false
        return format == FormatID.Dec ? ("" + _lastDec) : _lastHex
    }

    /**
     * Compare l'ID du dernier badge avec une valeur donnée
     * @param id l'identifiant à comparer (hex sans espaces, ou décimal si sélectionné)
     * @param format format attendu pour la comparaison
     */
    //% block="🧪 l'ID du dernier badge est égal à %id en %format ?"
    //% group="Lecture"
    export function idEgalA(id: string, format: FormatID): boolean {
        if (!_initialise) return false
        const courant = format == FormatID.Dec ? ("" + _lastDec) : _lastHex
        // normalise hex en majuscules
        if (format == FormatID.Hex) {
            return courant.toUpperCase() == id.trim().toUpperCase()
        } else {
            return courant.trim() == id.trim()
        }
    }

    // ---------- GROUPE : Événements ----------

    /**
     * Événement déclenché lorsqu'un badge RFID est détecté
     */
    //% block="📣 lorsqu'un badge est détecté"
    //% draggableParameters=reporter
    //% group="Événements"
    export function onBadgeDetecte(handler: (idHex: string) => void): void {
        control.onEvent(EVT_SRC, EVT_NEW_TAG, function () {
            // on passe l'ID hexadécimal par défaut au callback
            _hasNew = false
            handler(_lastHex)
        })
    }

    // ---------- GROUPE : Aide ----------

    /**
     * Affiche rapidement l'ID lu sur l'écran LED (partie basse en base 16)
     * Utile en débogage pour voir si la lecture fonctionne
     */
    //% block="🧰 afficher rapidement l'ID (hex) sur l'écran"
    //% group="Aide"
    export function debugAfficherID(): void {
        if (!_initialise || _lastHex.length == 0) return
        basic.showString(_lastHex)
    }
}
