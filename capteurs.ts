/**
 * Catégorie Capteurs – blocs simples pour micro:bit
 */
//% color=#00C0C0 icon="\uf2c9" block="Capteurs"
//% groups=["Lumière","Température","Distance","Mouvement","Son","Gaz","Eau","Magnétique","Divers"]
namespace capteurs {

    // ========================= OUTILS INTERNES =========================
    function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }
    function mapToPercent(adc: number, lo: number, hi: number): number {
        const a = Math.min(lo, hi), b = Math.max(lo, hi)
        if (b - a <= 0) return 0
        return clamp(Math.round((adc - a) * 100 / (b - a)), 0, 100)
    }
    function adcToVolt(adc: number) { return adc * 3.3 / 1023 }

    // ============================== LUMIÈRE =============================

    // références usuelles pour la lumière
    export enum RefLumiere {
        //% block="LDR + 10kΩ (GL5528)"
        LDR_10k_GL5528 = 0,
        //% block="LDR + 100kΩ"
        LDR_100k = 1,
        //% block="TEMT6000 (analogique)"
        TEMT6000 = 2,
        //% block="KY-018 (photorésistance)"
        KY018 = 3
    }
    function noirClair(ref: RefLumiere): number[] {
        switch (ref) {
            case RefLumiere.LDR_100k: return [50, 1000]
            case RefLumiere.TEMT6000: return [0, 900]
            case RefLumiere.KY018: return [20, 900]
            default /* LDR_10k_GL5528 */: return [80, 900]
        }
    }

    /**
     * 💡 Lumière (0–100) – choisir broche et référence
     */
    //% block="💡 lumière (0–100) sur %broche capteur %ref"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P1 ref.defl=RefLumiere.LDR_10k_GL5528
    //% group="Lumière"
    export function lumierePourcent(broche: AnalogPin, ref: RefLumiere): number {
        const adc = pins.analogReadPin(broche)
        const [noir, clair] = noirClair(ref)
        return mapToPercent(adc, noir, clair)
    }

    /**
     * 💡 Lumière brute (0–1023)
     */
    //% block="💡 lumière brute (0–1023) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P1
    //% group="Lumière"
    export function lumiereBrute(broche: AnalogPin): number {
        return pins.analogReadPin(broche)
    }

    /**
     * 💡 TCRT5000 (réflectance) analogique (0–100)
     * 0 ≈ blanc / loin, 100 ≈ noir / proche (selon module)
     */
    //% block="💡 TCRT5000 (0–100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P2
    //% group="Lumière"
    export function tcrt5000Pourcent(broche: AnalogPin): number {
        const adc = pins.analogReadPin(broche)
        // bornes simples : à ajuster si besoin
        return mapToPercent(adc, 150, 900)
    }

    // =========================== TEMPÉRATURE ===========================

    /**
     * 🌡️ TMP36 (°C approx.)
     */
    //% block="🌡️ TMP36 °C sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P0
    //% group="Température"
    export function temperatureTMP36(broche: AnalogPin): number {
        const v = adcToVolt(pins.analogReadPin(broche))
        const t = (v - 0.5) * 100
        return clamp(Math.round(t), -40, 125)
    }

    /**
     * 🌡️ LM35 (°C approx.)
     */
    //% block="🌡️ LM35 °C sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P0
    //% group="Température"
    export function temperatureLM35(broche: AnalogPin): number {
        const v = adcToVolt(pins.analogReadPin(broche))
        const t = v * 100
        return clamp(Math.round(t), 0, 150)
    }

    /**
     * 🌡️ Thermomètre interne micro:bit (°C)
     */
    //% block="🌡️ température micro:bit (°C)"
    //% group="Température"
    export function temperatureInterne(): number {
        return input.temperature()
    }

    // ============================= DISTANCE ============================

    /**
     * 📏 HC-SR04 (cm) – TRIG/ECHO
     */
    //% block="📏 distance cm HC-SR04 trig %trig echo %echo"
    //% inlineInputMode=inline
    //% trig.defl=DigitalPin.P1 echo.defl=DigitalPin.P2
    //% group="Distance"
    export function distanceHCSR04(trig: DigitalPin, echo: DigitalPin): number {
        pins.digitalWritePin(trig, 0)
        control.waitMicros(2)
        pins.digitalWritePin(trig, 1)
        control.waitMicros(10)
        pins.digitalWritePin(trig, 0)
        const us = pins.pulseIn(echo, PulseValue.High, 25000)
        const cm = Math.idiv(us, 58)
        return clamp(cm, 2, 400)
    }

    /**
     * 📐 Sharp GP2Y0A21 (IR) ~ distance cm (approx. 10–80)
     */
    //% block="📐 Sharp IR (10–80 cm) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P1
    //% group="Distance"
    export function sharpIR_ApproxCm(broche: AnalogPin): number {
        const v = adcToVolt(pins.analogReadPin(broche))
        // Approximation simple, éviter division par ~0 : clamp bas à 0.45 V
        const vv = Math.max(0.45, v)
        const cm = Math.round(27.86 / (vv - 0.42)) // fit grossier
        return clamp(cm, 10, 80)
    }

    // ============================= MOUVEMENT ===========================

    /**
     * 🏃 PIR (mouvement) – vrai si mouvement détecté
     */
    //% block="🏃 PIR détecté sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=DigitalPin.P8
    //% group="Mouvement"
    export function pirDetecte(broche: DigitalPin): boolean {
        return pins.digitalReadPin(broche) == 1
    }

    /**
     * 🪀 Interrupteur à bille / tilt – vrai si incliné
     */
    //% block="🪀 tilt détecté sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=DigitalPin.P12
    //% group="Mouvement"
    export function tiltDetecte(broche: DigitalPin): boolean {
        return pins.digitalReadPin(broche) == 1
    }

    // ================================= SON ==============================

    /**
     * 🔊 Son (0–100) – entrée analogique (ex. KY-038 AO)
     */
    //% block="🔊 son (0–100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P0
    //% group="Son"
    export function sonPourcent(broche: AnalogPin): number {
        return clamp(Math.idiv(pins.analogReadPin(broche) * 100, 1023), 0, 100)
    }

    /**
     * 👏 Détection de clap (digital) – vrai si impulsion détectée
     */
    //% block="👏 clap détecté sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=DigitalPin.P9
    //% group="Son"
    export function clapDetecte(broche: DigitalPin): boolean {
        return pins.digitalReadPin(broche) == 1
    }

    // ================================= GAZ =============================

    /**
     * 🔥 MQ-2 (0–100) – fumées/gaz (entrée analogique)
     */
    //% block="🔥 MQ-2 (0–100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P0
    //% group="Gaz"
    export function mq2Pourcent(broche: AnalogPin): number {
        return mapToPercent(pins.analogReadPin(broche), 100, 900)
    }

    /**
     * 🏭 MQ-135 (0–100) – qualité air (entrée analogique)
     */
    //% block="🏭 MQ-135 (0–100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P0
    //% group="Gaz"
    export function mq135Pourcent(broche: AnalogPin): number {
        return mapToPercent(pins.analogReadPin(broche), 120, 850)
    }

    // ================================== EAU =============================

    /**
     * 🌧️ Pluie (0–100) – capteur pluie analogique
     * 0 ≈ sec, 100 ≈ très humide (bornes simples)
     */
    //% block="🌧️ pluie (0–100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P2
    //% group="Eau"
    export function pluiePourcent(broche: AnalogPin): number {
        const adc = pins.analogReadPin(broche)
        return mapToPercent(adc, 300, 900)
    }

    /**
     * 🌱 Humidité du sol (0–100) – sonde analogique
     */
    //% block="🌱 humidité sol (0–100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P1
    //% group="Eau"
    export function humiditeSol(broche: AnalogPin): number {
        const adc = pins.analogReadPin(broche)
        return mapToPercent(adc, 300, 900)
    }

    // ============================== MAGNÉTIQUE ==========================

    /**
     * 🧲 ILS / Reed (digital) – vrai si aimant proche (contact fermé)
     */
    //% block="🧲 reed (aimant) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=DigitalPin.P13
    //% group="Magnétique"
    export function reedFerme(broche: DigitalPin): boolean {
        return pins.digitalReadPin(broche) == 0 // la plupart ferment à 0
    }

    /**
     * 🧲 Hall analogique (SS49E) – intensité signée (−100..100)
     * 0 ≈ pas de champ, signe selon polarité
     */
    //% block="🧲 hall SS49E (−100..100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P2
    //% group="Magnétique"
    export function hallSS49E(broche: AnalogPin): number {
        const v = adcToVolt(pins.analogReadPin(broche)) // centre ~1.65 V
        const pct = Math.round((v - 1.65) / 0.66 * 100) // ~±100 % pour ±0.66 V
        return clamp(pct, -100, 100)
    }

    // ================================== DIVERS ==========================

    /**
     * 🕹️ Joystick X (0–100) – analogique
     */
    //% block="🕹️ joystick X (0–100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P0
    //% group="Divers"
    export function joystickX(broche: AnalogPin): number {
        return clamp(Math.idiv(pins.analogReadPin(broche) * 100, 1023), 0, 100)
    }

    /**
     * 🕹️ Joystick Y (0–100) – analogique
     */
    //% block="🕹️ joystick Y (0–100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P1
    //% group="Divers"
    export function joystickY(broche: AnalogPin): number {
        return clamp(Math.idiv(pins.analogReadPin(broche) * 100, 1023), 0, 100)
    }

    /**
     * 🔔 Contact / fin de course – vrai si fermé
     */
    //% block="🔔 contact fermé sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=DigitalPin.P14
    //% group="Divers"
    export function contactFerme(broche: DigitalPin): boolean {
        return pins.digitalReadPin(broche) == 1
    }

    /**
     * 🔦 Photointerrupteur (fourche optique) – vrai si fente coupée
     */
    //% block="🔦 photointerrupteur actif sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=DigitalPin.P15
    //% group="Divers"
    export function photoInterrupteur(broche: DigitalPin): boolean {
        return pins.digitalReadPin(broche) == 0
    }

    /**
     * 🎚️ Potentiomètre (0–100)
     */
    //% block="🎚️ potentiomètre (0–100) sur %broche"
    //% inlineInputMode=inline
    //% broche.defl=AnalogPin.P2
    //% group="Divers"
    export function potentiometre(broche: AnalogPin): number {
        return clamp(Math.idiv(pins.analogReadPin(broche) * 100, 1023), 0, 100)
    }
}
