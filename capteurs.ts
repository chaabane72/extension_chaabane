/**
 * Module pour lire les capteurs : température et lumière
 */
//% color=#00C0C0 icon="\uf2c9" block="Capteurs"
//% groups=["Température", "Lumière", "Générique"]
namespace capteurs {

    // ----------- outils internes (non visibles en blocs) -----------
    function adcVersVolt(adc: number): number {
        return (adc * 3.3) / 1023
    }

    function clamp(n: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, n))
    }

    // ----------- TEMPÉRATURE -----------

    /**
     * 🌡️ Température (°C) avec un capteur TMP36
     * Formule constructeur : Vout = 0,5 V + 10 mV/°C × T
     */
    //% block="🌡️ TMP36 °C sur %broche"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% group="Température"
    export function temperatureTMP36(broche: AnalogPin): number {
        const v = adcVersVolt(pins.analogReadPin(broche))
        const t = (v - 0.5) * 100
        return clamp(Math.round(t), -40, 125)
    }

    /**
     * 🌡️ Température (°C) avec un capteur LM35
     * Formule constructeur : Vout = 10 mV/°C × T
     */
    //% block="🌡️ LM35 °C sur %broche"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% group="Température"
    export function temperatureLM35(broche: AnalogPin): number {
        const v = adcVersVolt(pins.analogReadPin(broche))
        const t = v * 100
        return clamp(Math.round(t), 0, 150)
    }

    // ----------- LUMIÈRE -----------

    /**
     * 💡 Luminosité brute (0..1023) avec LDR (photorésistance)
     */
    //% block="💡 lumière brute sur %broche (0–1023)"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% group="Lumière"
    export function lumiereBrute(broche: AnalogPin): number {
        return pins.analogReadPin(broche)
    }

    /**
     * 💡 Luminosité en pourcentage (0–100) avec LDR + calibration
     * noir = valeur mesurée dans l'obscurité ; clair = valeur en pleine lumière
     */
    //% block="💡 lumière % sur %broche | noir %noir | clair %clair"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% noir.min=0 noir.max=1023 noir.defl=100
    //% clair.min=0 clair.max=1023 clair.defl=900
    //% group="Lumière"
    export function lumierePourcent(broche: AnalogPin, noir: number, clair: number): number {
        const x = pins.analogReadPin(broche)
        const a = Math.min(noir, clair)
        const b = Math.max(noir, clair)
        // map linéaire vers 0..100
        let pct = 0
        if (b - a > 0) pct = (x - a) * 100 / (b - a)
        return clamp(Math.round(pct), 0, 100)
    }

    // ----------- GÉNÉRIQUE (linéaire) -----------

    /**
     * 📏 Convertir une lecture analogique en unité via une loi linéaire
     * Donne : unité = (Vout - offsetV) / (penteVparUnite)
     * (ex : pour TMP36, offsetV=0.5 et pente=0.01)
     */
    //% block="📏 convertir sur %broche | offset %offsetV V | pente %penteVparUnite V/unité"
    //% inlineInputMode=inline
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% offsetV.defl=0 penteVparUnite.defl=1
    //% group="Générique"
    export function analogiqueVersUnite(
        broche: AnalogPin,
        offsetV: number,
        penteVparUnite: number
    ): number {
        const v = adcVersVolt(pins.analogReadPin(broche))
        if (penteVparUnite == 0) return 0
        return (v - offsetV) / penteVparUnite
    }
}
