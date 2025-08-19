/**
 * Module pour contrôler les actionneurs : LEDs et moteurs
 */
//% color=#FF8000 icon="\uf205" block="Actionneurs"
//% groups=["LEDs", "Moteurs"]
namespace actionneurs {

    // ---------- GROUPE : LEDs ----------

    /**
     * Allume une LED connectée à une broche donnée
     * @param broche la broche de la LED
     */
    //% block="allumer la LED sur %broche"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% group="LEDs"
    export function allumerLED(broche: DigitalPin): void {
        pins.digitalWritePin(broche, 1)
    }

    /**
     * Éteint une LED connectée à une broche donnée
     * @param broche la broche de la LED
     */
    //% block="éteindre la LED sur %broche"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% group="LEDs"
    export function eteindreLED(broche: DigitalPin): void {
        pins.digitalWritePin(broche, 0)
    }

    // ---------- GROUPE : Moteurs ----------

    /**
     * Positionne un servomoteur à un angle donné
     * @param broche la broche du servomoteur
     * @param angle l'angle entre 0 et 180 degrés
     */
    //% block="positionner le servomoteur sur %broche à %angle °"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% angle.min=0 angle.max=180
    //% group="Moteurs"
    export function positionnerServo(broche: AnalogPin, angle: number): void {
        pins.servoWritePin(broche, angle)
    }

    /**
     * Arrête un servomoteur (en envoyant un signal bas)
     * @param broche la broche du servomoteur
     */
    //% block="arrêter le servomoteur sur %broche"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% group="Moteurs"
    export function arreterServo(broche: AnalogPin): void {
        pins.digitalWritePin(broche, 0)
    }
}
