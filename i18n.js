(() => {
  "use strict";

  const STORAGE_KEY = "influx-language";
  const SUPPORTED_LANGUAGES = new Set(["en", "ro"]);

  const RO = Object.freeze({
    "Desktop Injection Molding Machine | InFlux Origin": "Mașină desktop de injecție mase plastice | InFlux Origin",
    "Machine Versions | InFlux Origin": "Versiunile mașinii | InFlux Origin",
    "Team | InFlux Origin": "Echipă | InFlux Origin",
    "Sponsors | InFlux Origin": "Sponsori | InFlux Origin",
    "Contact Us | InFlux Origin": "Contact | InFlux Origin",
    "Proof | InFlux Origin": "Dovezi | InFlux Origin",
    "Download Hub | InFlux Origin": "Centru de descărcări | InFlux Origin",
    "External Links | InFlux Origin": "Linkuri externe | InFlux Origin",
    "Technical Dossier | InFlux Origin MK1": "Dosar tehnic | InFlux Origin MK1",

    "Menu": "Meniu",
    "Close": "Închide",
    "Home": "Acasă",
    "Machine Development": "Dezvoltarea mașinii",
    "Machine Versions": "Versiunile mașinii",
    "InFlux Ecosystem": "Ecosistemul InFlux",
    "Team": "Echipă",
    "Proof": "Dovezi",
    "Contact Us": "Contact",
    "Sponsors": "Sponsori",
    "Downloads": "Descărcări",
    "Back to top ↑": "Înapoi sus ↑",
    "Open navigation menu": "Deschide meniul de navigare",
    "Close navigation menu": "Închide meniul de navigare",

    "Real": "Producție",
    "manufacturing.": "reală.",
    "Desktop scale.": "La scară de birou.",
    "InFlux Origin bridges the gap between a 3D printed prototype and industrial manufacturing with real thermoplastic shots, resin 3D printed molds, and an easy-to-use operator app!": "InFlux Origin acoperă distanța dintre un prototip imprimat 3D și producția industrială prin injecții reale de termoplastic, matrițe din rășină imprimate 3D și o aplicație de operare ușor de folosit!",
    "See the evidence": "Vezi dovezile",
    "Explore the machine": "Explorează mașina",
    "Why InFlux?": "De ce InFlux?",
    "The middle ground should not be empty.": "Spațiul dintre prototip și industrie nu ar trebui să fie gol.",
    "You can print a model in hours or dump tens of thousands of euros into industrial manufacturing. Why not something in between? Faster than 3D printing. Semi-industrial quantities.": "Poți imprima un model în câteva ore sau poți investi zeci de mii de euro în producție industrială. De ce să nu existe ceva între ele? Mai rapid decât imprimarea 3D. Cantități semi-industriale.",
    "Influx is the answer.": "InFlux este răspunsul.",
    "Evidence route": "Traseul dovezilor",
    "From an ambitious idea to a working machine.": "De la o idee ambițioasă la o mașină funcțională.",
    "Thermal tested": "Testată termic",
    "6,331 samples in the longest captured campaign.": "6.331 de eșantioane în cea mai lungă campanie înregistrată.",
    "Control stack built": "Sistemul de control construit",
    "Firmware, Wi-Fi bridge, operator app, and servicing functions.": "Firmware, punte Wi-Fi, aplicație de operare și funcții de service.",
    "Part injected": "Piesă injectată",
    "We don't try to convince. We prove.": "Nu încercăm să convingem. Demonstrăm.",
    "Public resources": "Resurse publice",
    "Built to be inspected, questioned, and improved.": "Construit pentru a fi inspectat, analizat și îmbunătățit.",
    "Meet the team": "Cunoaște echipa",

    "From an idea": "De la o idee",
    "to a": "la o",
    "working machine.": "mașină funcțională.",
    "We didn't build it all in one day. We took it step by step, making sure to improve along the way.": "Nu am construit-o într-o singură zi. Am avansat pas cu pas, îmbunătățind-o pe parcurs.",
    "An idea appears": "Apare o idee",
    "Sketches": "Schițe",
    "My 3D printer is too slow and we can't afford industrial machinery. But what is in between?": "Imprimanta mea 3D este prea lentă, iar utilajele industriale sunt prea scumpe. Dar ce există între ele?",
    "Thus, we started sketching a machine that can manufacture high quantities for cheap.": "Așa am început să schițăm o mașină capabilă să producă volume mai mari la cost redus.",
    "Research the injection process": "Studierea procesului de injecție",
    "Separate the machine into sub-systems": "Împărțirea mașinii în subsisteme",
    "Separate the sub-systems into individual components": "Împărțirea subsistemelor în componente",
    "Physical experiments": "Experimente fizice",
    "The beginning of InFlux": "Începutul InFlux",
    "The idea proved possible, so we defined a brand identity. We don't sell a generic injection molding machine.": "Ideea s-a dovedit posibilă, așa că am definit o identitate de brand. Nu construim o mașină generică de injecție.",
    "We sell Influx.": "Construim InFlux.",
    "Design a brand name and logo.": "Crearea numelui și a siglei.",
    "Define our goals.": "Definirea obiectivelor.",
    "Study the market": "Studierea pieței",
    "Machine Prototyping": "Prototiparea mașinii",
    "Plan for MK1": "Planul pentru MK1",
    "Branding and general architecture in place, it was time for engineering.": "Cu identitatea și arhitectura generală stabilite, a venit timpul pentru inginerie.",
    "CAD, programming, simulations, test, repeat. There is no going back now.": "CAD, programare, simulări, testare, repetare. Nu mai există cale de întoarcere.",
    "Selecting and ordering components.": "Selectarea și comandarea componentelor.",
    "Mechanical and electrical design.": "Proiectare mecanică și electrică.",
    "Making the first sub-systems work together.": "Integrarea primelor subsisteme.",
    "First working prototype": "Primul prototip funcțional",
    "Our first complete machine capable of producing real injected parts. Although the automations aren't perfect, it gets the job done, and it certainly does it cheaper than industrial solutions.": "Prima noastră mașină completă, capabilă să producă piese injectate reale. Automatizările nu sunt încă perfecte, dar mașina își face treaba la un cost mult mai mic decât soluțiile industriale.",
    "Desktop sized": "Dimensiuni de birou",
    "Water-cooled resin and metal mold compatibility": "Compatibilă cu matrițe din rășină și metal răcite cu apă",
    "Fully compatible with the Influx Operator app": "Complet compatibilă cu aplicația InFlux Operator",
    "Future product direction": "Direcția viitorului produs",
    "Next up": "Urmează",
    "The next version will focus on a fully automated and monitored process, with water, molten plastic, and mold pressure monitoring. Designed for continuous thrustworthy operation.": "Următoarea versiune va urmări un proces complet automatizat și monitorizat, inclusiv apa, plasticul topit și presiunea din matriță. Proiectată pentru funcționare continuă și fiabilă.",
    "Full machine enclosure": "Carcasă completă a mașinii",
    "Pressure sensing and temperature balancing": "Măsurarea presiunii și echilibrarea temperaturii",
    "Printed molds lifetime improvements": "Creșterea duratei de viață a matrițelor imprimate",
    "Interactive assembly": "Ansamblu interactiv",
    "Inspect the machine, not just the pitch.": "Inspectează mașina, nu doar prezentarea.",
    "No need to take our word for it, convince yourself. Take a look at the InFlux Origin Mk. 1.": "Nu trebuie să ne crezi pe cuvânt. Convinge-te singur și explorează InFlux Origin MK1.",
    "Loads a 0.31 MB optimized model and the viewer runtime.": "Încarcă un model optimizat de 0,31 MB și modulul de vizualizare.",
    "Load interactive 3D": "Încarcă modelul 3D",
    "Loading viewer": "Se încarcă vizualizatorul",
    "Loading optimized assembly": "Se încarcă ansamblul optimizat",
    "Retry interactive 3D": "Reîncearcă modelul 3D",

    "Three systems. One machine.": "Trei sisteme. O singură mașină.",
    "Operator": "Operator",
    "Control surface": "Interfață de control",
    "Motherboard": "Placă de bază",
    "Control electronics": "Electronică de control",
    "Thermal Lab": "Laborator termic",
    "Validation evidence": "Dovezi de validare",
    "Operator interface": "Interfața operatorului",
    "Everything the operator needs, in one place.": "Tot ce îi trebuie operatorului, într-un singur loc.",
    "A dedicated interface with internet connectivity. It includes complete machine monitoring, control and servicing functions.": "O interfață dedicată, cu conectivitate la rețea. Include monitorizarea completă a mașinii, controlul și funcțiile de service.",
    "This is where the machine starts thinking.": "Aici începe mașina să gândească.",
    "A custom PCB that serves as the central hub for every part of the machine. Offers the possibility for easy expansion and component replacement.": "Un PCB personalizat care este centrul fiecărei componente a mașinii. Permite extinderea și înlocuirea ușoară a componentelor.",
    "Thermal testing": "Testare termică",
    "We measure instead of guessing.": "Măsurăm în loc să presupunem.",
    "We measured heating and cooling time, temperature stability, sensor precision and heat spread to improve the next version of the machine.": "Am măsurat timpii de încălzire și răcire, stabilitatea temperaturii, precizia senzorilor și distribuția căldurii pentru a îmbunătăți următoarea versiune.",

    "Team Volta Circuits": "Echipa Volta Circuits",
    "Four disciplines.": "Patru discipline.",
    "One physical result.": "Un rezultat fizic.",
    "InFlux is built at the intersection of engineering, analysis and business. Nothing is left out.": "InFlux este construit la intersecția dintre inginerie, analiză și business. Nimic nu este lăsat deoparte.",
    "Engineering lead": "Coordonare inginerie",
    "Mechanical engineering, manufacturing, CAD design, electrical integration, microcontrollers, and product development.": "Inginerie mecanică, producție, proiectare CAD, integrare electrică, microcontrolere și dezvoltare de produs.",
    "Build the machine.": "Construiește mașina.",
    "Simulation + analysis lead": "Coordonare simulare și analiză",
    "Math, SimScale, Unreal Engine simulations, Python models, machine learning, and data analysis.": "Matematică, SimScale, simulări Unreal Engine, modele Python, machine learning și analiză de date.",
    "Prove the decisions.": "Demonstrează deciziile.",
    "Business lead": "Coordonare business",
    "Marketing, sponsorships, economics, logistics, and pitching.": "Marketing, sponsorizări, economie, logistică și prezentare.",
    "Sell the idea.": "Prezintă ideea.",
    "Embedded programming": "Programare embedded",
    "Arduino, C++, C, backend development, automations, and system integration.": "Arduino, C++, C, dezvoltare backend, automatizări și integrarea sistemelor.",
    "Make it think.": "Fă-o să gândească.",
    "Working principle": "Principiu de lucru",
    "Plan. Build. Measure. Explain. As simple as that.": "Planifică. Construiește. Măsoară. Explică. Atât de simplu.",
    "Public collaboration path": "Colaborare publică",
    "Review the work.": "Analizează munca.",
    "Challenge us.": "Pune-ne la încercare.",
    "Start with the public dossier, inspect the current artifacts, or follow the active repository.": "Începe cu dosarul public, inspectează artefactele actuale sau urmărește repository-ul activ.",
    "Read technical dossier": "Citește dosarul tehnic",
    "Open public artifacts": "Deschide artefactele publice",
    "View repository": "Vezi repository-ul",

    "Contact": "Contact",
    "Us": "cu noi",
    "For sponsorships, collaboration, media or general interest in our project, use the addresses below.": "Pentru sponsorizări, colaborări, presă sau interes general față de proiect, folosește adresele de mai jos.",
    "We're here to": "Suntem aici să",
    "connect.": "comunicăm.",
    "Sponsorship": "Sponsorizări",
    "Interested in becoming a sponsor? We have multiple ways of promoting your brand, all tailored to your needs.": "Vrei să devii sponsor? Avem mai multe moduri de a-ți promova brandul, adaptate nevoilor tale.",
    "Send sponsorship email": "Trimite un e-mail pentru sponsorizare",
    "General Inquiry": "Întrebări generale",
    "Questions, collaborations, event invites, media requests or ideas you'd like to discuss with the team. We are open to anything!": "Întrebări, colaborări, invitații la evenimente, solicitări media sau idei pe care vrei să le discuți cu echipa. Suntem deschiși la orice!",
    "Send general email": "Trimite un e-mail",
    "Join": "Vino",
    "Recruitment": "Recrutare",
    "Help build what comes next.": "Ajută-ne să construim ce urmează.",
    "We are looking for driven people ready to turn ambitious engineering into working hardware, software, and proof.": "Căutăm oameni motivați, gata să transforme ingineria ambițioasă în hardware, software și dovezi funcționale.",
    "Questions? Email David": "Întrebări? Scrie-i lui David",
    "Apply through Google Forms": "Aplică prin Google Forms",
    "Apply": "Aplică",
    "now": "acum",
    "Apply now": "Aplică acum",

    "Current Sponsors": "Sponsori actuali",
    "Thank you to our": "Mulțumim",
    "sponsors!": "sponsorilor!",
    "Interested in becoming a sponsor? Contact us!": "Vrei să devii sponsor? Contactează-ne!",
    "Sponsor visibility": "Vizibilitatea sponsorilor",
    "Your brand can travel with the team.": "Brandul tău poate călători cu echipa.",
    "Sponsorship packages can include visible placement on our uniforms and public presentation materials.": "Pachetele de sponsorizare pot include poziționare vizibilă pe uniformele noastre și în materialele publice de prezentare.",

    "Proof of the prototype": "Dovada prototipului",
    "Not perfect.": "Nu este perfectă.",
    "But it proves the concept.": "Dar demonstrează conceptul.",
    "A bad-looking first part doesn't prove the machine is poorly made. It proves the machine can control heat, melt plastic, control injection amount, flow cooling water, clamp molds and eject parts.": "O primă piesă cu defecte nu înseamnă că mașina este prost construită. Demonstrează că poate controla căldura, topi plasticul, doza injecția, circula apa de răcire, închide matrița și ejecta piesele.",
    "samples in the longest captured thermal campaign, recorded April 16, 2026": "eșantioane în cea mai lungă campanie termică înregistrată, din 16 aprilie 2026",
    "measured heat-up, stabilization, and cooldown period": "perioadă măsurată de încălzire, stabilizare și răcire",
    "reported thermal model agreement with SimScale simulations": "concordanță raportată a modelului termic cu simulările SimScale",
    "operator app, machine, and safety all in one system": "aplicație, mașină și siguranță într-un singur sistem",
    "Thermal tests": "Teste termice",
    "Measurements defined the variables.": "Măsurătorile au definit variabilele.",
    "Thermal camera images and logged sensor data exposed heat loss, hot spots, and control behavior before those weaknesses became hidden inside an enclosure.": "Imaginile termice și datele înregistrate de senzori au evidențiat pierderile de căldură, punctele fierbinți și comportamentul controlului înainte ca aceste slăbiciuni să fie ascunse de carcasă.",
    "Centralised control": "Control centralizat",
    "Every action answers to the same hub.": "Fiecare acțiune răspunde aceluiași centru.",
    "The connectivity board communicates with the user, so the motherboard can focus on safety and precise control. All settings, sensors and outputs are controlled by the motherboard, running an STM32.": "Placa de conectivitate comunică cu utilizatorul, iar placa de bază se poate concentra pe siguranță și control precis. Toate setările, senzorii și ieșirile sunt controlate de placa de bază cu STM32.",
    "Repeatability": "Repetabilitate",
    "56 parts.": "56 de piese.",
    "One mold.": "O singură matriță.",
    "A single 3D printed resin mold was able to produce 56 individual parts before failure. Analysis revealed failure points and proposed quality-of-life improvements. The next version WILL be better.": "O singură matriță din rășină imprimată 3D a produs 56 de piese înainte de cedare. Analiza a identificat punctele de defectare și îmbunătățirile necesare. Următoarea versiune VA fi mai bună.",
    "Prototype status": "Starea prototipului",
    "What is not proven.": "Ce nu este încă demonstrat.",
    ". . .yet": ". . .încă",
    "Mold life": "Durata de viață a matriței",
    "Resin mold durability across continuous, repeated cycles.": "Durabilitatea matrițelor din rășină în cicluri continue și repetate.",
    "Continuous running": "Funcționare continuă",
    "Stable output quality across longer, controlled runs.": "Calitate stabilă în sesiuni controlate de durată mai mare.",
    "Price reduction": "Reducerea prețului",
    "Reducing the profitable selling cost as much as possible.": "Reducerea cât mai mult posibil a prețului de vânzare profitabil.",
    "Max water temperature": "Temperatura maximă a apei",
    "Maximum temperature the mold cooling water reaches during normal operation.": "Temperatura maximă atinsă de apa de răcire a matriței în funcționare normală.",
    "Milestones": "Repere",

    "Download Hub": "Centru de descărcări",
    "Public files.": "Fișiere publice.",
    "Clearly labeled.": "Etichetate clar.",
    "Welcome to the download hub! Check out the app, technical notebook or the branding materials.": "Bine ai venit în centrul de descărcări! Explorează aplicația, caietul tehnic sau materialele de brand.",
    "JavaScript is disabled. Direct files:": "JavaScript este dezactivat. Fișiere directe:",
    "Operator APK": "APK Operator",
    "technical notebook": "caiet tehnic",
    "logo SVG": "siglă SVG",
    "Prototype notice:": "Avertisment prototip:",
    "The public Influx Operator APK is still in development. Do not use it as a general-purpose machine controller. Constant machine supervision is required.": "APK-ul public InFlux Operator este încă în dezvoltare. Nu îl folosi ca sistem general de control al mașinii. Este necesară supravegherea permanentă.",
    "Integrity:": "Integritate:",
    "SHA-256 checksums are published in": "Sumele de control SHA-256 sunt publicate în",
    ". If the checksums don't check out, your file is NOT from Influx! Be careful of modified installations!": ". Dacă sumele nu corespund, fișierul NU provine de la InFlux! Atenție la instalările modificate!",
    "InFlux Operator APK": "APK InFlux Operator",
    "Prototype operator artifact": "Artefact prototip pentru operator",
    "Latest version of the Influx Origin control app.": "Cea mai nouă versiune a aplicației de control InFlux Origin.",
    "Android APK / 19.79 MB / June 2026": "APK Android / 19,79 MB / iunie 2026",
    "ONCS operator artifact": "Artefact operator pentru ONCS",
    "Auto Connect app build used for the ONCS presentation path.": "Versiunea Auto Connect folosită pentru prezentarea ONCS.",
    "Android APK / 19.79 MB / May 2026": "APK Android / 19,79 MB / mai 2026",
    "Technical Notebook": "Caiet tehnic",
    "Public documentation / PDF": "Documentație publică / PDF",
    "Ten-page public notebook covering the project, system, testing, and direction.": "Caiet public de zece pagini despre proiect, sistem, testare și direcție.",
    "PDF / 645 KB / June 2026": "PDF / 645 KB / iunie 2026",
    "Extended Technical Dossier": "Dosar tehnic extins",
    "Public documentation / web": "Documentație publică / web",
    "Long-form documentation covering mechanics, control, validation, limits, and next steps.": "Documentație amplă despre mecanică, control, validare, limite și pașii următori.",
    "Web technical notebook": "Caiet tehnic web",
    "InFlux Origin Logo": "Sigla InFlux Origin",
    "Public brand asset / SVG": "Resursă publică de brand / SVG",
    "Scalable monochrome logo for project references and approved public coverage.": "Siglă monocromă scalabilă pentru referințe și apariții publice aprobate.",

    "External Links + References": "Linkuri externe + referințe",
    "Follow the work.": "Urmărește proiectul.",
    "Check the sources.": "Verifică sursele.",
    "Public project destinations and technical references that informed the platform.": "Destinații publice ale proiectului și referințe tehnice care au contribuit la platformă.",
    "Project destinations": "Destinațiile proiectului",
    "Technical documentation": "Documentație tehnică",
    "Read the extended project dossier": "Citește dosarul extins al proiectului",
    "Download hub": "Centru de descărcări",
    "APK, notebook, and public brand files": "APK, caiet și fișiere publice de brand",
    "Evidence overview": "Prezentarea dovezilor",
    "Results, measurements, and current limits": "Rezultate, măsurători și limite actuale",
    "Public repository": "Repository public",
    "Inspect the active software and firmware record": "Inspectează istoricul activ de software și firmware",
    "Technical references": "Referințe tehnice",
    "Low-volume injection molding with 3D printed molds": "Injecție în volume mici cu matrițe imprimate 3D",
    "Plastic injection molding design guidelines": "Ghid de proiectare pentru injecția maselor plastice",
    "NUCLEO-H753ZI product documentation": "Documentația produsului NUCLEO-H753ZI",
    "Thermocouple fundamentals": "Principiile termocuplurilor",

    "Public technical dossier": "Dosar tehnic public",
    "A desktop injection molding platform integrating mechanics, thermal control, machine firmware, operator software, safety logic, and experimental tooling.": "O platformă desktop de injecție care integrează mecanică, control termic, firmware, software de operare, logică de siguranță și matrițe experimentale.",
    "Download notebook": "Descarcă caietul",
    "Back to project hub": "Înapoi la proiect",
    "Current state": "Stare actuală",
    "Integrated prototype in active calibration": "Prototip integrat în calibrare activă",
    "Primary objective": "Obiectiv principal",
    "Repeatable small-part thermoplastic injection": "Injecție repetabilă de piese mici din termoplastic",
    "Tooling direction": "Direcția matrițelor",
    "Rapid resin molds with controlled cooling": "Matrițe rapide din rășină, cu răcire controlată",
    "Control path": "Traseul de control",
    "Android operator → ESP bridge → Nucleo firmware": "Operator Android → punte ESP → firmware Nucleo",
    "Volta Circuits": "Volta Circuits",
    "Contents": "Cuprins",
    "1. Project definition": "1. Definirea proiectului",
    "2. System architecture": "2. Arhitectura sistemului",
    "3. Mechanical system": "3. Sistemul mecanic",
    "4. Thermal system": "4. Sistemul termic",
    "5. Electronics and controls": "5. Electronică și control",
    "6. Firmware and operator stack": "6. Firmware și sistem de operare",
    "7. Safety position": "7. Poziția privind siguranța",
    "8. Validation evidence": "8. Dovezi de validare",
    "9. Current limits": "9. Limite actuale",
    "10. Product direction": "10. Direcția produsului",
    "11. Team": "11. Echipa",
    "01 / Project definition": "01 / Definirea proiectului",
    "Manufacturing evidence before industrial tooling.": "Dovezi de producție înaintea matrițelor industriale.",
    "InFlux Origin MK1 is a desktop-scale injection molding prototype built to help teams learn from real thermoplastic parts before committing to conventional production tooling. It is intended for process learning, functional validation, education, and future short-run experimentation.": "InFlux Origin MK1 este un prototip desktop de injecție, construit pentru ca echipele să învețe din piese termoplastice reale înainte de a investi în matrițe convenționale de producție. Este destinat învățării procesului, validării funcționale, educației și viitoarelor experimente în serii scurte.",
    "The project does not claim to replace an industrial injection molding machine. Its purpose is to reduce the distance between a 3D printed model and a professionally tooled production part by making the molding process more accessible, measurable, and iterative.": "Proiectul nu pretinde că înlocuiește o mașină industrială de injecție. Scopul său este să reducă distanța dintre un model imprimat 3D și o piesă realizată cu matrițe profesionale, făcând procesul mai accesibil, măsurabil și iterativ.",
    "02 / System architecture": "02 / Arhitectura sistemului",
    "A complete machine, not an isolated mechanism.": "O mașină completă, nu un mecanism izolat.",
    "The platform is organized into six connected layers:": "Platforma este organizată în șase niveluri conectate:",
    "Structural frame and aligned movement system.": "Cadru structural și sistem de mișcare aliniat.",
    "Heated barrel, nozzle, and piston-driven injection path.": "Cilindru încălzit, duză și traseu de injecție acționat de piston.",
    "Mold support, closing movement, and rapid tooling package.": "Suport pentru matriță, mișcare de închidere și pachet de matrițe rapide.",
    "Power distribution, sensors, motion drivers, and emergency inputs.": "Distribuție de putere, senzori, drivere de mișcare și intrări de urgență.",
    "Nucleo machine firmware and ESP32-C6 communication bridge.": "Firmware Nucleo și punte de comunicație ESP32-C6.",
    "Android operator interface and diagnostic support tools.": "Interfață Android pentru operator și instrumente de diagnosticare.",
    "The Nucleo controller owns machine state, heating, motion, safety checks, and cycle behavior. The ESP bridge translates same-network operator requests into the machine command protocol. The Android application presents status and sends supported commands.": "Controlerul Nucleo gestionează starea mașinii, încălzirea, mișcarea, verificările de siguranță și ciclurile. Puntea ESP traduce cererile operatorului din aceeași rețea în protocolul mașinii. Aplicația Android afișează starea și trimite comenzile acceptate.",
    "Confirmed platform summary": "Rezumat confirmat al platformei",
    "Machine controller": "Controlerul mașinii",
    "Communication bridge": "Punte de comunicație",
    "ESP32-C6 / local HTTP to acknowledged UART commands": "ESP32-C6 / HTTP local către comenzi UART confirmate",
    "Operator interface": "Interfața operatorului",
    "Android application for status and supported commands": "Aplicație Android pentru stare și comenzi acceptate",
    "Thermal sensing": "Măsurare termică",
    "Multiple K-type thermocouples across the heated barrel": "Mai multe termocupluri tip K pe cilindrul încălzit",
    "3D-printed photopolymer resin molds with controlled water cooling": "Matrițe din rășină fotopolimerică imprimate 3D, cu răcire controlată cu apă",
    "Current status": "Stare actuală",
    "Supervised integrated prototype in active calibration": "Prototip integrat, supravegheat, în calibrare activă",
    "03 / Mechanical system": "03 / Sistemul mecanic",
    "Alignment and load paths decide whether the process is repeatable.": "Alinierea și traseele de sarcină decid dacă procesul este repetabil.",
    "The current structure uses aluminum extrusion, interface plates, linear guidance, lead-screw movement, and a servo-driven injection axis. The architecture remains adjustable because the prototype is still being calibrated around real component behavior and mold geometry.": "Structura actuală folosește profile de aluminiu, plăci de interfață, ghidaje liniare, șuruburi conducătoare și o axă de injecție acționată de servomotor. Arhitectura rămâne reglabilă deoarece prototipul este calibrat în funcție de comportamentul componentelor reale și geometria matriței.",
    "Mechanical priorities": "Priorități mecanice",
    "Keep the nozzle, mold entry, and moving plates aligned across repeated cycles.": "Menținerea alinierii duzei, intrării matriței și plăcilor mobile în cicluri repetate.",
    "Carry injection and clamping forces through structure rather than fragile tooling.": "Transmiterea forțelor de injecție și închidere prin structură, nu prin matrițele fragile.",
    "Make critical supports and service areas accessible during calibration.": "Păstrarea accesului la suporturile critice și zonele de service în timpul calibrării.",
    "Measure and reduce backlash, frame twist, and platen racking.": "Măsurarea și reducerea jocului, torsiunii cadrului și nealinierii plăcilor.",
    "04 / Thermal system": "04 / Sistemul termic",
    "Temperature is a process variable, not a visual effect.": "Temperatura este o variabilă de proces, nu un efect vizual.",
    "The barrel is heated in multiple zones and measured with K-type thermocouples. Logged tests and thermal-camera passes are used to inspect heat-up, stabilization, cooldown, sensor behavior, heat loss, and local hot spots.": "Cilindrul este încălzit în mai multe zone și măsurat cu termocupluri tip K. Testele înregistrate și măsurătorile cu camera termică sunt folosite pentru a analiza încălzirea, stabilizarea, răcirea, comportamentul senzorilor, pierderile și punctele fierbinți.",
    "The longest captured campaign contains 6,331 samples across approximately 108.6 minutes. Thermal modeling was compared with SimScale, with reported agreement around ±8% for the compared cases. These results guide insulation, sensor placement, nozzle design, cooling, and safe timing decisions.": "Cea mai lungă campanie înregistrată conține 6.331 de eșantioane în aproximativ 108,6 minute. Modelarea termică a fost comparată cu SimScale, cu o concordanță raportată de aproximativ ±8% pentru cazurile comparate. Rezultatele ghidează izolația, poziționarea senzorilor, proiectarea duzei, răcirea și timpii de siguranță.",
    "Evidence source: barrel-tuning campaign recorded April 16, 2026 and summarized in the public technical notebook.": "Sursa dovezilor: campania de reglare a cilindrului înregistrată la 16 aprilie 2026 și rezumată în caietul tehnic public.",
    "05 / Electronics and controls": "05 / Electronică și control",
    "Prototype flexibility with explicit machine ownership.": "Flexibilitate de prototip cu responsabilități clare în mașină.",
    "The integrated control stack is centered on a NUCLEO-H753ZI. It interfaces with thermocouple modules, heater switching, stepper drivers, the injection servo path, safety inputs, and the communication bridge.": "Sistemul de control integrat este centrat pe NUCLEO-H753ZI. Acesta comunică cu modulele de termocupluri, comutarea încălzitoarelor, driverele motoarelor pas cu pas, servomotorul de injecție, intrările de siguranță și puntea de comunicație.",
    "A dedicated Origin motherboard has been designed in KiCad to organize the current prototype wiring into a cleaner integration layer. It remains a prototype electronics project and is not presented as a certified production controller.": "O placă de bază Origin dedicată a fost proiectată în KiCad pentru a organiza cablajul prototipului într-un strat de integrare mai curat. Rămâne un proiect electronic de prototip și nu este prezentată drept controler de producție certificat.",
    "06 / Firmware and operator stack": "06 / Firmware și sistem de operare",
    "Control remains close to the machine.": "Controlul rămâne aproape de mașină.",
    "The Nucleo owns safety admission, heating, movement, and cycle sequencing.": "Nucleo gestionează admiterea de siguranță, încălzirea, mișcarea și secvențierea ciclului.",
    "The ESP32-C6 acts as a narrow same-network HTTP-to-command bridge.": "ESP32-C6 funcționează ca o punte restrânsă HTTP-comandă în aceeași rețea.",
    "The Android operator app presents status, supported actions, and service access.": "Aplicația Android pentru operator afișează starea, acțiunile acceptate și accesul de service.",
    "A desktop serial monitor and diagnostic sketches support commissioning and fault analysis.": "Un monitor serial desktop și sketch-uri de diagnosticare sprijină punerea în funcțiune și analiza defectelor.",
    "The public operator APK is a prototype artifact for supervised demonstrations. It is not a general-purpose machine controller and should not be treated as a production release.": "APK-ul public pentru operator este un artefact prototip pentru demonstrații supravegheate. Nu este un controler general al mașinii și nu trebuie tratat ca o versiune de producție.",
    "07 / Safety position": "07 / Poziția privind siguranța",
    "Current use is supervised and prototype-only.": "Utilizarea actuală este supravegheată și limitată la prototip.",
    "The project combines mains-powered heating, hot surfaces, and powered motion. The current machine is operated as a supervised prototype. Emergency-stop behavior, safe startup defaults, fault handling, grounding, power isolation, and guarded access remain critical requirements.": "Proiectul combină încălzirea alimentată de la rețea, suprafețe fierbinți și mișcare acționată. Mașina actuală este operată ca prototip supravegheat. Oprirea de urgență, pornirea sigură, gestionarea defectelor, împământarea, izolarea alimentării și accesul protejat rămân cerințe critice.",
    "A future product version requires a cleaner enclosure, stronger hardware isolation, validated safety behavior, and a formal review appropriate to its intended users and environment.": "O viitoare versiune de produs necesită o carcasă mai bine definită, izolare hardware mai puternică, comportament de siguranță validat și o evaluare formală adecvată utilizatorilor și mediului vizat.",
    "08 / Validation evidence": "08 / Dovezi de validare",
    "The project has crossed from simulation into physical evidence.": "Proiectul a trecut de la simulare la dovezi fizice.",
    "A first successful injected part has been produced.": "A fost produsă prima piesă injectată cu succes.",
    "Thermal behavior has been measured with logged sensors and a thermal camera.": "Comportamentul termic a fost măsurat cu senzori înregistrați și o cameră termică.",
    "Major mechanical, electrical, firmware, and operator subsystems have been integrated.": "Subsistemele principale mecanice, electrice, firmware și de operare au fost integrate.",
    "A dedicated PCB and a complete operator/control stack have been developed.": "Au fost dezvoltate un PCB dedicat și un sistem complet de operare și control.",
    "The first part is evidence of system function, not proof of production readiness. Its defects are useful because they identify the next work in venting, fill behavior, tooling, and process calibration.": "Prima piesă este dovada funcționării sistemului, nu a pregătirii pentru producție. Defectele sale sunt utile deoarece indică următoarele lucrări privind aerisirea, umplerea, matrițele și calibrarea procesului.",
    "Validation record: public technical notebook, centralized June 11, 2026, with original measurements and active software/firmware sources retained.": "Registrul validării: caiet tehnic public, centralizat la 11 iunie 2026, cu măsurătorile originale și sursele software/firmware active păstrate.",
    "09 / Current limits": "09 / Limite actuale",
    "What remains unproven.": "Ce rămâne nedemonstrat.",
    "Stable multi-part repeatability across longer runs.": "Repetabilitate stabilă pentru mai multe piese în sesiuni mai lungi.",
    "Long-run life and failure behavior of resin tooling.": "Durata de viață și modul de cedare al matrițelor din rășină în utilizare îndelungată.",
    "Fully tuned filling, holding, venting, and ejection behavior.": "Comportament complet reglat pentru umplere, menținere, aerisire și ejectare.",
    "Final enclosure safety and production-grade electrical integration.": "Siguranța carcasei finale și integrare electrică la nivel de producție.",
    "Validated process windows across multiple material families.": "Ferestre de proces validate pentru mai multe familii de materiale.",
    "10 / Product direction": "10 / Direcția produsului",
    "Turn the experiment into a dependable platform.": "Transformarea experimentului într-o platformă fiabilă.",
    "The next Origin direction focuses on repeatability, stronger process sensing, better thermal insulation, refined mold interfaces, safer enclosure design, cleaner electronics, and a simpler operator workflow.": "Următoarea direcție Origin se concentrează pe repetabilitate, senzori de proces mai buni, izolație termică îmbunătățită, interfețe rafinate pentru matrițe, o carcasă mai sigură, electronică mai curată și un flux de operare mai simplu.",
    "The long-term ambition is a useful workshop and education platform that can produce functional small parts, teach the complete molding process, and help hardware teams make better tooling decisions earlier.": "Ambiția pe termen lung este o platformă utilă pentru atelier și educație, capabilă să producă piese mici funcționale, să predea procesul complet de injecție și să ajute echipele hardware să ia mai devreme decizii mai bune despre matrițe.",
    "11 / Team": "11 / Echipa",
    "Engineering lead: mechanics, manufacturing, electronics, integration, and product development.": "Coordonare inginerie: mecanică, producție, electronică, integrare și dezvoltare de produs.",
    "Team and business lead: strategy, economics, sponsorships, organization, and presentation.": "Coordonare echipă și business: strategie, economie, sponsorizări, organizare și prezentare.",
    "Simulation and analysis lead: SimScale, Python models, mathematics, and data analysis.": "Coordonare simulare și analiză: SimScale, modele Python, matematică și analiză de date.",
    "Embedded programming: Arduino, C++, C, backend development, automations, and system integration.": "Programare embedded: Arduino, C++, C, dezvoltare backend, automatizări și integrarea sistemelor.",
    "Public technical dossier / integrated prototype in active calibration.": "Dosar tehnic public / prototip integrat în calibrare activă.",

    "InFlux Origin AI overview": "Prezentare InFlux Origin pentru AI",
    "InFlux Origin structured project context": "Context structurat al proiectului InFlux Origin",
    "InFlux Origin AI technical context": "Context tehnic InFlux Origin pentru AI",
    "Open InFlux home": "Deschide pagina principală InFlux",
    "InFlux Origin home": "Pagina principală InFlux Origin",
    "Project views": "Secțiunile proiectului",
    "Primary navigation": "Navigare principală",
    "CAD render of the InFlux Origin MK1 machine": "Randare CAD a mașinii InFlux Origin MK1",
    "Original hand-drawn InFlux injection molding system sketch": "Schița originală, desenată manual, a sistemului de injecție InFlux",
    "The first hand-drawn InFlux Origin MK1 logo on the cardboard prototype": "Prima siglă InFlux Origin MK1 desenată manual pe prototipul din carton",
    "Early InFlux MK1 wireframe plan": "Plan wireframe timpuriu pentru InFlux MK1",
    "InFlux Origin MK1 integrated machine render": "Randare a mașinii integrate InFlux Origin MK1",
    "InFlux packaging and product development concept": "Concept de ambalaj și dezvoltare de produs InFlux",
    "Preview of the InFlux Origin MK1 assembly": "Previzualizare a ansamblului InFlux Origin MK1",
    "Other project stages": "Alte etape ale proiectului",
    "InFlux Operator application screens": "Ecranele aplicației InFlux Operator",
    "InFlux Operator dashboard screen": "Ecranul principal InFlux Operator",
    "InFlux Operator production and temperature controls": "Comenzi de producție și temperatură în InFlux Operator",
    "InFlux Operator machine movement controls": "Comenzi de mișcare ale mașinii în InFlux Operator",
    "Annotated view of the Origin motherboard design": "Vedere adnotată a proiectului plăcii de bază Origin",
    "Landscape view of the InFlux Origin motherboard PCB layout": "Vedere panoramică a layoutului PCB al plăcii de bază InFlux Origin",
    "Annotated thermal testing results": "Rezultate adnotate ale testelor termice",
    "Thermal camera image captured during InFlux testing": "Imagine termică surprinsă în timpul testelor InFlux",
    "Thermal testing equipment used on the InFlux machine": "Echipament de testare termică folosit pentru mașina InFlux",
    "Stefan Tonegari at a Volta Circuits event": "Stefan Tonegari la un eveniment Volta Circuits",
    "Pintilei David at a Volta Circuits event": "Pintilei David la un eveniment Volta Circuits",
    "Fabian Volintiru portrait not yet published": "Portretul lui Fabian Volintiru nu este încă publicat",
    "Ciprian Ursu portrait not yet published": "Portretul lui Ciprian Ursu nu este încă publicat",
    "Apply to join InFlux using Google Forms (opens in a new tab)": "Aplică pentru a te alătura InFlux prin Google Forms (se deschide într-o filă nouă)",
    "Current InFlux sponsors": "Sponsorii actuali InFlux",
    "Volta Circuits team uniform render showing sponsor placement areas": "Randare a uniformei echipei Volta Circuits cu zonele pentru sponsori",
    "First successfully injected InFlux part": "Prima piesă InFlux injectată cu succes",
    "InFlux thermal testing in the laboratory": "Testarea termică InFlux în laborator",
    "Landscape view of the InFlux dedicated motherboard design": "Vedere panoramică a plăcii de bază dedicate InFlux",
    "Box containing 56 parts injected by InFlux Origin MK1": "Cutie cu 56 de piese injectate de InFlux Origin MK1",
    "Mold life validation": "Validarea duratei de viață a matriței",
    "Continuous running validation": "Validarea funcționării continue",
    "Production readiness validation": "Validarea pregătirii pentru producție",
    "Process calibration validation": "Validarea calibrării procesului",
    "Interactive 3D assembly of InFlux Origin MK1": "Ansamblu 3D interactiv al InFlux Origin MK1"
  });

  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let currentLanguage = "en";
  let observer;
  let refreshScheduled = false;
  let memoryLanguage = "en";

  function normalize(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function readStoredLanguage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED_LANGUAGES.has(stored) ? stored : memoryLanguage;
    } catch {
      return memoryLanguage;
    }
  }

  function storeLanguage(language) {
    memoryLanguage = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage is optional; the control remains functional for this page session.
    }
  }

  function translatedValue(source, language) {
    if (language !== "ro") return source;
    return RO[normalize(source)] || source;
  }

  function translateTextNode(node, language) {
    if (!node.nodeValue || !normalize(node.nodeValue)) return;
    if (node.parentElement?.closest("[data-no-i18n], script, style, svg, code, pre")) return;

    let record = originalText.get(node);
    if (!record || node.nodeValue !== record.rendered) {
      record = { source: node.nodeValue, rendered: node.nodeValue };
      originalText.set(node, record);
    }

    const leading = record.source.match(/^\s*/)?.[0] || "";
    const trailing = record.source.match(/\s*$/)?.[0] || "";
    const sourceKey = normalize(record.source);
    const next = language === "ro" && RO[sourceKey]
      ? `${leading}${RO[sourceKey]}${trailing}`
      : record.source;

    if (node.nodeValue !== next) node.nodeValue = next;
    record.rendered = next;
  }

  function translateAttributes(element, language) {
    if (element.closest?.("[data-no-i18n]")) return;
    const attributes = ["aria-label", "title", "alt", "placeholder"];
    let records = originalAttributes.get(element);
    if (!records) {
      records = new Map();
      originalAttributes.set(element, records);
    }

    attributes.forEach((attribute) => {
      if (!element.hasAttribute?.(attribute)) return;
      const current = element.getAttribute(attribute);
      let record = records.get(attribute);
      if (!record || current !== record.rendered) {
        record = { source: current, rendered: current };
        records.set(attribute, record);
      }
      const next = translatedValue(record.source, language);
      if (current !== next) element.setAttribute(attribute, next);
      record.rendered = next;
    });
  }

  function translateTree(root, language) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, language);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root, language);
    root.querySelectorAll?.("*").forEach((element) => translateAttributes(element, language));

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node, language);
  }

  function updateToggle(language) {
    document.querySelectorAll("[data-language]").forEach((button) => {
      const active = button.dataset.language === language;
      button.setAttribute("aria-pressed", String(active));
      button.tabIndex = active ? 0 : -1;
    });
  }

  function applyLanguage(language, { persist = true, announce = true } = {}) {
    const nextLanguage = SUPPORTED_LANGUAGES.has(language) ? language : "en";
    currentLanguage = nextLanguage;
    document.documentElement.lang = nextLanguage;
    translateTree(document.documentElement, nextLanguage);
    updateToggle(nextLanguage);
    document.documentElement.classList.remove("i18n-ro-pending");
    if (persist) storeLanguage(nextLanguage);

    if (announce) {
      const status = document.querySelector("[data-language-status]");
      if (status) {
        status.textContent = nextLanguage === "ro"
          ? "Limba română este activă."
          : "English is active.";
      }
    }

    window.dispatchEvent(new CustomEvent("influxlanguagechange", {
      detail: { language: nextLanguage }
    }));
  }

  function injectToggle() {
    const header = document.querySelector(".site-header");
    const brand = header?.querySelector(":scope > .brand");
    if (!header || !brand || header.querySelector(".language-toggle")) return;

    const identity = document.createElement("div");
    identity.className = "header-identity";
    header.insertBefore(identity, brand);
    identity.appendChild(brand);

    const toggle = document.createElement("div");
    toggle.className = "language-toggle";
    toggle.setAttribute("role", "group");
    toggle.setAttribute("aria-label", "Language / Limbă");
    toggle.setAttribute("data-no-i18n", "");
    toggle.innerHTML = `
      <button type="button" data-language="en" aria-label="English / Engleză" aria-pressed="false">EN</button>
      <span aria-hidden="true">/</span>
      <button type="button" data-language="ro" aria-label="Romanian / Română" aria-pressed="false">RO</button>
      <span class="visually-hidden" aria-live="polite" data-language-status></span>`;
    identity.appendChild(toggle);

    toggle.addEventListener("click", (event) => {
      const button = event.target.closest("[data-language]");
      if (!button) return;
      applyLanguage(button.dataset.language);
    });

    toggle.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const language = event.key === "ArrowRight" ? "ro" : "en";
      applyLanguage(language);
      toggle.querySelector(`[data-language="${language}"]`)?.focus();
    });
  }

  function scheduleRefresh() {
    if (refreshScheduled) return;
    refreshScheduled = true;
    requestAnimationFrame(() => {
      refreshScheduled = false;
      translateTree(document.documentElement, currentLanguage);
      updateToggle(currentLanguage);
    });
  }

  function observeDynamicContent() {
    observer?.disconnect();
    observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) =>
        mutation.type === "childList" ||
        mutation.type === "characterData" ||
        mutation.type === "attributes"
      )) scheduleRefresh();
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label", "title", "alt", "placeholder"]
    });
  }

  function init() {
    injectToggle();
    memoryLanguage = document.documentElement.lang === "ro" ? "ro" : "en";
    applyLanguage(readStoredLanguage(), { persist: false, announce: false });
    observeDynamicContent();
  }

  window.InFluxI18n = Object.freeze({
    setLanguage: (language) => applyLanguage(language),
    getLanguage: () => currentLanguage,
    refresh: scheduleRefresh,
    translateValue: (value) => translatedValue(value, currentLanguage)
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
