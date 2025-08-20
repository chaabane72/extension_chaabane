/**
 * Module pour contrôler les actionneurs : LEDs et moteurs
 */
//% color=#FF8800 icon="\uf085" block="Actionneurs"
//% groups=["LEDs", "Servos", "Pas à pas", "Avancé"]
namespace actionneurs {

    // ---------- GROUPE : LEDs ----------

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

    /**
     * 🔴 Met la LED à l'état choisi (allumer/éteindre) sur la broche indiquée
     * @param broche la broche de la LED
     * @param etat l'état à appliquer (allumer/éteindre)
     */
    //% block="🔴 LED sur %broche | %etat"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% etat.defl=LedEtat.Allumer
    //% group="LEDs"
    export function reglerLED(broche: DigitalPin, etat: LedEtat): void {
        pins.digitalWritePin(broche, etat == LedEtat.Allumer ? 1 : 0)
    }

    /**
     * 🔴 Réglage de luminosité (PWM) 0–100 %
     * @param broche la broche de la LED (broche PWM)
     * @param pourcentage 0 à 100 %, eg: 50
     */
    //% block="🔴 luminosité LED sur %broche à %pourcentage %%"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% pourcentage.min=0 pourcentage.max=100
    //% group="LEDs"
    export function reglerLuminositeLED(broche: AnalogPin, pourcentage: number): void {
        const pct = Math.max(0, Math.min(100, Math.round(pourcentage)))
        const value = Math.idiv(pct * 1023, 100) // 0..1023
        pins.analogWritePin(broche, value)
    }

    /**
     * 🔴 Fait clignoter une LED pendant un certain temps, avec une fréquence donnée
     * @param broche la broche de la LED
     * @param duree durée du clignotement en secondes, eg: 5
     * @param frequence nombre de clignotements par seconde, eg: 2
     */
    //% block="🔴 clignoter LED sur %broche pendant %duree s à %frequence fois/s"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% duree.min=1 duree.max=60
    //% frequence.min=1 frequence.max=10
    //% group="LEDs"
    export function clignoterLED(broche: DigitalPin, duree: number, frequence: number): void {
        const intervalle = 1000 / frequence / 2
        const fin = input.runningTime() + duree * 1000
        while (input.runningTime() < fin) {
            pins.digitalWritePin(broche, 1)
            basic.pause(intervalle)
            pins.digitalWritePin(broche, 0)
            basic.pause(intervalle)
        }
    }


 /**
 /**
 * 🔴 Faire un fondu progressif sur une LED
 * @param broche la broche PWM
 * @param dePct valeur de départ en %, eg: 0
 * @param versPct valeur d'arrivée en %, eg: 100
 * @param dureeMs durée en millisecondes, eg: 1000
 */
    //% block="🔴 fondu LED sur %broche de %dePct %% à %versPct %% en %dureeMs ms"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% dePct.min=0 dePct.max=100
    //% versPct.min=0 versPct.max=100
    //% dureeMs.min=10 dureeMs.max=10000
    //% group="Effets"
    export function fonduLED(
        broche: AnalogPin,
        dePct: number,
        versPct: number,
        dureeMs: number
    ): void {
        const a = Math.max(0, Math.min(100, Math.round(dePct)))
        const b = Math.max(0, Math.min(100, Math.round(versPct)))
        const pas = a <= b ? 1 : -1
        const steps = Math.max(1, Math.abs(b - a))
        const delay = Math.max(1, Math.idiv(dureeMs, steps))
        for (let p = a; p != b; p += pas) {
            pins.analogWritePin(broche, Math.idiv(p * 1023, 100))
            basic.pause(delay)
        }
        pins.analogWritePin(broche, Math.idiv(b * 1023, 100))
    }



    /**
     * 🔴 Allume une LED pendant une durée déterminée en secondes
     * @param broche la broche de la LED
     * @param secondes temps pendant lequel la LED reste allumée, eg: 3
     */
    //% block="🔴 allumer LED sur %broche pendant %secondes s"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% secondes.min=1 secondes.max=60
    //% group="LEDs"
    export function allumerLEDPendant(broche: DigitalPin, secondes: number): void {
        pins.digitalWritePin(broche, 1)
        basic.pause(secondes * 1000)
        pins.digitalWritePin(broche, 0)
    }

