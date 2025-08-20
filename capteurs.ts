/**
 * Capteurs de lumière — un seul bloc : choisir la référence et la broche → % (0–100)
 */
//% color=#00C0C0 icon="\uf185" block="Capteurs"
//% groups=["Lumière"]
namespace capteurs {

    /**
     * Références de capteurs de lumière disponibles
     */
    export enum RefLumiere {
        //% block="LDR + 10kΩ (GL5528)"
        LDR_10k_GL5528 = 0,
        //% block="LDR + 100kΩ"
        LDR_100k = 1,
        //% block="TEMT6000 (analogique)"
        TEMT6000 = 2,
        //% block="KY-018 (photorésistance)"
        KY018 = 3
    }

    // ---------- outils internes ----------
    function clamp(n: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, n))
    }

    function mapToPercent(adc: number, noir: number, clair: number): number {
        const a = Math.min(noir, clair)
        const b = Math.max(noir, clair)
        if (b - a <= 0) return 0
        // pourcentage 0..100 (arrondi)
        const pct = Math.round((adc - a) * 100 / (b - a))
        return clamp(pct, 0, 100)
    }

    // Calibrages internes (0..1023) — pas visibles par les élèves
    function noirClair(ref: RefLumiere): number[] {
        switch (ref) {
            case RefLumiere.LDR_100k: return [50, 1000]
            case RefLumiere.TEMT6000: return [0, 900]
            case RefLumiere.KY018: return [20, 900]
            default /* LDR_10k_GL5528 */: return [80, 900]
        }
    }

    /**
     * 💡 Lire la lumière en % (0–100) — choisir la broche et la référence du capteur
     * (le calibrage est géré automatiquement en interne)
     */
    //% block="💡 lumière en %% sur %broche | capteur %ref"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% broche.defl=AnalogPin.P1
    //% ref.defl=RefLumiere.LDR_10k_GL5528
    //% group="Lumière"
    export function luminositePourcent(broche: AnalogPin, ref: RefLumiere): number {
        const adc = pins.analogReadPin(broche)  // 0..1023
        const nc = noirClair(ref)               // [noir, clair] selon la référence
        return mapToPercent(adc, nc[0], nc[1])  // renvoie 0..100
    }
}
