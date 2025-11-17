# PredictiveRunning

Dieses Projekt ist eine Full-Stack-Anwendung zur Analyse und Vorhersage von Laufzeiten. Es kombiniert ein interaktives Frontend (React/TypeScript) mit einem Backend (Python/FastAPI), das ein Machine-Learning-Modell zur Prognose von Laufleistungen bereitstellt.

---

## Frontend (React & TypeScript)

Das Frontend wurde mit **React** und **TypeScript** entwickelt und bietet eine interaktive Benutzeroberfläche zur Datenanalyse und Laufzeitprognose.

### Hauptfunktionen

* **Interaktive Karte (Leaflet):**
    * Nutzer können eine interaktive Karte basierend auf der Open-Source-Bibliothek **Leaflet** verwenden.
    * Läufe können auf der Karte visualisiert, ausgewählt oder neu definiert werden.

* **Vorhersage-Tool:**
    * Ausgewählte Strecken werden an das Backend gesendet, um eine **prognostizierte Laufzeit** vom Machine-Learning-Modell zu erhalten.

* **Analyse historischer Daten:**
    * Bereits absolvierte Läufe werden in einer Ansicht aufbereitet dargestellt.
    * Folgende Daten werden visualisiert:
         * Time
         * Distance
         * Pace
         * Max Elevation
         * Gained Elevation
         * Windspeed
         * Daytime, Weekday and season
         * Temperature
         * Max - and average heartrate
         * Prediction for this specific run 
    * Die Daten können nach verschiedenen Attributen **auf- oder absteigend sortiert** werden:
        * Distance
        * Time
        * Pace
        * Prediction

* **Datenvisualisierung (D3.js):**
    * Historische Läufe werden zusätzlich über ein **Bubble-Diagramm** visualisiert, implementiert mit **D3.js**, um Muster und Trends intuitiv zu analysieren.

---

## Backend (FastAPI & Python)

Das Backend dient als API und zentrale Verarbeitungsstelle der Anwendung.

* **API-Endpunkte:** Das Backend stellt Endpunkte zur Verfügung, um Datenabruf, Übermittlung von Streckendaten und Rückgabe von Prognosen zu ermöglichen.
* **Machine-Learning-Logik:** Die gesamte Logik zur Laufzeitprognose wird im Backend ausgeführt.

---

## Machine Learning (Vorhersagemodell)

Kern der Anwendung ist die Prognose von Laufzeiten basierend auf relevanten Features wie Distanz, Höhenprofil und Tages-/Jahreszeit, ...

### Modell

* **Algorithmus:** Es wird ein **lineares Regressionsmodell** aus der Bibliothek **scikit-learn (sklearn)** verwendet.

### Validierung

Zur robusten Bewertung der Modellleistung ohne Data Leakage wird eine **5-fache K-Fold-Kreuzvalidierung** eingesetzt:

* Die historischen Daten werden in 5 gleich große Folds aufgeteilt.
* Das Modell wird 5-mal trainiert, jeweils auf 4 Folds, und auf dem verbleibenden Fold getestet.
* Jede Beobachtung wird genau einmal als Testpunkt verwendet.
* Beispiel:
    1. Modell 1 trainiert auf Folds [2,3,4,5] und testet auf Fold [1].
    2. Modell 2 trainiert auf Folds [1,3,4,5] und testet auf Fold [2].
    3. (usw.)
* Dadurch werden alle Vorhersagen **out-of-sample** generiert, und die mittlere Leistung über alle Folds liefert eine robuste Schätzung der Modellgenauigkeit.

---

## Verwendete Technologien

* **Frontend:**
    * React
    * TypeScript
    * Leaflet
    * D3.js
* **Backend:**
    * Python
    * FastAPI
* **Machine Learning:**
    * scikit-learn (sklearn)

