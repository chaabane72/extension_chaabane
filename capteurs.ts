/**
 * Capteurs de lumière — choix du capteur dans le bloc, mesure en %
 */
//% color=#00C0C0 icon="\uf185" block="Capteurs"
//% groups=["Lumière"]
namespace capteurs {

    /**
     * Types de capteurs de lumière (sélection dans le bloc)
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

    // ---- Calibrations par défaut (interne) : 0..1023 → 0..100 %
    // (valeurs empiriques simples pour éviter un bloc de calibration)
    let _noir_LDR10k = 80
    let _clair_LDR10k = 900

    let _noir_LDR100k = 50
    let _clair_LDR100k = 1000

    let _noir_TEMT6000 = 0
    let _clair_TEMT6000 = 900

    let _noir_KY018 = 20
    let _clair_KY018 = 900

    // ---- Outils internes
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

    /**
     * 💡 Lire la lumière en % (0–100) — choisir la broche et le capteur
     * (calibrage automatique interne selon le capteur choisi)
     */
    //% block="💡 lumière (%) sur %broche capteur %type"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% type.defl=TypeCapteurLumiere.LDR_10k_GL5528
    //% group="Lumière"
    export function lumierePourcentSimple(broche: AnalogPin, type: TypeCapteurLumiere): number {
        const adc = pins.analogReadPin(broche) // 0..1023
        const nc = getNoirClair(type)
        return mapToPercent(adc, nc[0], nc[1]) // retourne 0..100
    }

    /**
     * 💡 (optionnel) Lire la lumière brute (0–1023) — utile si tu veux montrer l'ADC
     */
    //% block="💡 lumière brute (0–1023) sur %broche"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% group="Lumière"
    export function lumiereBrute(broche: AnalogPin): number {
        return pins.analogReadPin(broche)
    }
}