    /**
     * 🔴 Affiche une valeur binaire (0..63) sur 6 LEDs (pins personnalisables)
     * @param valeur un nombre entre 0 et 63 (6 bits), eg: 42
     */
    //% block="🔴 afficher LEDs %valeur sur %p0 %p1 %p2 %p8 %p12 %p16"
    //% valeur.min=0 valeur.max=63
    //% p0.defl=DigitalPin.P0 p1.defl=DigitalPin.P1 p2.defl=DigitalPin.P2
    //% p8.defl=DigitalPin.P8 p12.defl=DigitalPin.P12 p16.defl=DigitalPin.P16
    //% group="LEDs"
    export function afficherLEDsSurPins(
        valeur: number,
        p0: DigitalPin, p1: DigitalPin, p2: DigitalPin,
        p8: DigitalPin, p12: DigitalPin, p16: DigitalPin
    ): void {
        const broches: DigitalPin[] = [p0, p1, p2, p8, p12, p16]
        for (let i = 0; i < broches.length; i++) {
            const etat = (valeur >> i) & 0x1
            pins.digitalWritePin(broches[i], etat)
        }
    }

    // ---------- GROUPE : Servos ----------

    // mémoire simple de la dernière position par broche
    const _servoMemo: { [k: string]: number } = {}
//////////////////////////////////

    /**
        * 🧭 Positionne progressivement un servomoteur avec limites et vitesse
        * @param broche la broche du servomoteur
        * @param angle angle cible 0..180°
        * @param vitesse délai entre degrés (ms), eg: 10
        * @param minAngle butée mini, eg: 0
        * @param maxAngle butée maxi, eg: 180
        */
    //% block="🧭 servo %broche vers %angle ° | vitesse %vitesse ms/° | bornes %minAngle–%maxAngle °"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% angle.min=0 angle.max=180
    //% vitesse.min=1 vitesse.max=100
    //% minAngle.min=0 minAngle.max=180 maxAngle.min=0 maxAngle.max=180
    //% group="Servos"
    export function positionnerServoAvecVitesse(
        broche: AnalogPin,
        angle: number,
        vitesse: number,
        minAngle: number = 0,
        maxAngle: number = 180
    ): void {

        const key = "" + broche
        const minA = Math.min(minAngle, maxAngle)
        const maxA = Math.max(minAngle, maxAngle)
        const cible = Math.max(minA, Math.min(maxA, Math.round(angle)))

        let positionActuelle = 90
        if (_servoMemo[key] || _servoMemo[key] == 0) {
            positionActuelle = _servoMemo[key]
        }

        const step = cible > positionActuelle ? 1 : -1

        for (let pos = positionActuelle; pos != cible; pos += step) {
            pins.servoWritePin(broche, pos)
            basic.pause(vitesse)
        }
        pins.servoWritePin(broche, cible)
        _servoMemo[key] = cible

    }



    /**
     * 🧭 Arrêter (détacher) le servomoteur
     */
    //% block="🧭 arrêter le servo sur %broche"
    //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=4
    //% group="Servos"
    export function arreterServo(broche: AnalogPin): void {
        pins.digitalWritePin(broche, 0) // stoppe l'envoi de pulses
        _servoMemo["" + broche] = _servoMemo["" + broche] || 90
    }

    // ---------- GROUPE : Pas à pas ----------

    /**
     * Sens de rotation du moteur pas à pas
     */
    //% blockNamespace=actionneurs
    export enum SensRotation {
        //% block="horaire"
        Horaire = 1,
        //% block="antihoraire"
        Antihoraire = -1
    }

    /**
     * Mode de rotation : nombre de pas ou durée en secondes
     */
    //% blockNamespace=actionneurs
    export enum ModeRotation {
        //% block="nombre de pas"
        Pas = 0,
        //% block="durée (s)"
        Temps = 1
    }

