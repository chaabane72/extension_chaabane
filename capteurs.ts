/**
 * Module pour lire les capteurs : température et lumière
 */
//% color=#00C0C0 icon="\uf2c9" block="Capteurs"
//% groups=["Température", "Lumière"]
namespace capteurs {

    // ---------- GROUPE : Température ----------

    /**
     * Lit la température approximative à partir d'un capteur analogique
     * @param broche la broche connectée au capteur, eg: AnalogPin.P1
     * @returns température en degrés Celsius (approximative)
     */
    //% block="température sur %broche (approx.)"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% group="Température"
    export function lireTemperature(broche: AnalogPin): number {
        let valeur = pins.analogReadPin(broche)
        let tension = valeur * 3.3 / 1023 // conversion en tension (en V)
        let temperature = (tension - 0.5) * 100 // approximation pour TMP36
        return Math.round(temperature)
    }

    // ---------- GROUPE : Lumière ----------

    /**
     * Lit l'intensité lumineuse à partir d'une photorésistance
     * @param broche la broche connectée au capteur, eg: AnalogPin.P2
     * @returns un nombre entre 0 (obscurité) et 1023 (très lumineux)
     */
    //% block="lumière sur %broche"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
    //% group="Lumière"
    export function lireLuminosite(broche: AnalogPin): number {
        return pins.analogReadPin(broche)
    }
}
