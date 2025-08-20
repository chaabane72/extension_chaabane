/**
 * Capteurs de lumière — choix du capteur dans le bloc, mesure en %
 */
//% color=#00C0C0 icon="\uf185" block="Capteurs"
//% groups=["Lumière"]
namespace capteurs {

    /**
     * Types de capteurs de lumière disponibles
     */
    export enum TypeCapteurLumiere {
        //% block="LDR + 10kΩ (GL5528)"
        LDR_10k_GL5528 = 0,
        //% block="LDR + 100kΩ"
        LDR_100k = 1,
        //% block="TEMT6000 (analogique)"
        TEMT6000 = 2,
        //% block="KY-018 (photorésistance)"
        KY018 = 3
    }

    // -------- Calibrations internes (0..1023) pour obtenir 0..100 % --------
    // Ces valeurs sont fixées dans le code pour éviter aux élèves de calibrer.
    let _noir_LDR10k = 80
    let _clair_LDR10k = 900

    let _noir_LDR100k = 50
    let _clair_LDR100k = 1000

    let _noir_TEMT6000 = 0
    let _clair_TEMT6000 = 900

    let _noir_KY018 = 20
    let _clair_KY018 = 900

    // --------------------------- Outils internes ---------------------------
    function clamp(n: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, n))
    }

    function mapToPercent(x: number, a: number, b: number): number {
        const low = Math.min(a, b)
        const high = Math.max(a, b)
        if (high - low <= 0) return 0
        const pct = Math.idiv((x - low) * 100, (high - low))
        return clamp(pct, 0, 100)
    }

    function getNoirClair(t: TypeCapteurLumiere): number[] {
        if (t == TypeCapteurLumiere.LDR_100k) return [_noir_LDR100k, _clair_LDR100k]
        if (t == TypeCapteurLumiere.TEMT6000) return [_noir_TEMT6000, _clair_TEMT6000]
        if (t == TypeCapteurLumiere.KY018) return [_noir_KY018, _clair_KY018]
        // défaut
        return [_noir_LDR10k, _clair_LDR10k]
    }

    // ------------------------------ BLOCS ----------------------------------

    /**
     * 💡 Lire la lumière en % (0–100). L'élève choisit la broche et le capteur.
     * La calibration est gérée automatiquement dans le code selon le capteur.
     */
    //% block="💡 lumière en %% sur %broche capteur %type"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% type.defl=TypeCapteurLumiere.LDR_10k_GL5528
    //% group="Lumière"
    export function lumierePourcent(broche: AnalogPin, type: TypeCapteurLumiere): number {
        const adc = pins.analogReadPin(broche) // 0..1023
        const nc = getNoirClair(type)          // [noir, clair] adaptés au capteur
        return mapToPercent(adc, nc[0], nc[1]) // renvoie 0..100
    }

    /**
     * 💡 Lire la lumière brute (0–1023) — utile pour vérifier le montage
     */
    //% block="💡 lumière brute (0–1023) sur %broche"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% group="Lumière"
    export function lumiereBrute(broche: AnalogPin): number {
        return pins.analogReadPin(broche)
    }
}
