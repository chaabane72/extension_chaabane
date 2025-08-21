/**
 * Blocs personnalisés – Servomoteur continu
 */
//% color=#2b569b weight=60 icon="\uf013"
//% groups='["Contrôle simple","Vitesse"]'
namespace Servomoteur {
    /**
     * Tourne à fond dans un sens
     * @param pin broche du servomoteur
     */
    //% blockId=servo_spin_fw weight=100 group="Contrôle simple"
    //% block="servomoteur | tourner dans un sens | broche %pin"
    export function tournerSens(pin: AnalogPin = AnalogPin.P1): void {
        pins.servoWritePin(pin, 180)
    }

    /**
     * Tourne à fond dans l'autre sens
     * @param pin broche du servomoteur
     */
    //% blockId=servo_spin_bw weight=90 group="Contrôle simple"
    //% block="servomoteur | tourner dans l'autre sens | broche %pin"
    export function tournerAutreSens(pin: AnalogPin = AnalogPin.P1): void {
        pins.servoWritePin(pin, 0)
    }

    /**
     * Arrête (position neutre = 90)
     * @param pin broche du servomoteur
     */
    //% blockId=servo_stop weight=80 group="Contrôle simple"
    //% block="servomoteur | arrêter | broche %pin"
    export function arreter(pin: AnalogPin = AnalogPin.P1): void {
        pins.servoWritePin(pin, 90)
    }

    /**
     * Tourne dans un sens avec vitesse (0 à 100)
     * @param pin broche du servomoteur
     * @param vitesse 0 à 100
     */
    //% blockId=servo_spin_fw_speed weight=70 group="Vitesse"
    //% block="servomoteur | tourner dans un sens | broche %pin | vitesse %vitesse"
    //% vitesse.min=0 vitesse.max=100 vitesse.defl=50
    export function tournerSensVitesse(pin: AnalogPin = AnalogPin.P1, vitesse: number = 50): void {
        const angle = (vitesse * 90) / 100 + 90
        pins.servoWritePin(pin, angle)
    }

    /**
     * Tourne dans l'autre sens avec vitesse (0 à 100)
     * @param pin broche du servomoteur
     * @param vitesse 0 à 100
     */
    //% blockId=servo_spin_bw_speed weight=60 group="Vitesse"
    //% block="servomoteur | tourner dans l'autre sens | broche %pin | vitesse %vitesse"
    //% vitesse.min=0 vitesse.max=100 vitesse.defl=50
    export function tournerAutreSensVitesse(pin: AnalogPin = AnalogPin.P1, vitesse: number = 50): void {
        const angle = 90 - (vitesse * 90) / 100
        pins.servoWritePin(pin, angle)
    }
}
