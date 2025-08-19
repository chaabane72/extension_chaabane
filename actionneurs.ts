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

///////////////////////////////

    /**
     * Fait clignoter une LED pendant un certain temps
     * @param broche la broche de la LED
     * @param duree durée du clignotement en secondes, eg: 5
     */
    //% block="faire clignoter la LED sur %broche pendant %duree secondes"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% duree.min=1 duree.max=60
    export function clignoterLED(broche: DigitalPin, duree: number): void {
        let fin = input.runningTime() + duree * 1000
        while (input.runningTime() < fin) {
            pins.digitalWritePin(broche, 1)
            basic.pause(500)
            pins.digitalWritePin(broche, 0)
            basic.pause(500)
        }
    }
///////////////////////////////

    /**
     * Allume une LED pendant une durée déterminée en secondes
     * @param broche la broche de la LED
     * @param secondes temps pendant lequel la LED reste allumée, eg: 3
     */
    //% block="allumer la LED sur %broche pendant %secondes secondes"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% secondes.min=1 secondes.max=60
    export function allumerLEDPendant(broche: DigitalPin, secondes: number): void {
        pins.digitalWritePin(broche, 1)
        basic.pause(secondes * 1000)
        pins.digitalWritePin(broche, 0)
    }
/////////////////////////////////////










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
