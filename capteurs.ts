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
////////////////////////////////////////////////
   
    /**
     * Module pour lire les capteurs : DHT11, etc.
     */
    //% color=#00C0C0 icon="\uf2c9" block="Capteurs"
    //% groups=["DHT11", "Température", "Lumière"]
    namespace capteurs {

        // --- DHT11 interne (bas niveau) ---
        let _lastReadMs = 0
        let _lastTemp = 0
        let _lastHum = 0
        let _lastOk = false

        function readDHT11(pin: DigitalPin): void {
            // anti-rafraîchissement trop rapide (mini ~1s pour DHT11)
            const now = input.runningTime()
            if (now - _lastReadMs < 900 && _lastOk) return

            _lastOk = false
            _lastTemp = 0
            _lastHum = 0

            // séquence de démarrage
            pins.setPull(pin, PinPullMode.PullUp)
            pins.digitalWritePin(pin, 0)   // sortie LOW 18 ms
            basic.pause(18)
            pins.digitalWritePin(pin, 1)   // HIGH 40 µs
            control.waitMicros(40)
            // passer en "entrée"
            pins.setPull(pin, PinPullMode.PullUp)

            // Réponse du capteur: 80µs LOW, 80µs HIGH
            // On consomme ces deux pulses de synchronisation
            pins.pulseIn(pin, PulseValue.Low)
            pins.pulseIn(pin, PulseValue.High)

            // Lecture de 40 bits: chaque bit = 50µs LOW + HIGH (26-28µs => 0, ~70µs => 1)
            let data: number[] = [0, 0, 0, 0, 0] // 5 octets
            for (let i = 0; i < 40; i++) {
                // LOW ~50µs (séparateur)
                pins.pulseIn(pin, PulseValue.Low)
                // HIGH = durée clé
                const high = pins.pulseIn(pin, PulseValue.High)
                const bit = high > 50 ? 1 : 0 // seuil ~50µs (micro:bit ms units)
                data[i >> 3] = (data[i >> 3] << 1) | bit
            }

            // On a 5 octets: humidité entière, humidité décimale, temp entière, temp décimale, checksum
            const hInt = data[0] & 0xff
            const hDec = data[1] & 0xff
            const tInt = data[2] & 0xff
            const tDec = data[3] & 0xff
            const chk = data[4] & 0xff
            const sum = (hInt + hDec + tInt + tDec) & 0xff

            if (sum == chk) {
                _lastHum = hInt // DHT11: décimales souvent 0
                _lastTemp = tInt
                _lastOk = true
                _lastReadMs = now
            } else {
                _lastOk = false
            }
        }

        /**
         * Température (°C) depuis un DHT11
         * @param broche la broche du DHT11 (DATA), eg: DigitalPin.P1
         * @returns température en °C
         */
        //% block="DHT11 température (°C) sur %broche"
        //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
        //% group="DHT11"
        //% weight=90
        //% help=docs/dht11
        export function dht11Temperature(broche: DigitalPin): number {
            readDHT11(broche)
            return _lastOk ? _lastTemp : -999 // -999 => erreur lecture
        }

        /**
         * Humidité relative (%) depuis un DHT11
         * @param broche la broche du DHT11 (DATA), eg: DigitalPin.P1
         * @returns humidité en %
         */
        //% block="DHT11 humidité (%) sur %broche"
        //% broche.fieldEditor="gridpicker" broche.fieldOptions.columns=3
        //% group="DHT11"
        //% weight=80
        //% help=docs/dht11
        export function dht11Humidite(broche: DigitalPin): number {
            readDHT11(broche)
            return _lastOk ? _lastHum : -1 // -1 => erreur lecture
        }
    }

/////////////////////////////////////////////



}