    /**
     * Type d'enchaînement des pas
     */
    //% blockNamespace=actionneurs
    export enum ModePas {
        //% block="demi-pas (précis)"
        Demi = 0,
        //% block="pas entier (puissant)"
        Entier = 1
    }

    /**
     * 🔁 Moteur pas à pas (ULN2003) en durée ou nombre de pas, vitesse et mode
     * Connexions recommandées : IN1 → P0, IN2 → P1, IN3 → P2, IN4 → P8
     * @param valeur nombre de pas OU secondes (selon le mode)
     * @param vitesseMs délai entre pas (ms), eg: 5
     */
    //% block="🔁 pas à pas sur %p1 %p2 %p3 %p4 : %valeur en %mode | sens %sens | %vitesseMs ms/pas | mode %modePas"
    //% group="Pas à pas"
    //% p1.defl=DigitalPin.P0 p2.defl=DigitalPin.P1 p3.defl=DigitalPin.P2 p4.defl=DigitalPin.P8
    //% valeur.min=1 valeur.max=2000
    //% vitesseMs.min=1 vitesseMs.max=20
    //% blockHint="IN1 → P0, IN2 → P1, IN3 → P2, IN4 → P8"
    export function moteurPasAPas(
        p1: DigitalPin,
        p2: DigitalPin,
        p3: DigitalPin,
        p4: DigitalPin,
        valeur: number,
        mode: ModeRotation,
        sens: SensRotation,
        vitesseMs: number = 5,
        modePas: ModePas = ModePas.Demi
    ): void {

        const sequenceDemi = [
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 0, 1],
            [1, 0, 0, 1]
        ]

        const sequenceEntier = [
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 1],
            [1, 0, 0, 1]
        ]

        const seq = modePas == ModePas.Demi ? sequenceDemi : sequenceEntier
        const nStepsSeq = seq.length

        let nombreDePas = 0
        const delay = Math.max(1, Math.round(vitesseMs))

        if (mode == ModeRotation.Pas) {
            nombreDePas = valeur
        } else {
            nombreDePas = Math.floor((valeur * 1000) / delay)
        }

        let index = 0
        const direction = sens == SensRotation.Horaire ? 1 : -1

        for (let i = 0; i < nombreDePas; i++) {
            index = (index + direction + nStepsSeq) % nStepsSeq
            const phase = seq[index]

            pins.digitalWritePin(p1, phase[0])
            pins.digitalWritePin(p2, phase[1])
            pins.digitalWritePin(p3, phase[2])
            pins.digitalWritePin(p4, phase[3])

            basic.pause(delay)
        }

        // Arrêt du moteur après le mouvement
        pins.digitalWritePin(p1, 0)
        pins.digitalWritePin(p2, 0)
        pins.digitalWritePin(p3, 0)
        pins.digitalWritePin(p4, 0)
    }

    /**
     * 🔁 Arrêter le moteur pas à pas (toutes les bobines à 0)
     */
    //% block="🔁 arrêter pas à pas sur %p1 %p2 %p3 %p4"
    //% group="Pas à pas"
    export function arreterPasAPas(
        p1: DigitalPin, p2: DigitalPin, p3: DigitalPin, p4: DigitalPin
    ): void {
        pins.digitalWritePin(p1, 0)
        pins.digitalWritePin(p2, 0)
        pins.digitalWritePin(p3, 0)
        pins.digitalWritePin(p4, 0)
    }

    // ---------- GROUPE : Avancé ----------

    /**
     * Retourne le nombre d'impulsions PWM (0..1023) pour un pourcentage donné
     */
    //% block="🔧 convertir %pourcentage %% en PWM (0..1023)"
    //% pourcentage.min=0 pourcentage.max=100
    //% group="Avancé"
    export function pourcentageVersPWM(pourcentage: number): number {
        const pct = Math.max(0, Math.min(100, Math.round(pourcentage)))
        return Math.idiv(pct * 1023, 100)
    }
}
