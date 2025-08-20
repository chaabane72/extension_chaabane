/**
 * RC522 (MFRC522) RFID via SPI pour micro:bit
 * Blocs simples : init, présent ?, lire UID (hex)
 * Câblage : 3V/GND, SCK→P13, MISO→P14, MOSI→P15, SDA(CS)→P16, RST→P8
 */
//% color=#2E86C1 icon="\uf2c2" block="RFID RC522"
//% groups=["Initialisation","Lecture"]
namespace rc522 {

    // ---- Registres / commandes minimales du MFRC522 ----
    const CommandReg = 0x01
    const ComIEnReg = 0x02
    const DivIEnReg = 0x03
    const ComIrqReg = 0x04
    const DivIrqReg = 0x05
    const ErrorReg = 0x06
    const Status2Reg = 0x08
    const FIFODataReg = 0x09
    const FIFOLevelReg = 0x0A
    const ControlReg = 0x0C
    const BitFramingReg = 0x0D
    const ModeReg = 0x11
    const TxModeReg = 0x12
    const RxModeReg = 0x13
    const TxControlReg = 0x14
    const TxASKReg = 0x15
    const CRCResultRegH = 0x21
    const CRCResultRegL = 0x22
    const TModeReg = 0x2A
    const TPrescalerReg = 0x2B
    const TReloadRegH = 0x2C
    const TReloadRegL = 0x2D
    const VersionReg = 0x37

    const PCD_Idle = 0x00
    const PCD_CalcCRC = 0x03
    const PCD_Transceive = 0x0C
    const PCD_SoftReset = 0x0F

    // Commandes PICC (cartes)
    const PICC_REQA = 0x26
    const PICC_ANTICOLL_CL1 = 0x93
    const PICC_ANTICOLL = 0x20
    const PICC_SELECT_CL1 = 0x93
    // const PICC_HALT = 0x50 // (non utilisé ici)

    let _cs: DigitalPin
    let _rst: DigitalPin
    let _inited = false

    // ---- SPI bas niveau ----
    function writeReg(addr: number, val: number) {
        pins.digitalWritePin(_cs, 0)
        pins.spiWrite((addr << 1) & 0x7E)   // écriture
        pins.spiWrite(val & 0xFF)
        pins.digitalWritePin(_cs, 1)
    }
    function readReg(addr: number): number {
        pins.digitalWritePin(_cs, 0)
        pins.spiWrite(((addr << 1) & 0x7E) | 0x80) // lecture
        const v = pins.spiWrite(0)
        pins.digitalWritePin(_cs, 1)
        return v
    }
    function setBitMask(addr: number, mask: number) {
        writeReg(addr, readReg(addr) | mask)
    }
    function clearBitMask(addr: number, mask: number) {
        writeReg(addr, readReg(addr) & (~mask))
    }
    function antennaOn() {
        const v = readReg(TxControlReg)
        if ((v & 0x03) == 0) writeReg(TxControlReg, v | 0x03)
    }

    // ---- Reset & config de base ----
    function softReset() {
        writeReg(CommandReg, PCD_SoftReset)
        basic.pause(50)
        // attendre que le chip réponde
        for (let i = 0; i < 20; i++) {
            const ver = readReg(VersionReg)
            if (ver != 0x00 && ver != 0xFF) break
            basic.pause(5)
        }
    }

    // ---- CRC & Transceive ----
    function calcCRC(data: number[]): number[] {
        writeReg(CommandReg, PCD_Idle)
        writeReg(DivIrqReg, 0x04)      // clear CRCIRq
        writeReg(FIFOLevelReg, 0x80)   // flush FIFO
        for (let b of data) writeReg(FIFODataReg, b)
        writeReg(CommandReg, PCD_CalcCRC)
        // attendre CRC prêt
        for (let i = 0; i < 100; i++) {
            if (readReg(DivIrqReg) & 0x04) break
        }
        const crcL = readReg(CRCResultRegL)
        const crcH = readReg(CRCResultRegH)
        return [crcL, crcH]
    }

