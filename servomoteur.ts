/**
 * Blocs personnalisés – Servomoteurs
 */

/* ===========================
   Catégorie : moteur à rotation continue
   =========================== */
//% color=#2b569b weight=70 icon="\uf013" block="moteur à rotation continue"
//% groups='["Contrôle simple","Vitesse"]'
namespace MoteurRotationContinue {
    /**
     * Tourne à fond dans un sens
     * @param pin broche du servomoteur
     */
    //% blockId=cont_spin_fw weight=100 group="Contrôle simple"
    //% block="servomoteur (continu) | tourner dans un sens | broche %pin"
    export function tournerSens(pin: AnalogPin = AnalogPin.P1): void {
        pins.servoWritePin(pin, 180)
    }

    /**
     * Tourne à fond dans l'autre sens
     * @param pin broche du servomoteur
     */
    //% blockId=cont_spin_bw weight=90 group="Contrôle simple"
    //% block="servomoteur (continu) | tourner dans l'autre sens | broche %pin"
    export function tournerAutreSens(pin: AnalogPin = AnalogPin.P1): void {
        pins.servoWritePin(pin, 0)
    }

    /**
     * Arrêter (neutre = 90°)
     * @param pin broche du servomoteur
     */
    //% blockId=cont_stop weight=80 group="Contrôle simple"
    //% block="servomoteur (continu) | arrêter | broche %pin"
    export function arreter(pin: AnalogPin = AnalogPin.P1): void {
        pins.servoWritePin(pin, 90)
    }

    /**
     * Tourner dans un sens avec vitesse (0 à 100)
     * @param pin broche du servomoteur
     * @param vitesse 0 à 100
     */
    //% blockId=cont_spin_fw_speed weight=70 group="Vitesse"
    //% block="servomoteur (continu) | tourner dans un sens | broche %pin | vitesse %vitesse"
    //% vitesse.min=0 vitesse.max=100 vitesse.defl=50
    export function tournerSensVitesse(pin: AnalogPin = AnalogPin.P1, vitesse: number = 50): void {
        const angle = (vitesse * 90) / 100 + 90
        pins.servoWritePin(pin, angle)
    }

    /**
     * Tourner dans l'autre sens avec vitesse (0 à 100)
     * @param pin broche du servomoteur
     * @param vitesse 0 à 100
     */
    //% blockId=cont_spin_bw_speed weight=60 group="Vitesse"
    //% block="servomoteur (continu) | tourner dans l'autre sens | broche %pin | vitesse %vitesse"
    //% vitesse.min=0 vitesse.max=100 vitesse.defl=50
    export function tournerAutreSensVitesse(pin: AnalogPin = AnalogPin.P1, vitesse: number = 50): void {
        const angle = 90 - (vitesse * 90) / 100
        pins.servoWritePin(pin, angle)
    }
}

/* ===========================
   Catégorie : moteur 180°
   =========================== */
//% color=#4b9e4b weight=69 icon="\uf013" block="moteur 180°"
//% groups='["Position","Balayage"]'
namespace Moteur180 {
    /**
     * Positionner le servo à un angle (0–180°)
     * @param pin broche du servomoteur
     * @param angle angle en degrés (0 à 180)
     */
    //% blockId=pos180_set_angle weight=100 group="Position"
    //% block="servo 180° | positionner | broche %pin | angle %angle°"
    //% angle.min=0 angle.max=180 angle.defl=90
    export function positionner(pin: AnalogPin = AnalogPin.P1, angle: number = 90): void {
        let a = Math.round(angle)
        if (a < 0) a = 0
        if (a > 180) a = 180
        pins.servoWritePin(pin, a)
    }

    /**
     * Centrer le servo (90°)
     * @param pin broche du servomoteur
     */
    //% blockId=pos180_center weight=90 group="Position"
    //% block="servo 180° | centrer (90°) | broche %pin"
    export function centrer(pin: AnalogPin = AnalogPin.P1): void {
        pins.servoWritePin(pin, 90)
    }

    /**
     * Désactiver le signal PWM (le servo peut se relâcher)
     * @param pin broche du servomoteur
     */
    //% blockId=pos180_disable weight=80 group="Position"
    //% block="servo 180° | désactiver | broche %pin"
    export function desactiver(pin: AnalogPin = AnalogPin.P1): void {
        pins.digitalWritePin(<DigitalPin><number>pin, 0)
    }

    /**
     * Balayer entre deux angles
     * @param pin broche du servomoteur
     * @param angleA angle départ (0–180)
     * @param angleB angle arrivée (0–180)
     * @param pas pas en degrés
     * @param delai délai entre pas en ms
     */
    //% blockId=pos180_sweep weight=70 group="Balayage"
    //% block="servo 180° | balayer | broche %pin | de %angleA° à %angleB° | pas %pas° | délai %delai ms"
    //% angleA.min=0 angleA.max=180 angleA.defl=0
    //% angleB.min=0 angleB.max=180 angleB.defl=180
    //% pas.min=1 pas.max=90 pas.defl=5
    //% delai.min=0 delai.max=2000 delai.defl=20
    export function balayer(pin: AnalogPin = AnalogPin.P1, angleA: number = 0, angleB: number = 180, pas: number = 5, delai: number = 20): void {
        let a0 = Math.round(angleA); if (a0 < 0) a0 = 0; if (a0 > 180) a0 = 180
        let a1 = Math.round(angleB); if (a1 < 0) a1 = 0; if (a1 > 180) a1 = 180
        let step = Math.max(1, Math.round(pas))
        let wait = Math.max(0, Math.round(delai))

        if (a0 <= a1) {
            for (let a = a0; a <= a1; a += step) {
                pins.servoWritePin(pin, a)
                basic.pause(wait)
            }
        } else {
            for (let a = a0; a >= a1; a -= step) {
                pins.servoWritePin(pin, a)
                basic.pause(wait)
            }
        }
    }
}
