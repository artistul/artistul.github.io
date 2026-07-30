(() => {
  "use strict";

  const STORAGE_KEY = "influx-language";
  const SUPPORTED_LANGUAGES = new Set(["en", "ro"]);

  const RO = Object.freeze({
    "Desktop Injection Molding Machine | InFlux Origin": "Mașină desktop pentru injecția maselor plastice | InFlux Origin",
    "Machine Versions | InFlux Origin": "Versiunile mașinii | InFlux Origin",
    "Team | InFlux Origin": "Echipă | InFlux Origin",
    "Sponsors | InFlux Origin": "Sponsori | InFlux Origin",
    "Contact Us | InFlux Origin": "Contactează-ne | InFlux Origin",
    "Proof | InFlux Origin": "Validare | InFlux Origin",
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
    "Proof": "Validare",
    "Contact Us": "Contactează-ne",
    "Sponsors": "Sponsori",
    "Downloads": "Descărcări",
    "Back to top ↑": "Înapoi la început ↑",
    "Open navigation menu": "Deschide meniul de navigare",
    "Close navigation menu": "Închide meniul de navigare",

    "Real": "Producție",
    "manufacturing.": "reală.",
    "Desktop scale.": "În format desktop.",
    "InFlux Origin bridges the gap between a 3D printed prototype and industrial manufacturing with real thermoplastic shots, resin 3D printed molds, and an easy-to-use operator app!": "InFlux Origin face legătura dintre un prototip imprimat 3D și producția industrială: injectează termoplastice reale în matrițe din rășină imprimate 3D și este controlată printr-o aplicație simplă pentru operator!",
    "See the evidence": "Vezi rezultatele",
    "Explore the machine": "Explorează mașina",
    "Why InFlux?": "De ce InFlux?",
    "The middle ground should not be empty.": "Spațiul dintre prototip și industrie nu ar trebui să fie gol.",
    "You can print a model in hours or dump tens of thousands of euros into industrial manufacturing. Why not something in between? Faster than 3D printing. Semi-industrial quantities.": "Poți imprima un model în câteva ore sau poți investi zeci de mii de euro în producție industrială. De ce să nu existe ceva între ele? Mai rapid decât imprimarea 3D. Cantități semi-industriale.",
    "Influx is the answer.": "InFlux este răspunsul.",
    "Evidence route": "Etapele validării",
    "From an ambitious idea to a working machine.": "De la o idee ambițioasă la o mașină funcțională.",
    "Thermal tested": "Testată termic",
    "6,331 samples in the longest captured campaign.": "6.331 de măsurători în cea mai lungă sesiune de testare.",
    "Control stack built": "Sistem de control integrat",
    "Firmware, Wi-Fi bridge, operator app, and servicing functions.": "Firmware, punte Wi-Fi, aplicație pentru operator și funcții de diagnosticare și întreținere.",
    "Part injected": "Piesă injectată",
    "We don't try to convince. We prove.": "Nu încercăm să convingem. Demonstrăm.",
    "Public resources": "Resurse publice",
    "Built to be inspected, questioned, and improved.": "Conceput pentru a fi analizat, testat și îmbunătățit.",
    "Meet the team": "Cunoaște echipa",

    "From an idea": "De la o idee",
    "to a": "la o",
    "working machine.": "mașină funcțională.",
    "We didn't build it all in one day. We took it step by step, making sure to improve along the way.": "Nu am construit-o într-o singură zi. Am avansat pas cu pas, îmbunătățind-o pe parcurs.",
    "An idea appears": "Apare ideea",
    "Sketches": "Schițe",
    "My 3D printer is too slow and we can't afford industrial machinery. But what is in between?": "Imprimanta mea 3D este prea lentă, iar utilajele industriale sunt prea scumpe. Dar ce există între ele?",
    "Thus, we started sketching a machine that can manufacture high quantities for cheap.": "Așa am început să schițăm o mașină capabilă să producă volume mai mari la cost redus.",
    "Research the injection process": "Studierea procesului de injecție",
    "Separate the machine into sub-systems": "Împărțirea mașinii în subsisteme",
    "Separate the sub-systems into individual components": "Împărțirea subsistemelor în componente",
    "Physical experiments": "Experimente fizice",
    "The beginning of InFlux": "Începutul InFlux",
    "The idea proved possible, so we defined a brand identity. We don't sell a generic injection molding machine.": "Ideea s-a dovedit viabilă, așa că am creat o identitate de brand. Nu construim o mașină generică de injecție.",
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
    "Desktop sized": "Format desktop",
    "Water-cooled resin and metal mold compatibility": "Compatibilă cu matrițe din rășină și metal răcite cu apă",
    "Fully compatible with the Influx Operator app": "Complet compatibilă cu aplicația InFlux Operator",
    "Future product direction": "Direcția următoarei versiuni",
    "Next up": "Urmează",
    "The next version will focus on a fully automated and monitored process, with water, molten plastic, and mold pressure monitoring. Designed for continuous thrustworthy operation.": "Următoarea versiune va automatiza și monitoriza complet procesul, inclusiv apa de răcire, plasticul topit și presiunea din matriță. Va fi proiectată pentru funcționare continuă și fiabilă.",
    "Full machine enclosure": "Carcasă completă a mașinii",
    "Pressure sensing and temperature balancing": "Măsurarea presiunii și echilibrarea temperaturii",
    "Printed molds lifetime improvements": "Creșterea duratei de viață a matrițelor imprimate",
    "Interactive assembly": "Ansamblu interactiv",
    "Inspect the machine, not just the pitch.": "Analizează mașina, nu doar prezentarea.",
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
    "Validation evidence": "Rezultate de validare",
    "Operator interface": "Interfața operatorului",
    "Everything the operator needs, in one place.": "Tot ce îi trebuie operatorului, într-un singur loc.",
    "A dedicated interface with internet connectivity. It includes complete machine monitoring, control and servicing functions.": "O interfață dedicată, cu acces la rețea. Include monitorizarea și controlul complet al mașinii, precum și funcții de diagnosticare și întreținere.",
    "This is where the machine starts thinking.": "Aici începe mașina să gândească.",
    "A custom PCB that serves as the central hub for every part of the machine. Offers the possibility for easy expansion and component replacement.": "O placă PCB personalizată care conectează și coordonează toate componentele mașinii. Permite extinderea și înlocuirea ușoară a acestora.",
    "Thermal testing": "Testare termică",
    "We measure instead of guessing.": "Măsurăm în loc să presupunem.",
    "We measured heating and cooling time, temperature stability, sensor precision and heat spread to improve the next version of the machine.": "Am măsurat timpul de încălzire și răcire, stabilitatea temperaturii, precizia senzorilor și distribuția căldurii pentru a îmbunătăți următoarea versiune.",

    "Team Volta Circuits": "Echipa Volta Circuits",
    "Four disciplines.": "Patru discipline.",
    "One physical result.": "Un rezultat fizic.",
    "InFlux is built at the intersection of engineering, analysis and business. Nothing is left out.": "InFlux reunește ingineria, analiza și strategia de business. Fiecare aspect contează.",
    "Engineering lead": "Coordonator inginerie",
    "Mechanical engineering, manufacturing, CAD design, electrical integration, microcontrollers, and product development.": "Inginerie mecanică, producție, proiectare CAD, integrare electrică, microcontrolere și dezvoltare de produs.",
    "Build the machine.": "Construiește mașina.",
    "Simulation + analysis lead": "Coordonator simulare și analiză",
    "Math, SimScale, Unreal Engine simulations, Python models, machine learning, and data analysis.": "Matematică, SimScale, simulări în Unreal Engine, modele Python, învățare automată și analiză de date.",
    "Prove the decisions.": "Justifică deciziile prin date.",
    "Business lead": "Coordonator business",
    "Marketing, sponsorships, economics, logistics, and pitching.": "Marketing, sponsorizări, economie, logistică și prezentare.",
    "Sell the idea.": "Prezintă ideea.",
    "Embedded programming": "Programare embedded",
    "Arduino, C++, C, backend development, automations, and system integration.": "Arduino, C++, C, dezvoltare backend, automatizări și integrarea sistemelor.",
    "Make it think.": "Fă mașina să gândească.",
    "Working principle": "Principiu de lucru",
    "Plan. Build. Measure. Explain. As simple as that.": "Planifică. Construiește. Măsoară. Explică. Atât de simplu.",
    "Public collaboration path": "Cum poți colabora",
    "Review the work.": "Analizează proiectul.",
    "Challenge us.": "Pune-ne la încercare.",
    "Start with the public dossier, inspect the current artifacts, or follow the active repository.": "Începe cu dosarul public, consultă resursele disponibile sau urmărește repository-ul proiectului.",
    "Read technical dossier": "Citește dosarul tehnic",
    "Open public artifacts": "Deschide resursele publice",
    "View repository": "Deschide repository-ul",

    "Contact": "Contactează-",
    "Us": "ne",
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
    "We are looking for driven people ready to turn ambitious engineering into working hardware, software, and proof.": "Căutăm oameni motivați, gata să transforme idei ambițioase de inginerie în hardware și software funcțional, susținute de rezultate concrete.",
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
    "Your brand can travel with the team.": "Brandul tău poate fi prezent oriunde merge echipa.",
    "Sponsorship packages can include visible placement on our uniforms and public presentation materials.": "Pachetele de sponsorizare pot include afișarea vizibilă a brandului pe uniformele noastre și în materialele publice de prezentare.",

    "Proof of the prototype": "Validarea prototipului",
    "Not perfect.": "Nu este perfect.",
    "But it proves the concept.": "Dar demonstrează conceptul.",
    "A bad-looking first part doesn't prove the machine is poorly made. It proves the machine can control heat, melt plastic, control injection amount, flow cooling water, clamp molds and eject parts.": "O primă piesă imperfectă nu înseamnă că mașina este prost construită. Demonstrează că mașina poate regla temperatura, topi plasticul, doza materialul injectat, asigura circulația apei de răcire, închide matrița și ejecta piesele.",
    "samples in the longest captured thermal campaign, recorded April 16, 2026": "măsurători în cea mai lungă sesiune de testare termică, înregistrată la 16 aprilie 2026",
    "measured heat-up, stabilization, and cooldown period": "perioadă măsurată de încălzire, stabilizare și răcire",
    "reported thermal model agreement with SimScale simulations": "concordanță raportată a modelului termic cu simulările SimScale",
    "operator app, machine, and safety all in one system": "aplicația, controlul mașinii și funcțiile de siguranță într-un singur sistem",
    "Thermal tests": "Teste termice",
    "Measurements defined the variables.": "Măsurătorile au definit parametrii procesului.",
    "Thermal camera images and logged sensor data exposed heat loss, hot spots, and control behavior before those weaknesses became hidden inside an enclosure.": "Imaginile termice și datele înregistrate de senzori au evidențiat pierderile de căldură, punctele fierbinți și comportamentul sistemului de control înainte ca aceste probleme să fie ascunse de carcasă.",
    "Centralised control": "Control centralizat",
    "Every action answers to the same hub.": "Toate funcțiile sunt coordonate din același centru.",
    "The connectivity board communicates with the user, so the motherboard can focus on safety and precise control. All settings, sensors and outputs are controlled by the motherboard, running an STM32.": "Placa de conectivitate comunică cu utilizatorul, astfel încât placa de bază să se poată concentra pe siguranță și control precis. Toate setările, datele senzorilor și ieșirile sunt gestionate de placa de bază bazată pe STM32.",
    "Repeatability": "Repetabilitate",
    "56 parts.": "56 de piese.",
    "One mold.": "O singură matriță.",
    "A single 3D printed resin mold was able to produce 56 individual parts before failure. Analysis revealed failure points and proposed quality-of-life improvements. The next version WILL be better.": "O singură matriță din rășină imprimată 3D a produs 56 de piese înainte de cedare. Analiza a identificat punctele de cedare și posibile îmbunătățiri practice. Următoarea versiune VA fi mai bună.",
    "Prototype status": "Starea prototipului",
    "What is not proven.": "Ce nu este încă demonstrat.",
    ". . .yet": "… încă",
    "Mold life": "Durata de viață a matriței",
    "Resin mold durability across continuous, repeated cycles.": "Durabilitatea matrițelor din rășină în cicluri continue și repetate.",
    "Continuous running": "Funcționare continuă",
    "Stable output quality across longer, controlled runs.": "Calitate constantă în sesiuni controlate de durată mai mare.",
    "Price reduction": "Reducerea prețului",
    "Reducing the profitable selling cost as much as possible.": "Reducerea prețului de vânzare fără a compromite profitabilitatea.",
    "Max water temperature": "Temperatura maximă a apei",
    "Maximum temperature the mold cooling water reaches during normal operation.": "Temperatura maximă atinsă de apa de răcire a matriței în funcționare normală.",
    "Milestones": "Etape-cheie",

    "Download Hub": "Centru de descărcări",
    "Public files.": "Fișiere publice.",
    "Clearly labeled.": "Etichetate clar.",
    "Welcome to the download hub! Check out the app, technical notebook or the branding materials.": "Bine ai venit în centrul de descărcări! Explorează aplicația, caietul tehnic sau materialele de brand.",
    "JavaScript is disabled. Direct files:": "JavaScript este dezactivat. Fișiere directe:",
    "Operator APK": "APK Operator",
    "technical notebook": "caiet tehnic",
    "logo SVG": "siglă SVG",
    "Prototype notice:": "Avertisment privind prototipul:",
    "The public Influx Operator APK is still in development. Do not use it as a general-purpose machine controller. Constant machine supervision is required.": "APK-ul public InFlux Operator este încă în dezvoltare. Nu îl folosi ca sistem general de control al mașinii. Este necesară supravegherea permanentă.",
    "Integrity:": "Integritate:",
    "SHA-256 checksums are published in": "Sumele de control SHA-256 sunt publicate în",
    ". If the checksums don't check out, your file is NOT from Influx! Be careful of modified installations!": ". Dacă sumele nu corespund, fișierul NU provine de la InFlux! Atenție la instalările modificate!",
    "InFlux Operator APK": "APK InFlux Operator",
    "Prototype operator artifact": "Versiune prototip pentru operator",
    "Latest version of the Influx Origin control app.": "Cea mai nouă versiune a aplicației de control InFlux Origin.",
    "Android APK / 19.79 MB / June 2026": "APK Android / 19,79 MB / iunie 2026",
    "ONCS operator artifact": "Versiunea pentru operator folosită la ONCS",
    "Auto Connect app build used for the ONCS presentation path.": "Versiunea aplicației Auto Connect folosită în prezentarea ONCS.",
    "Android APK / 19.79 MB / May 2026": "APK Android / 19,79 MB / mai 2026",
    "Technical Notebook": "Caiet tehnic",
    "Public documentation / PDF": "Documentație publică / PDF",
    "Ten-page public notebook covering the project, system, testing, and direction.": "Caiet public de zece pagini despre proiect, sistem, testare și direcție.",
    "PDF / 645 KB / June 2026": "PDF / 645 KB / iunie 2026",
    "Extended Technical Dossier": "Dosar tehnic extins",
    "Public documentation / web": "Documentație publică / web",
    "Long-form documentation covering mechanics, control, validation, limits, and next steps.": "Documentație amplă despre mecanică, control, validare, limite și pașii următori.",
    "Web technical notebook": "Caiet tehnic online",
    "InFlux Origin Logo": "Sigla InFlux Origin",
    "Public brand asset / SVG": "Material public de identitate vizuală / SVG",
    "Scalable monochrome logo for project references and approved public coverage.": "Siglă monocromă scalabilă pentru prezentarea proiectului și utilizare publică aprobată.",

    "External Links + References": "Linkuri externe + referințe",
    "Follow the work.": "Urmărește proiectul.",
    "Check the sources.": "Verifică sursele.",
    "Public project destinations and technical references that informed the platform.": "Pagini publice ale proiectului și referințe tehnice care au contribuit la dezvoltarea platformei.",
    "Project destinations": "Pagini ale proiectului",
    "Technical documentation": "Documentație tehnică",
    "Read the extended project dossier": "Citește dosarul extins al proiectului",
    "Download hub": "Centru de descărcări",
    "APK, notebook, and public brand files": "APK, caiet și fișiere publice de brand",
    "Evidence overview": "Rezultatele validării",
    "Results, measurements, and current limits": "Rezultate, măsurători și limite actuale",
    "Public repository": "Repository public",
    "Inspect the active software and firmware record": "Consultă software-ul și firmware-ul aflate în dezvoltare",
    "Technical references": "Referințe tehnice",
    "Low-volume injection molding with 3D printed molds": "Injecție în volume mici cu matrițe imprimate 3D",
    "Plastic injection molding design guidelines": "Ghid de proiectare pentru injecția maselor plastice",
    "NUCLEO-H753ZI product documentation": "Documentația produsului NUCLEO-H753ZI",
    "Thermocouple fundamentals": "Principiile termocuplurilor",

    "Public technical dossier": "Dosar tehnic public",
    "A desktop injection molding platform integrating mechanics, thermal control, machine firmware, operator software, safety logic, and experimental tooling.": "O platformă desktop pentru injecția maselor plastice, care integrează mecanica, controlul termic, firmware-ul mașinii, software-ul operatorului, funcțiile de siguranță și matrițele experimentale.",
    "Download notebook": "Descarcă caietul",
    "Back to project hub": "Înapoi la pagina proiectului",
    "Current state": "Stare actuală",
    "Integrated prototype in active calibration": "Prototip integrat, în curs de calibrare",
    "Primary objective": "Obiectiv principal",
    "Repeatable small-part thermoplastic injection": "Injecție repetabilă de piese mici din termoplastic",
    "Tooling direction": "Direcția matrițelor",
    "Rapid resin molds with controlled cooling": "Matrițe rapide din rășină, cu răcire controlată",
    "Control path": "Fluxul de control",
    "Android operator → ESP bridge → Nucleo firmware": "Operator Android → punte ESP → firmware Nucleo",
    "Volta Circuits": "Volta Circuits",
    "Contents": "Cuprins",
    "1. Project definition": "1. Definirea proiectului",
    "2. System architecture": "2. Arhitectura sistemului",
    "3. Mechanical system": "3. Sistemul mecanic",
    "4. Thermal system": "4. Sistemul termic",
    "5. Electronics and controls": "5. Electronică și control",
    "6. Firmware and operator stack": "6. Firmware și interfața operatorului",
    "7. Safety position": "7. Siguranța prototipului",
    "8. Validation evidence": "8. Rezultatele validării",
    "9. Current limits": "9. Limite actuale",
    "10. Product direction": "10. Direcția produsului",
    "11. Team": "11. Echipa",
    "01 / Project definition": "01 / Definirea proiectului",
    "Manufacturing evidence before industrial tooling.": "Validarea producției înainte de investiția în matrițe industriale.",
    "InFlux Origin MK1 is a desktop-scale injection molding prototype built to help teams learn from real thermoplastic parts before committing to conventional production tooling. It is intended for process learning, functional validation, education, and future short-run experimentation.": "InFlux Origin MK1 este un prototip desktop de injecție, conceput pentru a ajuta echipele să testeze procesul pe piese reale din termoplastic înainte de a investi în matrițe convenționale de producție. Este destinat studiului procesului, validării funcționale, educației și viitoarelor experimente în serii scurte.",
    "The project does not claim to replace an industrial injection molding machine. Its purpose is to reduce the distance between a 3D printed model and a professionally tooled production part by making the molding process more accessible, measurable, and iterative.": "Proiectul nu pretinde că înlocuiește o mașină industrială de injecție. Scopul său este să faciliteze trecerea de la un model imprimat 3D la o piesă realizată cu matrițe profesionale, făcând procesul mai accesibil, măsurabil și ușor de îmbunătățit prin testare repetată.",
    "02 / System architecture": "02 / Arhitectura sistemului",
    "A complete machine, not an isolated mechanism.": "O mașină completă, nu un mecanism izolat.",
    "The platform is organized into six connected layers:": "Platforma este organizată în șase subsisteme interconectate:",
    "Structural frame and aligned movement system.": "Cadru structural și sistem de mișcare aliniat.",
    "Heated barrel, nozzle, and piston-driven injection path.": "Cilindru încălzit, duză și sistem de injecție acționat de piston.",
    "Mold support, closing movement, and rapid tooling package.": "Suport pentru matriță, mecanism de închidere și sistem de matrițare rapidă.",
    "Power distribution, sensors, motion drivers, and emergency inputs.": "Distribuția alimentării, senzori, drivere pentru motoare și intrări de oprire de urgență.",
    "Nucleo machine firmware and ESP32-C6 communication bridge.": "Firmware-ul mașinii pe Nucleo și puntea de comunicație ESP32-C6.",
    "Android operator interface and diagnostic support tools.": "Interfață Android pentru operator și instrumente de diagnosticare.",
    "The Nucleo controller owns machine state, heating, motion, safety checks, and cycle behavior. The ESP bridge translates same-network operator requests into the machine command protocol. The Android application presents status and sends supported commands.": "Controlerul Nucleo gestionează starea mașinii, încălzirea, mișcarea, verificările de siguranță și desfășurarea ciclurilor. Puntea ESP transformă cererile trimise de operator prin rețeaua locală în comenzi pentru mașină. Aplicația Android afișează starea și trimite comenzile acceptate.",
    "Confirmed platform summary": "Rezumatul configurației actuale",
    "Machine controller": "Controlerul mașinii",
    "Communication bridge": "Punte de comunicație",
    "ESP32-C6 / local HTTP to acknowledged UART commands": "ESP32-C6 / HTTP în rețeaua locală → comenzi UART cu confirmare",
    "Operator interface": "Interfața operatorului",
    "Android application for status and supported commands": "Aplicație Android pentru afișarea stării și trimiterea comenzilor acceptate",
    "Thermal sensing": "Monitorizare termică",
    "Multiple K-type thermocouples across the heated barrel": "Mai multe termocupluri tip K distribuite de-a lungul cilindrului încălzit",
    "3D-printed photopolymer resin molds with controlled water cooling": "Matrițe din rășină fotopolimerică imprimate 3D, cu răcire controlată cu apă",
    "Current status": "Stare actuală",
    "Supervised integrated prototype in active calibration": "Prototip integrat și supravegheat, în curs de calibrare",
    "03 / Mechanical system": "03 / Sistemul mecanic",
    "Alignment and load paths decide whether the process is repeatable.": "Alinierea și modul în care structura preia forțele determină repetabilitatea procesului.",
    "The current structure uses aluminum extrusion, interface plates, linear guidance, lead-screw movement, and a servo-driven injection axis. The architecture remains adjustable because the prototype is still being calibrated around real component behavior and mold geometry.": "Structura actuală folosește profile de aluminiu, plăci de interfață, ghidaje liniare, acționare cu șuruburi de avans și o axă de injecție acționată de servomotor. Arhitectura rămâne reglabilă, deoarece prototipul este încă adaptat la comportamentul real al componentelor și la geometria matriței.",
    "Mechanical priorities": "Priorități mecanice",
    "Keep the nozzle, mold entry, and moving plates aligned across repeated cycles.": "Menținerea alinierii duzei, intrării în matriță și plăcilor mobile pe parcursul ciclurilor repetate.",
    "Carry injection and clamping forces through structure rather than fragile tooling.": "Preluarea forțelor de injecție și închidere prin structură, nu prin matrițele fragile.",
    "Make critical supports and service areas accessible during calibration.": "Păstrarea accesului la suporturile critice și la zonele de întreținere în timpul calibrării.",
    "Measure and reduce backlash, frame twist, and platen racking.": "Măsurarea și reducerea jocului mecanic, torsiunii cadrului și înclinării plăcilor.",
    "04 / Thermal system": "04 / Sistemul termic",
    "Temperature is a process variable, not a visual effect.": "Temperatura este o variabilă de proces, nu un efect vizual.",
    "The barrel is heated in multiple zones and measured with K-type thermocouples. Logged tests and thermal-camera passes are used to inspect heat-up, stabilization, cooldown, sensor behavior, heat loss, and local hot spots.": "Cilindrul este încălzit în mai multe zone, iar temperatura este măsurată cu termocupluri tip K. Testele înregistrate și măsurătorile cu camera termică sunt folosite pentru a analiza încălzirea, stabilizarea, răcirea, comportamentul senzorilor, pierderile de căldură și punctele fierbinți locale.",
    "The longest captured campaign contains 6,331 samples across approximately 108.6 minutes. Thermal modeling was compared with SimScale, with reported agreement around ±8% for the compared cases. These results guide insulation, sensor placement, nozzle design, cooling, and safe timing decisions.": "Cea mai lungă sesiune înregistrată conține 6.331 de măsurători pe parcursul a aproximativ 108,6 minute. Modelarea termică a fost comparată cu simulările SimScale, cu o concordanță raportată de aproximativ ±8% pentru cazurile analizate. Rezultatele ghidează izolarea termică, poziționarea senzorilor, proiectarea duzei, răcirea și stabilirea în siguranță a timpilor de proces.",
    "Evidence source: barrel-tuning campaign recorded April 16, 2026 and summarized in the public technical notebook.": "Sursa datelor: sesiunea de reglare a cilindrului, înregistrată la 16 aprilie 2026 și rezumată în caietul tehnic public.",
    "05 / Electronics and controls": "05 / Electronică și control",
    "Prototype flexibility with explicit machine ownership.": "Un prototip flexibil, cu responsabilități de control clar definite.",
    "The integrated control stack is centered on a NUCLEO-H753ZI. It interfaces with thermocouple modules, heater switching, stepper drivers, the injection servo path, safety inputs, and the communication bridge.": "Sistemul de control integrat este construit în jurul plăcii NUCLEO-H753ZI. Aceasta gestionează modulele de termocupluri, comanda elementelor de încălzire, driverele motoarelor pas cu pas, servomotorul de injecție, intrările de siguranță și puntea de comunicație.",
    "A dedicated Origin motherboard has been designed in KiCad to organize the current prototype wiring into a cleaner integration layer. It remains a prototype electronics project and is not presented as a certified production controller.": "O placă de bază Origin dedicată a fost proiectată în KiCad pentru a organiza mai clar cablajul prototipului actual. Aceasta rămâne o placă electronică de prototip și nu este prezentată drept controler de producție certificat.",
    "06 / Firmware and operator stack": "06 / Firmware și interfața operatorului",
    "Control remains close to the machine.": "Controlul critic este realizat local, direct pe mașină.",
    "The Nucleo owns safety admission, heating, movement, and cycle sequencing.": "Nucleo gestionează verificările de siguranță, încălzirea, mișcarea și succesiunea etapelor ciclului.",
    "The ESP32-C6 acts as a narrow same-network HTTP-to-command bridge.": "ESP32-C6 funcționează ca o punte simplă între cererile HTTP din rețeaua locală și protocolul de comandă al mașinii.",
    "The Android operator app presents status, supported actions, and service access.": "Aplicația Android pentru operator afișează starea, acțiunile disponibile și funcțiile de întreținere.",
    "A desktop serial monitor and diagnostic sketches support commissioning and fault analysis.": "Un monitor serial pentru desktop și programele de diagnosticare sprijină punerea în funcțiune și analiza defectelor.",
    "The public operator APK is a prototype artifact for supervised demonstrations. It is not a general-purpose machine controller and should not be treated as a production release.": "APK-ul public pentru operator este o versiune prototip destinată demonstrațiilor supravegheate. Nu este un controler general al mașinii și nu trebuie considerat o versiune pentru producție.",
    "07 / Safety position": "07 / Siguranța prototipului",
    "Current use is supervised and prototype-only.": "Utilizarea actuală este supravegheată și limitată la prototip.",
    "The project combines mains-powered heating, hot surfaces, and powered motion. The current machine is operated as a supervised prototype. Emergency-stop behavior, safe startup defaults, fault handling, grounding, power isolation, and guarded access remain critical requirements.": "Proiectul combină încălzirea alimentată de la rețea, suprafețe fierbinți și mecanisme acționate electric. Mașina actuală este utilizată ca prototip supravegheat. Oprirea de urgență, pornirea în condiții de siguranță, gestionarea defectelor, împământarea, izolarea alimentării și accesul protejat rămân cerințe esențiale.",
    "A future product version requires a cleaner enclosure, stronger hardware isolation, validated safety behavior, and a formal review appropriate to its intended users and environment.": "O viitoare versiune de produs necesită o carcasă mai bine proiectată, separare și protecție electrică îmbunătățite, funcții de siguranță validate și o evaluare formală adecvată utilizatorilor și mediului vizat.",
    "08 / Validation evidence": "08 / Rezultatele validării",
    "The project has crossed from simulation into physical evidence.": "Proiectul a depășit etapa simulărilor și are rezultate fizice măsurabile.",
    "A first successful injected part has been produced.": "A fost produsă prima piesă injectată cu succes.",
    "Thermal behavior has been measured with logged sensors and a thermal camera.": "Comportamentul termic a fost măsurat folosind date înregistrate de senzori și o cameră termică.",
    "Major mechanical, electrical, firmware, and operator subsystems have been integrated.": "Principalele subsisteme mecanice, electrice, de firmware și de operare au fost integrate.",
    "A dedicated PCB and a complete operator/control stack have been developed.": "Au fost dezvoltate un PCB dedicat și un sistem complet de operare și control.",
    "The first part is evidence of system function, not proof of production readiness. Its defects are useful because they identify the next work in venting, fill behavior, tooling, and process calibration.": "Prima piesă demonstrează funcționarea sistemului, nu pregătirea pentru producție. Defectele sale sunt utile, deoarece indică următoarele direcții de lucru: aerisirea, comportamentul la umplere, matrițele și calibrarea procesului.",
    "Validation record: public technical notebook, centralized June 11, 2026, with original measurements and active software/firmware sources retained.": "Documentația de validare: caiet tehnic public, consolidat la 11 iunie 2026, care păstrează măsurătorile originale și sursele software și firmware aflate în dezvoltare.",
    "09 / Current limits": "09 / Limite actuale",
    "What remains unproven.": "Ce nu a fost încă demonstrat.",
    "Stable multi-part repeatability across longer runs.": "Producerea repetabilă a mai multor piese în sesiuni mai lungi.",
    "Long-run life and failure behavior of resin tooling.": "Durata de viață și modul de cedare al matrițelor din rășină în utilizare îndelungată.",
    "Fully tuned filling, holding, venting, and ejection behavior.": "Reglarea completă a umplerii, menținerii presiunii, aerisirii și ejectării.",
    "Final enclosure safety and production-grade electrical integration.": "Siguranța carcasei finale și integrarea electrică la nivel de producție.",
    "Validated process windows across multiple material families.": "Parametri de proces validați pentru mai multe familii de materiale.",
    "10 / Product direction": "10 / Direcția produsului",
    "Turn the experiment into a dependable platform.": "Transformă experimentul într-o platformă fiabilă.",
    "The next Origin direction focuses on repeatability, stronger process sensing, better thermal insulation, refined mold interfaces, safer enclosure design, cleaner electronics, and a simpler operator workflow.": "Următoarea versiune Origin se concentrează pe repetabilitate, monitorizarea mai precisă a procesului, izolație termică îmbunătățită, interfețe mai bune pentru matrițe, o carcasă mai sigură, electronică mai ordonată și un flux de operare mai simplu.",
    "The long-term ambition is a useful workshop and education platform that can produce functional small parts, teach the complete molding process, and help hardware teams make better tooling decisions earlier.": "Obiectivul pe termen lung este crearea unei platforme utile pentru ateliere și educație, capabilă să producă piese mici funcționale, să explice întregul proces de injecție și să ajute echipele hardware să ia mai devreme decizii mai bune privind matrițele.",
    "11 / Team": "11 / Echipa",
    "Engineering lead: mechanics, manufacturing, electronics, integration, and product development.": "Coordonator inginerie: mecanică, producție, electronică, integrare și dezvoltare de produs.",
    "Team and business lead: strategy, economics, sponsorships, organization, and presentation.": "Coordonator echipă și business: strategie, economie, sponsorizări, organizare și prezentare.",
    "Simulation and analysis lead: SimScale, Python models, mathematics, and data analysis.": "Coordonator simulare și analiză: SimScale, modele Python, matematică și analiză de date.",
    "Embedded programming: Arduino, C++, C, backend development, automations, and system integration.": "Programare embedded: Arduino, C++, C, dezvoltare backend, automatizări și integrarea sistemelor.",
    "Public technical dossier / integrated prototype in active calibration.": "Dosar tehnic public / prototip integrat, în curs de calibrare.",

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
    "Early InFlux MK1 wireframe plan": "Schiță structurală inițială pentru InFlux MK1",
    "InFlux Origin MK1 integrated machine render": "Randare a mașinii integrate InFlux Origin MK1",
    "InFlux packaging and product development concept": "Concept de ambalaj și dezvoltare de produs InFlux",
    "Preview of the InFlux Origin MK1 assembly": "Previzualizare a ansamblului InFlux Origin MK1",
    "Other project stages": "Alte etape ale proiectului",
    "InFlux Operator application screens": "Ecranele aplicației InFlux Operator",
    "InFlux Operator dashboard screen": "Ecranul principal InFlux Operator",
    "InFlux Operator production and temperature controls": "Comenzi de producție și temperatură în InFlux Operator",
    "InFlux Operator machine movement controls": "Comenzi de mișcare ale mașinii în InFlux Operator",
    "Annotated view of the Origin motherboard design": "Vedere adnotată a proiectului plăcii de bază Origin",
    "Landscape view of the InFlux Origin motherboard PCB layout": "Vedere de ansamblu a proiectului PCB al plăcii de bază InFlux Origin",
    "Annotated thermal testing results": "Rezultate adnotate ale testelor termice",
    "Thermal camera image captured during InFlux testing": "Imagine termică surprinsă în timpul testelor InFlux",
    "Thermal testing equipment used on the InFlux machine": "Echipament de testare termică folosit la testarea mașinii InFlux",
    "Stefan Tonegari at a Volta Circuits event": "Stefan Tonegari la un eveniment Volta Circuits",
    "Pintilei David at a Volta Circuits event": "Pintilei David la un eveniment Volta Circuits",
    "Fabian Volintiru portrait not yet published": "Portretul lui Fabian Volintiru nu este încă publicat",
    "Ciprian Ursu portrait not yet published": "Portretul lui Ciprian Ursu nu este încă publicat",
    "Apply to join InFlux using Google Forms (opens in a new tab)": "Aplică pentru a te alătura echipei InFlux prin Google Forms (se deschide într-o filă nouă)",
    "Current InFlux sponsors": "Sponsorii actuali ai InFlux",
    "Volta Circuits team uniform render showing sponsor placement areas": "Randare a uniformei echipei Volta Circuits cu zonele pentru sponsori",
    "First successfully injected InFlux part": "Prima piesă InFlux injectată cu succes",
    "InFlux thermal testing in the laboratory": "Testarea termică InFlux în laborator",
    "Landscape view of the InFlux dedicated motherboard design": "Vedere de ansamblu a plăcii de bază dedicate InFlux",
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
  let languageTransitionActive = false;
  let meltCanvas;
  let meltContext;
  let meltDpr = 1;

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

  function ensureMeltCanvas() {
    if (meltCanvas) return meltCanvas;
    meltCanvas = document.createElement("canvas");
    meltCanvas.className = "language-melt-canvas";
    meltCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(meltCanvas);
    meltContext = meltCanvas.getContext("2d");
    return meltCanvas;
  }

  function resizeMeltCanvas() {
    ensureMeltCanvas();
    meltDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    meltCanvas.width = Math.round(window.innerWidth * meltDpr);
    meltCanvas.height = Math.round(window.innerHeight * meltDpr);
    meltCanvas.style.width = `${window.innerWidth}px`;
    meltCanvas.style.height = `${window.innerHeight}px`;
    meltContext.setTransform(meltDpr, 0, 0, meltDpr, 0, 0);
  }

  function parseMeltColor(value) {
    const parts = String(value || "").match(/[\d.]+/g) || [244, 241, 237, 1];
    return {
      r: Number(parts[0]),
      g: Number(parts[1]),
      b: Number(parts[2]),
      a: parts[3] === undefined ? 1 : Number(parts[3])
    };
  }

  function measureSpacedText(context, text, letterSpacing) {
    return context.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing;
  }

  function fillSpacedText(context, text, x, y, letterSpacing) {
    if (!letterSpacing) {
      context.fillText(text, x, y);
      return;
    }
    for (const character of text) {
      context.fillText(character, x, y);
      x += context.measureText(character).width + letterSpacing;
    }
  }

  function wrapMeltLines(context, text, maxWidth, letterSpacing) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const trial = line ? `${line} ${word}` : word;
      if (line && measureSpacedText(context, trial, letterSpacing) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = trial;
      }
    });
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  function sampleMeltText(element) {
    const text = [...element.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.nodeValue)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return [];

    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const renderDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const buffer = document.createElement("canvas");
    const context = buffer.getContext("2d", { willReadFrequently: true });
    buffer.width = Math.max(1, Math.ceil(rect.width * renderDpr));
    buffer.height = Math.max(1, Math.ceil(rect.height * renderDpr));

    const fontSize = Number.parseFloat(style.fontSize) || 16;
    const lineHeight = style.lineHeight === "normal"
      ? fontSize * 1.12
      : Number.parseFloat(style.lineHeight) || fontSize * 1.12;
    const letterSpacing = Number.parseFloat(style.letterSpacing) || 0;
    context.scale(renderDpr, renderDpr);
    context.font = `${style.fontStyle || "normal"} ${style.fontWeight || 400} ${fontSize}px ${style.fontFamily || "sans-serif"}`;
    context.textBaseline = "alphabetic";
    context.fillStyle = "#fff";

    const lines = wrapMeltLines(context, text, rect.width, letterSpacing);
    const totalHeight = lines.length * lineHeight;
    let y = Math.max(fontSize, (rect.height - totalHeight) / 2 + fontSize);
    lines.forEach((line) => {
      const width = measureSpacedText(context, line, letterSpacing);
      let x = 0;
      if (style.textAlign === "center") x = (rect.width - width) / 2;
      if (style.textAlign === "right" || style.textAlign === "end") x = rect.width - width;
      fillSpacedText(context, line, x, y, letterSpacing);
      y += lineHeight;
    });

    const image = context.getImageData(0, 0, buffer.width, buffer.height);
    const gap = Math.max(6, Math.round(Math.min(18, Math.max(7, fontSize / 5)) * renderDpr));
    const points = [];
    for (let py = 0; py < image.height; py += gap) {
      for (let px = 0; px < image.width; px += gap) {
        if (image.data[(py * image.width + px) * 4 + 3] > 80) {
          points.push({
            x: rect.left + px / renderDpr,
            y: rect.top + py / renderDpr
          });
        }
      }
    }
    return points;
  }

  function captureMeltParticles(elements) {
    const particles = [];
    elements.forEach((element) => {
      const points = sampleMeltText(element);
      if (!points.length) return;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const fontSize = Number.parseFloat(style.fontSize) || 16;
      const budget = fontSize > 64 ? 160 : fontSize > 28 ? 100 : 36;
      const stride = Math.max(1, Math.ceil(points.length / budget));
      const color = parseMeltColor(style.color);
      for (let index = 0; index < points.length; index += stride) {
        const point = points[index];
        const yNorm = Math.max(0, Math.min(1, (point.y - rect.top) / Math.max(1, rect.height)));
        particles.push({
          x: point.x,
          y: point.y,
          radius: Math.min(10, Math.max(4.5, fontSize * .065)) * (.78 + Math.random() * .44),
          drift: (Math.random() - .5) * 32,
          delay: (1 - yNorm) * .06 + Math.random() * .025,
          seed: Math.random() * Math.PI * 2,
          color,
          alpha: (.82 + Math.random() * .18) * color.a
        });
      }
    });
    return particles;
  }

  function drawMeltFrame(particles, progress) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    meltContext.setTransform(meltDpr, 0, 0, meltDpr, 0, 0);
    meltContext.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      const local = Math.max(0, Math.min(1, (progress - particle.delay) / Math.max(.001, 1 - particle.delay)));
      const fall = local ** 4;
      const x = particle.x + particle.drift * fall + Math.sin(particle.seed + fall * 8) * 1.2;
      const y = particle.y + height * 1.28 * fall;
      const stretch = 1 + fall * 4.5;
      const rx = particle.radius / Math.sqrt(stretch);
      const ry = particle.radius * stretch;
      const fade = local > .9 ? 1 - (local - .9) / .1 : 1;
      meltContext.beginPath();
      meltContext.fillStyle = `rgba(${particle.color.r},${particle.color.g},${particle.color.b},${particle.alpha * Math.max(0, fade)})`;
      meltContext.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      meltContext.fill();
    });
  }

  function collectMeltElements() {
    const candidates = [...document.body.querySelectorAll("*")].filter((element) => {
      if (element.closest("[data-no-i18n], script, style, svg, canvas, code, pre")) return false;
      if (element.classList.contains("visually-hidden")) return false;
      if (![...element.childNodes].some((node) =>
        node.nodeType === Node.TEXT_NODE && normalize(node.nodeValue)
      )) return false;

      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 2 &&
        rect.height > 2 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        Number.parseFloat(style.opacity || "1") > 0;
    });

    return candidates.filter((element) =>
      !candidates.some((parent) => parent !== element && parent.contains(element))
    );
  }

  function triggerLanguagePop(elements) {
    const visible = elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    if (!visible.length) return;

    const minimumX = Math.min(...visible.map((element) => element.getBoundingClientRect().left));
    const maximumX = Math.max(...visible.map((element) => element.getBoundingClientRect().right));
    const span = Math.max(1, maximumX - minimumX);

    visible.forEach((element) => {
      const factor = (element.getBoundingClientRect().left - minimumX) / span;
      element.style.setProperty("--language-pop-delay", `${Math.round(factor * 230)}ms`);
      element.classList.add("language-pop-text");
    });
    document.documentElement.classList.add("is-language-popping");

    window.setTimeout(() => {
      document.documentElement.classList.remove("is-language-popping");
      visible.forEach((element) => {
        element.classList.remove("language-pop-text");
        element.style.removeProperty("--language-pop-delay");
      });
    }, 920);
  }

  function previewLanguageToggle(language) {
    document.querySelectorAll(".language-toggle").forEach((toggle) => {
      const buttons = [...toggle.querySelectorAll("[data-language]")];
      const index = Math.max(0, buttons.findIndex((button) => button.dataset.language === language));
      const width = buttons[0]?.getBoundingClientRect().width || 0;
      toggle.style.setProperty("--slider-x", `${index * width}px`);
    });
  }

  async function requestLanguage(language) {
    if (!SUPPORTED_LANGUAGES.has(language) || language === currentLanguage || languageTransitionActive) return;
    previewLanguageToggle(language);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyLanguage(language);
      return;
    }

    const elements = collectMeltElements();
    resizeMeltCanvas();
    const particles = captureMeltParticles(elements);
    if (!elements.length || !particles.length) {
      applyLanguage(language);
      return;
    }

    languageTransitionActive = true;
    document.documentElement.classList.add("is-language-transitioning", "is-language-melting");
    elements.forEach((element) => element.classList.add("language-melt-source"));
    meltCanvas.classList.add("is-active");
    document.querySelectorAll(".language-toggle").forEach((toggle) => toggle.setAttribute("aria-disabled", "true"));

    try {
      const start = performance.now();
      await new Promise((resolve) => {
        const frame = (now) => {
          const elapsed = now - start;
          const progress = Math.max(0, Math.min(1, (elapsed - 100) / 980));
          drawMeltFrame(particles, progress);
          if (elapsed < 1080) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
      applyLanguage(language);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      elements.forEach((element) => element.classList.remove("language-melt-source"));
      meltContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltCanvas.classList.remove("is-active");
      triggerLanguagePop(elements);
    } finally {
      elements.forEach((element) => element.classList.remove("language-melt-source"));
      meltContext?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltCanvas?.classList.remove("is-active");
      document.documentElement.classList.remove("is-language-melting", "is-language-transitioning");
      document.querySelectorAll(".language-toggle").forEach((toggle) => toggle.removeAttribute("aria-disabled"));
      languageTransitionActive = false;
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
    document.querySelectorAll(".language-toggle").forEach((toggle) => {
      const buttons = [...toggle.querySelectorAll("[data-language]")];
      const activeIndex = Math.max(0, buttons.findIndex((button) => button.dataset.language === language));
      const cellWidth = buttons[0]?.getBoundingClientRect().width || 0;

      toggle.style.setProperty("--slider-x", `${activeIndex * cellWidth}px`);
      buttons.forEach((button, index) => {
        const active = index === activeIndex;
        button.setAttribute("aria-pressed", String(active));
        button.tabIndex = active ? 0 : -1;
      });
    });
  }

  function bindLanguageSlider(toggle) {
    const buttons = [...toggle.querySelectorAll("[data-language]")];
    let pointerId = null;
    let startX = 0;
    let position = 0;
    let dragging = false;
    let suppressClick = false;
    let bounds;
    let cellWidth = 0;
    let trackStart = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const activeIndex = () => Math.max(0, buttons.findIndex((button) =>
      button.dataset.language === currentLanguage
    ));
    const moveSlider = (nextPosition) => {
      toggle.style.setProperty("--slider-x", `${nextPosition}px`);
    };
    const clearDragTarget = () => {
      buttons.forEach((button) => button.classList.remove("is-drag-target"));
    };
    const measure = () => {
      bounds = toggle.getBoundingClientRect();
      cellWidth = buttons[0]?.getBoundingClientRect().width || 0;
      trackStart = buttons[0]?.offsetLeft || 0;
    };

    toggle.addEventListener("click", (event) => {
      const button = event.target.closest("[data-language]");
      if (!button) return;
      if (suppressClick) {
        event.preventDefault();
        return;
      }
      requestLanguage(button.dataset.language);
    });

    toggle.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      measure();
      pointerId = event.pointerId;
      startX = event.clientX;
      position = activeIndex() * cellWidth;
      dragging = false;
      suppressClick = false;
    });

    toggle.addEventListener("pointermove", (event) => {
      if (event.pointerId !== pointerId) return;
      const movement = event.clientX - startX;
      if (!dragging && Math.abs(movement) < 5) return;

      if (!dragging) {
        dragging = true;
        toggle.classList.add("is-dragging");
        toggle.setPointerCapture?.(event.pointerId);
      }

      event.preventDefault();
      position = clamp(
        event.clientX - bounds.left - trackStart - (cellWidth / 2),
        0,
        (buttons.length - 1) * cellWidth
      );
      moveSlider(position);

      const targetIndex = Math.round(position / cellWidth);
      buttons.forEach((button, index) => {
        button.classList.toggle("is-drag-target", index === targetIndex);
      });
    });

    const finishPointer = (event, commit) => {
      if (event.pointerId !== pointerId) return;

      if (dragging) {
        const nextIndex = commit ? Math.round(position / cellWidth) : activeIndex();
        suppressClick = true;
        toggle.classList.remove("is-dragging");
        clearDragTarget();
        requestLanguage(buttons[nextIndex].dataset.language);
        setTimeout(() => { suppressClick = false; }, 0);
      }

      if (toggle.hasPointerCapture?.(event.pointerId)) {
        toggle.releasePointerCapture(event.pointerId);
      }
      pointerId = null;
      dragging = false;
    };

    toggle.addEventListener("pointerup", (event) => finishPointer(event, true));
    toggle.addEventListener("pointercancel", (event) => finishPointer(event, false));
    window.addEventListener("resize", () => updateToggle(currentLanguage), { passive: true });
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
      <span class="language-toggle__slider" aria-hidden="true"></span>
      <button type="button" data-language="en" aria-label="English / Engleză" aria-pressed="false" draggable="false">
        <span class="language-toggle__ring" aria-hidden="true">
          <span class="language-toggle__flag">
            <svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">
              <rect width="100" height="100" fill="#012169"/>
              <path d="M0 0 100 100M100 0 0 100" stroke="#fff" stroke-width="23"/>
              <path d="M0 0 100 100M100 0 0 100" stroke="#C8102E" stroke-width="10"/>
              <path d="M50 0V100M0 50H100" stroke="#fff" stroke-width="34"/>
              <path d="M50 0V100M0 50H100" stroke="#C8102E" stroke-width="19"/>
            </svg>
          </span>
        </span>
      </button>
      <button type="button" data-language="ro" aria-label="Romanian / Română" aria-pressed="false" draggable="false">
        <span class="language-toggle__ring" aria-hidden="true">
          <span class="language-toggle__flag">
            <svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">
              <rect width="34" height="100" fill="#002B7F"/>
              <rect x="33" width="34" height="100" fill="#FCD116"/>
              <rect x="66" width="34" height="100" fill="#CE1126"/>
            </svg>
          </span>
        </span>
      </button>
      <span class="visually-hidden" aria-live="polite" data-language-status></span>`;
    identity.appendChild(toggle);

    bindLanguageSlider(toggle);

    toggle.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const language = event.key === "ArrowRight" ? "ro" : "en";
      requestLanguage(language);
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
