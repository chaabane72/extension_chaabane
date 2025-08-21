/**
 * Blocs personnalisés – Servomoteur continu
 */
//% color=#2b569b weight=10 icon="\uf013"
namespace ContinuousServo {

    /**
     * Fait tourner le servomoteur dans un sens à pleine vitesse
     * @param pin broche du servomoteur
     */
    //% blockId=spin_one_way weight=100
    //% block="tourner dans un sens | broche %pin"
    export function spin_one_way(pin = AnalogPin.P1): void {
        pins.servoWritePin(pin, 180)
    }

    /**
     * Fait tourner le servomoteur dans l'autre sens à pleine vitesse
     * @param pin broche du servomoteur
     */
    //% blockId=spin_other_way weight=80
    //% block="tourner dans l'autre sens | broche %pin"
    export function spin_other_way(pin = AnalogPin.P2): void {
        pins.servoWritePin(pin, 0)
    }

    /**
     * Fait tourner le servomoteur dans un sens avec une vitesse (0 à 100)
     * @param pin broche du servomoteur
     * @param speed vitesse de 0 à 100
     */
    //% blockId=spin_one_way_with_speed weight=60
    //% block="tourner dans un sens | broche %pin | vitesse %speed"
    //% speed.min=0 speed.max=100
    export function spin_one_way_with_speed(pin = AnalogPin.P1, speed = 50): void {
        let spin = (speed * 90) / 100 + 90
        pins.servoWritePin(pin, spin)
    }

    /**
     * Fait tourner le servomoteur dans l'autre sens avec une vitesse (0 à 100)
     * @param pin broche du servomoteur
     * @param speed vitesse de 0 à 100
     */
    //% blockId=spin_other_way_with_speed weight=40
    //% block="tourner dans l'autre sens | broche %pin | vitesse %speed"
    //% speed.min=0 speed.max=100
    export function spin_other_way_with_speed(pin = AnalogPin.P2, speed = 50): void {
        let spin = 90 - (speed * 90) / 100
        pins.servoWritePin(pin, spin)
    }

    /**
     * Arrête le servomoteur sur cette broche
     * @param pin broche du servomoteur
     */
    //% blockId=turn_off_motor weight=20
    //% block="arrêter le servomoteur | broche %pin"
    export function turn_off_motor(pin = DigitalPin.P1): void {
        pins.digitalWritePin(pin, 0)
    }
}
