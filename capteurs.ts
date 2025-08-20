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

    // --- calibrages internes (0..1023) — rien à régler pour les élèves
    function noirClair(ref: RefLumiere): number[] {
        switch (ref) {
            case RefLumiere.LDR_100k: return [50, 1000]
            case RefLumiere.TEMT6000: return [0, 900]
            case RefLumiere.KY018: return [20, 900]
            default /* LDR_10k_GL5528 */: return [80, 900]
        }
    }

    function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }

    function mapToPercent(adc: number, a: number, b: number): number {
        const low = Math.min(a, b), high = Math.max(a, b)
        if (high - low <= 0) return 0
        return clamp(Math.round((adc - low) * 100 / (high - low)), 0, 100)
    }

    /**
     * 💡 Lire la lumière en % (0–100) — choisir la broche et la référence du capteur
     * (calibré automatiquement en interne)
     */
    //% block="💡 lumière en %% sur %pin capteur %ref"
    //% inlineInputMode=inline
    //% pin.defl=AnalogPin.P1
    //% ref.defl=RefLumiere.LDR_10k_GL5528
    //% group="Lumière"
    export function luminositePourcent(pin: AnalogPin, ref: RefLumiere): number {
        const adc = pins.analogReadPin(pin)     // 0..1023
        const [noir, clair] = noirClair(ref)    // seuils selon la référence
        return mapToPercent(adc, noir, clair)   // 0..100
    }
}