    function transceive(send: number[], bitFraming: number = 0x00): number[] {
        writeReg(CommandReg, PCD_Idle)
        writeReg(ComIrqReg, 0x7F)        // clear IRQs
        writeReg(FIFOLevelReg, 0x80)     // flush FIFO
        writeReg(BitFramingReg, bitFraming & 0x07) // LSB = TxLastBits

        for (let b of send) writeReg(FIFODataReg, b)
        writeReg(CommandReg, PCD_Transceive)
        setBitMask(BitFramingReg, 0x80)  // StartSend

        // attendre RxIRq(0x20) ou IdleIrq(0x10)
        let timeout = 0
        while (timeout++ < 200) {
            const irq = readReg(ComIrqReg)
            if (irq & 0x30) break
        }
        clearBitMask(BitFramingReg, 0x80) // stop send

        // erreurs ?
        const err = readReg(ErrorReg)
        if (err & 0x1B) return [] // BufferOvfl, ParityErr, ProtocolErr

        // lire FIFO
        const n = readReg(FIFOLevelReg)
        const out: number[] = []
        for (let j = 0; j < n; j++) out.push(readReg(FIFODataReg))
        return out
    }

    // ---- Détection + anticollision + select ----
    function requestREQA(): boolean {
        // REQA est un cadre 7 bits → BitFramingReg = 0x07
        const resp = transceive([PICC_REQA], 0x07)
        return resp.length >= 2 // ATQA = 2 octets si carte présente
    }

    function anticollisionCL1(): number[] {
        // 0x93 0x20 → anticollision niveau 1
        const resp = transceive([PICC_ANTICOLL_CL1, PICC_ANTICOLL])
        // réponse : 5 octets = 4 UID + BCC
        if (resp.length >= 5) return resp.slice(0, 5)
        return []
    }

    function selectCL1(uid5: number[]): boolean {
        // 0x93 0x70 + (UID[0..3] + BCC) + CRC_A
        const frame = [PICC_SELECT_CL1, 0x70].concat(uid5)
        const crc = calcCRC(frame)
        const resp = transceive(frame.concat(crc))
        // SAK 1 octet attendu (on ne vérifie pas la valeur finement ici)
        return resp.length >= 1
    }

    function toHex(arr: number[], sep?: string): string {
        sep = sep || ""
        const HEX = "0123456789ABCDEF"
        let s = ""
        for (let b of arr) {
            s += HEX[(b >> 4) & 0xF] + HEX[b & 0xF] + sep
        }
        return sep ? s.slice(0, -sep.length) : s
    }

    // =================== BLOCS ===================

    /**
     * Initialiser le RC522 (SPI) — MOSI P15, MISO P14, SCK P13, CS P16, RST P8
     */
    //% block="📡 initialiser RC522 | CS %cs | RST %rst"
    //% cs.defl=DigitalPin.P16 rst.defl=DigitalPin.P8
    //% group="Initialisation"
    export function initialiser(cs: DigitalPin, rst: DigitalPin): void {
        _cs = cs; _rst = rst
        // SPI matériel du micro:bit : MOSI P15, MISO P14, SCK P13
        pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
        pins.spiFrequency(1000000) // 1 MHz

        // lignes de contrôle
        pins.digitalWritePin(_cs, 1)   // CS inactif (haut)
        pins.digitalWritePin(_rst, 1)  // RST au repos

        // reset + configuration de base
        softReset()
        writeReg(TModeReg, 0x8D)
        writeReg(TPrescalerReg, 0x3E)
        writeReg(TReloadRegL, 30)
        writeReg(TReloadRegH, 0)
        writeReg(TxASKReg, 0x40)   // 100% ASK
        writeReg(ModeReg, 0x3D)    // CRC init 0x6363
        antennaOn()
        _inited = true
    }

    /**
     * Une carte est-elle présente sur le lecteur ?
     */
    //% block="🔎 carte présente ?"
    //% group="Lecture"
    export function cartePresente(): boolean {
        if (!_inited) return false
        return requestREQA()
    }

    /**
     * Lire l'UID (hex) — 4 octets (MIFARE classique)
     */
    //% block="🆔 lire UID (hex)"
    //% group="Lecture"
    export function lireUIDhex(): string {
        if (!_inited) return ""
        if (!requestREQA()) return ""
        const uid5 = anticollisionCL1()        // UID0..3 + BCC
        if (uid5.length < 5) return ""
        selectCL1(uid5)                        // (sélection basique)
        return toHex(uid5.slice(0, 4))         // renvoie 4 octets UID (sans BCC)
    }
}
