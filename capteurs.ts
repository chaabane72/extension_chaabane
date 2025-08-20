/**
 * Capteurs de lumière (LDR, TEMT6000…) pour micro:bit
 */
//% color=#00C0C0 icon="\uf185" block="Capteurs"
//% groups=["Lumière", "Calibration"]
namespace capteurs {

    // ----------- LISTE DES CAPTEURS -----------

    /**
     * Types de capteurs de lumière supportés
     */
    export enum TypeCapteurLumiere {
        //% block="LDR + 10kΩ (GL5528)"
        LDR_10k = 0,
        //% block="LDR + 100kΩ"
        LDR_100k = 1,
        //% block="TEMT6000 (analogique)"
        TEMT6000 = 2
    }

    /**
     * Unité de sortie
     */
    export enum UniteLum {
        //% block="brut (0–1023)"
        Brut = 0,
        //% block="% (0–100)"
        Pourcent = 1
    }

    // ----------- CALIBRATIONS PAR DÉFAUT -----------

    // Valeurs "noir" (obscurité) et "clair" (pleine lumière) par type (0..1023)
    let _noir_LDR10k = 80
    let _clair_LDR10k = 900

    let _noir_LDR100k = 50
    let _clair_LDR100k = 1000

    let _noir_TEMT6000 = 0
    let _clair_TEMT6000 = 900

    // ----------- OUTILS INTERNES -----------

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
        // défaut
        return [_noir_LDR10k, _clair_LDR10k]
    }

    // ----------- MESURE -----------

    /**
     * 💡 Mesurer la lumière avec un capteur choisi (brut ou %)
     * - Brut = 0..1023 (lecture ADC)
     * - % = mappé entre 'noir' et 'clair' (selon le type)
     */
    //% block="💡 lumière sur %broche capteur %type en %unite"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% type.defl=TypeCapteurLumiere.LDR_10k
    //% unite.defl=UniteLum.Pourcent
    //% group="Lumière"
    export function mesurerLumiere(
        broche: AnalogPin,
        type: TypeCapteurLumiere,
        unite: UniteLum
    ): number {
        const adc = pins.analogReadPin(broche) // 0..1023
        if (unite == UniteLum.Brut) {
            return adc
        } else {
            const nc = getNoirClair(type)
            return mapToPercent(adc, nc[0], nc[1])
        }
    }

    // ----------- CALIBRATION (OPTIONNEL) -----------

    /**
     * 🔧 Recalibrer les valeurs 'noir' et 'clair' pour un type de capteur
     * - noir = lecture en obscurité
     * - clair = lecture en pleine lumière
     */
    //% block="🔧 calibrer %type noir %noir clair %clair"
    //% inlineInputMode=inline
    //% noir.min=0 noir.max=1023 noir.defl=100
    //% clair.min=0 clair.max=1023 clair.defl=900
    //% group="Calibration"
    export function calibrerLumiere(type: TypeCapteurLumiere, noir: number, clair: number): void {
        const n = clamp(noir, 0, 1023)
        const c = clamp(clair, 0, 1023)
        if (type == TypeCapteurLumiere.LDR_100k) { _noir_LDR100k = n; _clair_LDR100k = c; return }
        if (type == TypeCapteurLumiere.TEMT6000) { _noir_TEMT6000 = n; _clair_TEMT6000 = c; return }
        _noir_LDR10k = n; _clair_LDR10k = c
    }
}
