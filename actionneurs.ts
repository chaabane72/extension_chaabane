/**
 * Module pour contrôler les actionneurs : LEDs et moteurs
 */
//% color=#FF8000 icon="\uf205" block="Actionneurs"
//% groups=["LEDs", "Moteurs"]
namespace actionneurs {

    // ---------- GROUPE : LEDs ----------

    // ---------- Sélecteur d'état pour LED ----------
    /**
     * État de la LED
     */
    //% blockNamespace=actionneurs
    export enum LedEtat {
        //% block="allumer"
        Allumer = 1,
        //% block="éteindre"
        Eteindre = 0
    }

    // ---------- Bloc unique : régler la LED ----------
    /**
     * Met la LED à l'état choisi (allumer/éteindre) sur la broche indiquée
     * @param broche la broche de la LED
     * @param etat l'état à appliquer (allumer/éteindre)
     */
        //% block="💡 LED sur %broche | %etat"

    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% etat.defl=LedEtat.Allumer
    //% group="LEDs"
    export function reglerLED(broche: DigitalPin, etat: LedEtat): void {
        pins.digitalWritePin(broche, etat == LedEtat.Allumer ? 1 : 0)
    }


///////////////////////////////

    /**
  * Fait clignoters une LED pendant un certain temps, avec une fréquence donnée
  * @param broche la broche de la LED
  * @param duree durée du clignotement en secondes, eg: 5
  * @param frequence nombre de clignotements par seconde, eg: 2
  */
    //% block="💡faire clignoter la LED sur %broche pendant %duree s à %frequence fois(s)/s"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% duree.min=1 duree.max=60
    //% frequence.min=1 frequence.max=10
    //% group="LEDs"
    export function clignoterLED(broche: DigitalPin, duree: number, frequence: number): void {
        let intervalle = 1000 / frequence / 2  // demi-période en ms
        let fin = input.runningTime() + duree * 1000
        while (input.runningTime() < fin) {
            pins.digitalWritePin(broche, 1)
            basic.pause(intervalle)
            pins.digitalWritePin(broche, 0)
            basic.pause(intervalle)
        }
    }

///////////////////////////////

    /**
     * Allume une LED pendant une durée déterminée en secondes
     * @param broche la broche de la LED
     * @param secondes temps pendant lequel la LED reste allumée, eg: 3
     */
    //% block="💡allumer la LED sur %broche pendant %secondes secondes"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% secondes.min=1 secondes.max=60
    export function allumerLEDPendant(broche: DigitalPin, secondes: number): void {
        pins.digitalWritePin(broche, 1)
        basic.pause(secondes * 1000)
        pins.digitalWritePin(broche, 0)
    }
/////////////////////////////////////

    /**
     * Allume plusieurs LEDs selon une valeur binaire (codée en nombre décimal)
     * Ordre des broches : P0 (bit 0), P1, P2, P8, P12, P16 (bit 5)
     * @param valeur un nombre entre 0 et 63 (6 bits), eg: 42
     */
   //% block="💡 afficher LEDs avec la valeur %valeur"
//% valeur.min=0 valeur.max=63
//% group="LEDs"
//% blockHint="Ordre des broches : P0 (bit 0), P1, P2, P8, P12, P16 (bit 5)"




    export function afficherLEDs(valeur: number): void {
        const broches: DigitalPin[] = [
            DigitalPin.P0, DigitalPin.P1, DigitalPin.P2,
            DigitalPin.P8, DigitalPin.P12, DigitalPin.P16
        ]

        for (let i = 0; i < broches.length; i++) {
            const etat = (valeur >> i) & 0x1
            pins.digitalWritePin(broches[i], etat)
        }
    }




/////////////////////////////




    // ---------- GROUPE : Moteurs ----------

    /**
   * Fait tourner progressivement un servomoteur à un angle donné, à une certaine vitesse
   * @param broche la broche du servomoteur
   * @param angle l'angle cible entre 0 et 180 degrés
   * @param vitesse le délai entre chaque degré en ms (plus petit = plus rapide), eg: 10
   */
    //% block="positionner le servomoteur sur %broche vers %angle ° avec une vitesse de %vitesse ms par degré"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% angle.min=0 angle.max=180
    //% vitesse.min=1 vitesse.max=100
    //% group="Moteurs"
    export function positionnerServoAvecVitesse(broche: AnalogPin, angle: number, vitesse: number): void {
        let positionActuelle = 90 // point de départ par défaut (ou à stocker ailleurs)
        let step = angle > positionActuelle ? 1 : -1
        for (let pos = positionActuelle; pos != angle; pos += step) {
            pins.servoWritePin(broche, pos)
            basic.pause(vitesse)
        }
        pins.servoWritePin(broche, angle) // assurer la position finale
    }

}
