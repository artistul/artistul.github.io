(() => {
  "use strict";

  const STORAGE_KEY = "influx-language";

  const RO = Object.freeze({
    "Desktop Injection Molding Machine | InFlux Origin": "Mașină desktop pentru injecția maselor plastice | InFlux Origin",
    "Machine Versions | InFlux Origin": "Versiunile mașinii | InFlux Origin",
    "Achievements | InFlux Origin": "Premii | InFlux Origin",
    "Team | InFlux Origin": "Echipă | InFlux Origin",
    "Sponsors | InFlux Origin": "Sponsori | InFlux Origin",
    "Contact Us | InFlux Origin": "Contactează-ne | InFlux Origin",
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
    "Achievements": "Premii",
    "Team": "Echipă",
    "Proof": "Dovezi",
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
    "See the evidence": "Vezi dovezile",
    "Explore the machine": "Explorează mașina",
    "Why InFlux?": "De ce InFlux?",
    "The middle ground should not be empty.": "Spațiul dintre prototip și industrie nu ar trebui să fie gol.",
    "You can print a model in hours or dump tens of thousands of euros into industrial manufacturing. Why not something in between? Faster than 3D printing. Semi-industrial quantities.": "Poți imprima un model în câteva ore sau poți investi zeci de mii de euro în producție industrială. De ce să nu existe ceva între ele? Mai rapid decât imprimarea 3D. Cantități semi-industriale.",
    "Influx is the answer.": "InFlux este răspunsul.",
    "Evidence route": "Traseul dovezilor",
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
    "Validation evidence": "Dovezi de validare",
    "Operator interface": "Interfața operatorului",
    "Everything the operator needs, in one place.": "Tot ce îi trebuie operatorului, într-un singur loc.",
    "A dedicated interface with internet connectivity. It includes complete machine monitoring, control and servicing functions.": "O interfață dedicată, cu acces la rețea. Include monitorizarea și controlul complet al mașinii, precum și funcții de diagnosticare și întreținere.",
    "This is where the machine starts thinking.": "Aici începe mașina să gândească.",
    "A custom PCB that serves as the central hub for every part of the machine. Offers the possibility for easy expansion and component replacement.": "O placă PCB personalizată care conectează și coordonează toate componentele mașinii. Permite extinderea și înlocuirea ușoară a acestora.",
    "Thermal testing": "Testare termică",
    "We measure instead of guessing.": "Măsurăm în loc să presupunem.",
    "We measured heating and cooling time, temperature stability, sensor precision and heat spread to improve the next version of the machine.": "Am măsurat timpul de încălzire și răcire, stabilitatea temperaturii, precizia senzorilor și distribuția căldurii pentru a îmbunătăți următoarea versiune.",

    "Volta Circuits record": "Premiile Volta Circuits",
    "Built to": "Construiți să",
    "go further.": "mergem mai departe.",
    "achievements": "realizări",
    "One continuous record of competition, recognition, and engineering progress.": "O evidență continuă a competițiilor, premiilor și progresului în inginerie.",
    "National": "Național",
    "International": "Internațional",
    "Complete record": "Lista completă de premii",
    "Complete timeline": "Cronologie completă",
    "Every step": "Fiecare etapă",
    "in one line.": "pe aceeași linie.",
    "achievements · 3 years": "realizări · 3 ani",
    "Organizer roles": "Roluri de organizator",
    "National competition": "Competiție națională",
    "International competition": "Competiție internațională",
    "Organizer role": "Rol de organizator",
    "Five most important achievements": "Cele mai importante cinci realizări",
    "Rank 1, DaVinci 2026": "Poziția 1, DaVinci 2026",
    "Rank 2, RoSEF 2026": "Poziția 2, RoSEF 2026",
    "Rank 3, ONCS": "Poziția 3, ONCS",
    "Rank 4, FRI 2026": "Poziția 4, FRI 2026",
    "Rank 5, MILSET Abu Dhabi": "Poziția 5, MILSET Abu Dhabi",
    "Jump to achievement year": "Sari la anul realizărilor",
    "Achievement overview": "Rezumatul realizărilor",
    "Achievements from 2026": "Realizări din 2026",
    "Achievements from 2025": "Realizări din 2025",
    "Achievements from 2024": "Realizări din 2024",
    "Results and competition stages": "Rezultate și etape ale competiției",
    "Final stage": "Etapa finală",
    "First place": "Locul I",
    "National stage": "Etapa națională",
    "Second place": "Locul II",
    "County stage": "Etapa județeană",
    "Participation": "Participare",
    "Playoffs": "Playoff-uri",
    "Alliance Captain": "Căpitan de alianță",
    "Ranking": "Clasament",
    "6th place": "Locul 6",
    "Technical Creativity · 11th grade": "Creativitate Tehnică · clasele XI",
    "Drag Racing": "Cursă de accelerație",
    "Delegation award": "Premiul delegației",
    "Best Delegation": "Cea mai bună delegație",
    "Alliance competition": "Competiție pe alianțe",
    "Finalist alliance": "Alianță finalistă",
    "Storyteller Award": "Premiul Storyteller",
    "FTC Meet": "Întâlnire FTC",
    "Organizers": "Organizatori",
    "Qualified": "Calificați",
    "Final ranking": "Clasament final",
    "Third place": "Locul III",
    "Teenager Maker Camp and Teacher Workshop": "Tabără pentru tineri creatori și atelier pentru profesori",
    "Award winners": "Premianți",
    "Achievement page sections": "Secțiunile paginii de premii",
    "Upcoming": "Urmează",
    "Upcoming events": "Evenimente viitoare",
    "upcoming events": "evenimente viitoare",
    "2026–2027 season": "Sezonul 2026–2027",
    "Next": "Următoarele",
    "events.": "evenimente.",
    "We almost always accept invitations.": "Acceptăm aproape întotdeauna invitațiile.",
    "Invite us": "Invită-ne",
    "Upcoming event schedule": "Calendarul evenimentelor viitoare",
    "Scheduled": "Programat",
    "Season": "Sezon",
    "Dates TBA": "Date în curs de stabilire",
    "25–28 August 2026": "25–28 august 2026",
    "1–6 September 2026": "1–6 septembrie 2026",
    "18–24 September 2026": "18–24 septembrie 2026",
    "September 2026 — February 2027": "septembrie 2026 — februarie 2027",
    "November 2026": "noiembrie 2026",
    "2026 · Dates TBA": "2026 · Date în curs de stabilire",
    "March–April 2027 · Dates TBA": "martie–aprilie 2027 · Date în curs de stabilire",
    "March–May 2027 · Dates TBA": "martie–mai 2027 · Date în curs de stabilire",
    "Press": "Presă",
    "Press appearances": "Apariții în presă",
    "Our work,": "Munca noastră,",
    "documented.": "documentată.",
    "appearances": "apariții",
    "Independent and institutional coverage from 2024.": "Apariții în presa independentă și instituțională din 2024.",
    "Drag or use the arrows": "Glisează sau folosește săgețile",
    "Previous article": "Articolul anterior",
    "Next article": "Articolul următor",
    "All press appearances": "Toate aparițiile în presă",
    "Open article": "Deschide articolul",
    "Co-organizer": "Coorganizator",
    "Named organizer": "Menționați ca organizatori",
    "National qualification": "Calificare națională",
    "Public outreach": "Prezentare publică",
    "Educational partner": "Partener educațional",
    "Summer school organizer": "Organizator al școlii de vară",
    "National recognition": "Recunoaștere națională",
    "Featured team": "Echipă prezentată",
    "Participant": "Participant",
    "Robotics competition in Suceava": "Competiție de robotică în Suceava",
    "Press review clipping naming Volta Circuits": "Extras din revista presei care menționează Volta Circuits",
    "Volta Circuits at a robotics event": "Volta Circuits la un eveniment de robotică",
    "EduFortress Childhood Festival": "Festivalul EduFortress Childhood",
    "Volta Circuits summer robotics school": "Școala de vară de robotică Volta Circuits",
    "Volta Circuits team": "Echipa Volta Circuits",
    "Decode the Bolts robotics event": "Evenimentul de robotică Decode the Bolts",
    "League Meet in Botoșani": "League Meet în Botoșani",

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
    "Embedded programming": "Programare embedded",
    "Arduino, C++, C, backend development, automations, and system integration.": "Arduino, C++, C, dezvoltare backend, automatizări și integrarea sistemelor.",
    "Make it think.": "Fă mașina să gândească.",
    "Engineering Rookie": "Ingineră junior",
    "Newest member of the team, still in training.": "Cea mai nouă membră a echipei, încă în pregătire.",
    "Continue the legacy.": "Continuă moștenirea.",
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
    "We are looking for driven people ready to turn ambitious engineering into working hardware, software, and proof.": "Căutăm oameni motivați, gata să transforme idei ambițioase de inginerie în hardware și software funcțional, susținute de dovezi concrete.",
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
    "See our press coverage": "Vezi aparițiile noastre în presă",
    "Build the next machine": "Construiește următoarea mașină",
    "with us.": "alături de noi.",
    "Four partnership levels. Clear visibility at every stage.": "Patru niveluri de parteneriat. Vizibilitate clară la fiecare etapă.",
    "Become a sponsor": "Devino sponsor",
    "Competition results, builds and team updates.": "Rezultate la concursuri, prototipuri și noutăți din echipă.",
    "Workshop clips, testing and competition moments.": "Secvențe din atelier, testări și momente de la concursuri.",
    "Team channels": "Canalele echipei",
    "FTC website": "Site FTC",
    "Official FTC team website, roster and mission.": "Site-ul oficial al echipei FTC, componența și misiunea sa.",
    "Crowdfunding": "Finanțare participativă",
    "Support InFlux": "Susține InFlux",
    "Want to support us as an individual? Explore our crowdfunding campaign.": "Vrei să ne susții ca persoană fizică? Descoperă campania noastră de finanțare participativă.",
    "Why sponsor us?": "De ce să ne sponsorizezi?",
    "Your brand, in front of the": "Brandul tău, în fața",
    "next generation of engineers.": "următoarei generații de ingineri.",
    "InFlux is more than a competition project. Between September and May, we plan to take it into Romania's technical student community.": "InFlux este mai mult decât un proiect de concurs. Din septembrie până în mai, intenționăm să îl prezentăm comunității de elevi pasionați de tehnologie din România.",
    "Our 2026–27 season": "Sezonul nostru 2026–27",
    "Competitions & events": "Competiții și evenimente",
    "Season target, with additional appearances when opportunities arise.": "Obiectivul sezonului, cu apariții suplimentare când apar oportunități.",
    "People per event": "Persoane per eveniment",
    "Typical total audience: participants, judges, mentors, organizers and visitors.": "Public total tipic: participanți, jurați, mentori, organizatori și vizitatori.",
    "Core audience": "Public principal",
    "Students interested in engineering, programming, electronics, manufacturing and product development.": "Elevi interesați de inginerie, programare, electronică, producție și dezvoltarea produselor.",
    "Social followers": "Urmăritori pe rețelele sociale",
    "Combined Instagram and TikTok community.": "Comunitatea noastră cumulată de pe Instagram și TikTok.",
    "Across Romania": "În România",
    "We bring robotics to people.": "Aducem robotica mai aproape de oameni.",
    "We demonstrate InFlux at schools, businesses, competitions and public events across Romania. We accept most invitations when schedules and logistics allow.": "Prezentăm InFlux în școli, companii, concursuri și evenimente publice din România. Acceptăm majoritatea invitațiilor atunci când programul și logistica ne permit.",
    "What support builds": "Ce construiește sprijinul",
    "Tools on the bench.": "Unelte pe bancul de lucru.",
    "Components in the machine.": "Componente în mașină.",
    "Support becomes equipment, materials and experiments we can afford to run.": "Sprijinul se transformă în echipamente, materiale și experimente pe care ni le putem permite.",
    "Identity & workspace": "Identitate și spațiu de lucru",
    "Our team rebrand, stronger public identity and the foundation of our laboratory.": "Rebranduirea echipei, o identitate publică mai puternică și baza laboratorului nostru.",
    "Tools & components": "Unelte și componente",
    "Equipment, materials, electronics and mechanical parts for manufacturing, assembly and testing.": "Echipamente, materiale, componente electronice și mecanice pentru fabricație, asamblare și testare.",
    "Experiments & prototypes": "Experimente și prototipuri",
    "Iterations we can build, test and learn from—including the ones that fail.": "Iterații pe care le putem construi, testa și din care putem învăța — inclusiv cele care eșuează.",
    "The next machine": "Următoarea mașină",
    "Continued development of the next InFlux Origin generation.": "Continuarea dezvoltării următoarei generații InFlux Origin.",
    "You are not simply placing a logo.": "Nu doar îți amplasezi logo‑ul.",
    "You are funding our projects.": "Ne finanțezi proiectele.",
    "Partnership hierarchy": "Ierarhia parteneriatelor",
    "Choose how your brand shows up.": "Alege cum va fi prezent brandul tău.",
    "Every higher level includes all benefits from the levels before it.": "Fiecare nivel superior include toate beneficiile nivelurilor anterioare.",
    "Discuss a partnership": "Discută un parteneriat",
    "Sponsorship levels and benefits": "Niveluri și beneficii de sponsorizare",
    "Supporter": "Susținător",
    "Silver Sponsor": "Sponsor Argint",
    "Gold Sponsor": "Sponsor Aur",
    "Diamond Sponsor": "Sponsor Diamant",
    "1 benefit": "1 beneficiu",
    "3 benefits total": "3 beneficii în total",
    "7 benefits total": "7 beneficii în total",
    "11 benefits total": "11 beneficii în total",
    "Includes Supporter": "Include nivelul Susținător",
    "Includes Silver": "Include nivelul Argint",
    "Includes Gold": "Include nivelul Aur",
    "End-of-season post on Instagram and Facebook": "Postare la finalul sezonului pe Instagram și Facebook",
    "Logo on the sponsors roll-up banner": "Logo pe roll-up-ul sponsorilor",
    "Special sticker with the sponsor logo": "Sticker special cu logo-ul sponsorului",
    "Logo on competition T-shirts*": "Logo pe tricourile de concurs*",
    "Mention in the description of every social post": "Menționare în descrierea fiecărei postări",
    "Promotion on event video displays": "Promovare pe ecranele video de la evenimente",
    "Logo on the machine walls or panels": "Logo pe pereții sau panourile mașinii",
    "Mention in all press articles": "Menționare în toate articolele de presă",
    "Special promotional video": "Videoclip promoțional special",
    "Logo on a spider display banner": "Logo pe un banner spider display",
    "Dedicated sponsor post on Instagram and Facebook": "Postare dedicată sponsorului pe Instagram și Facebook",
    "* T-shirt placement depends on production timing. If materials are already ordered, the logo moves to the next relevant batch or equivalent visibility, with temporary placement where appropriate.": "* Amplasarea pe tricouri depinde de calendarul producției. Dacă materialele au fost deja comandate, logo-ul va apărea pe următorul lot relevant sau printr-o formă echivalentă de vizibilitate, cu amplasare temporară acolo unde este potrivit.",
    "Custom visibility": "Vizibilitate personalizată",
    "Need a tailored package?": "Ai nevoie de un pachet personalizat?",
    "Strategic sponsorships can include additional machine, event, presentation, media, or technical visibility, agreed separately in writing.": "Sponsorizările strategice pot include vizibilitate suplimentară pe mașină, la evenimente, în prezentări, în presă sau în materiale tehnice, stabilită separat în scris.",
    "Request custom visibility": "Solicită vizibilitate personalizată",
    "Already building with us.": "Construiesc deja alături de noi.",

    "Proof of the prototype": "Dovezi ale prototipului",
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
    "cycle": "ciclu",
    "cycles": "cicluri",
    "hour": "oră",
    "hours": "ore",
    "1 stack": "1 ansamblu",
    "108.6 min": "108,6 min",
    "{value} milestone": "Prag: {value}",
    "{value} milestone passed": "Prag atins: {value}",
    "{current} of {final} ({percent})": "{current} din {final} ({percent})",
    "{current} reduced from {start} toward {final} ({percent})": "{current}, redus de la {start} spre {final} ({percent})",

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
    "Evidence overview": "Prezentarea dovezilor",
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
    "Simulation and analysis lead: SimScale, Python models, mathematics, and data analysis.": "Coordonator simulare și analiză: SimScale, modele Python, matematică și analiză de date.",
    "Embedded programming: Arduino, C++, C, backend development, automations, and system integration.": "Programare embedded: Arduino, C++, C, dezvoltare backend, automatizări și integrarea sistemelor.",
    "Engineering rookie: newest member of the team, still in training.": "Ingineră junior: cea mai nouă membră a echipei, încă în pregătire.",
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
    "Lavinia Ichim portrait not yet published": "Portretul Laviniei Ichim nu este încă publicat",
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

  // Add the supplied French copy here using the same English keys as RO.
  // French becomes available automatically only when every key is translated.
  const FR = Object.freeze({
    "Desktop Injection Molding Machine | InFlux Origin": "Presse à injecter de bureau | InFlux Origin",
    "Machine Versions | InFlux Origin": "Versions de la machine | InFlux Origin",
    "Achievements | InFlux Origin": "Prix | InFlux Origin",
    "Team | InFlux Origin": "Équipe | InFlux Origin",
    "Sponsors | InFlux Origin": "Sponsors | InFlux Origin",
    "Contact Us | InFlux Origin": "Contactez-nous | InFlux Origin",
    "Proof | InFlux Origin": "Validation | InFlux Origin",
    "Download Hub | InFlux Origin": "Centre de téléchargements | InFlux Origin",
    "External Links | InFlux Origin": "Liens externes | InFlux Origin",
    "Technical Dossier | InFlux Origin MK1": "Dossier technique | InFlux Origin MK1",
    "Menu": "Menu",
    "Close": "Fermer",
    "Home": "Accueil",
    "Machine Development": "Développement de la machine",
    "Machine Versions": "Versions de la machine",
    "InFlux Ecosystem": "Écosystème InFlux",
    "Achievements": "Prix",
    "Team": "Équipe",
    "Proof": "Validation",
    "Contact Us": "Contactez-nous",
    "Sponsors": "Sponsors",
    "Downloads": "Téléchargements",
    "Back to top ↑": "Retour en haut ↑",
    "Open navigation menu": "Ouvrir le menu de navigation",
    "Close navigation menu": "Fermer le menu de navigation",
    "Real": "Production",
    "manufacturing.": "réelle.",
    "Desktop scale.": "Format de bureau.",
    "InFlux Origin bridges the gap between a 3D printed prototype and industrial manufacturing with real thermoplastic shots, resin 3D printed molds, and an easy-to-use operator app!": "InFlux Origin comble le fossé entre un prototype imprimé en 3D et la production industrielle : de véritables thermoplastiques sont injectés dans des moules en résine imprimés en 3D, le tout piloté par une application opérateur simple à utiliser !",
    "See the evidence": "Voir les résultats",
    "Explore the machine": "Découvrir la machine",
    "Why InFlux?": "Pourquoi InFlux ?",
    "The middle ground should not be empty.": "Il ne devrait pas y avoir de vide entre le prototype et l’industrie.",
    "You can print a model in hours or dump tens of thousands of euros into industrial manufacturing. Why not something in between? Faster than 3D printing. Semi-industrial quantities.": "Vous pouvez imprimer un modèle en quelques heures ou investir des dizaines de milliers d’euros dans la production industrielle. Pourquoi ne pas choisir une solution intermédiaire ? Plus rapide que l’impression 3D. Des volumes semi-industriels.",
    "Influx is the answer.": "InFlux est la réponse.",
    "Evidence route": "Parcours de validation",
    "From an ambitious idea to a working machine.": "D’une idée ambitieuse à une machine fonctionnelle.",
    "Thermal tested": "Testée thermiquement",
    "6,331 samples in the longest captured campaign.": "6 331 mesures lors de la plus longue campagne enregistrée.",
    "Control stack built": "Système de commande intégré",
    "Firmware, Wi-Fi bridge, operator app, and servicing functions.": "Micrologiciel, passerelle Wi-Fi, application opérateur et fonctions de maintenance.",
    "Part injected": "Pièce injectée",
    "We don't try to convince. We prove.": "Nous ne cherchons pas à convaincre. Nous démontrons.",
    "Public resources": "Ressources publiques",
    "Built to be inspected, questioned, and improved.": "Conçu pour être examiné, remis en question et amélioré.",
    "Meet the team": "Découvrir l’équipe",
    "From an idea": "D’une idée",
    "to a": "à une",
    "working machine.": "machine fonctionnelle.",
    "We didn't build it all in one day. We took it step by step, making sure to improve along the way.": "Nous ne l’avons pas construite en un jour. Nous avons avancé étape par étape, en l’améliorant au fil du projet.",
    "An idea appears": "Une idée prend forme",
    "Sketches": "Croquis",
    "My 3D printer is too slow and we can't afford industrial machinery. But what is in between?": "Mon imprimante 3D est trop lente et nous n’avons pas les moyens d’acheter des machines industrielles. Quelle solution existe entre les deux ?",
    "Thus, we started sketching a machine that can manufacture high quantities for cheap.": "Nous avons donc commencé à imaginer une machine capable de produire des volumes plus élevés à moindre coût.",
    "Research the injection process": "Étudier le procédé d’injection",
    "Separate the machine into sub-systems": "Diviser la machine en sous-systèmes",
    "Separate the sub-systems into individual components": "Décomposer les sous-systèmes en composants individuels",
    "Physical experiments": "Expériences physiques",
    "The beginning of InFlux": "Les débuts d’InFlux",
    "The idea proved possible, so we defined a brand identity. We don't sell a generic injection molding machine.": "L’idée s’est révélée réalisable, nous avons donc défini une identité de marque. Nous ne proposons pas une presse à injecter générique.",
    "We sell Influx.": "Nous construisons InFlux.",
    "Design a brand name and logo.": "Créer un nom de marque et un logo.",
    "Define our goals.": "Définir nos objectifs.",
    "Study the market": "Étudier le marché",
    "Machine Prototyping": "Prototypage de la machine",
    "Plan for MK1": "Plan du MK1",
    "Branding and general architecture in place, it was time for engineering.": "Une fois l’identité et l’architecture générale définies, il était temps de passer à l’ingénierie.",
    "CAD, programming, simulations, test, repeat. There is no going back now.": "CAO, programmation, simulations, essais, puis on recommence. Plus question de revenir en arrière.",
    "Selecting and ordering components.": "Sélection et commande des composants.",
    "Mechanical and electrical design.": "Conception mécanique et électrique.",
    "Making the first sub-systems work together.": "Faire fonctionner les premiers sous-systèmes ensemble.",
    "First working prototype": "Premier prototype fonctionnel",
    "Our first complete machine capable of producing real injected parts. Although the automations aren't perfect, it gets the job done, and it certainly does it cheaper than industrial solutions.": "Notre première machine complète, capable de produire de véritables pièces injectées. Les automatismes ne sont pas encore parfaits, mais elle remplit sa mission, à un coût bien inférieur aux solutions industrielles.",
    "Desktop sized": "Format de bureau",
    "Water-cooled resin and metal mold compatibility": "Compatible avec les moules en résine et en métal refroidis par eau",
    "Fully compatible with the Influx Operator app": "Entièrement compatible avec l’application InFlux Operator",
    "Future product direction": "Prochaine orientation du produit",
    "Next up": "À venir",
    "The next version will focus on a fully automated and monitored process, with water, molten plastic, and mold pressure monitoring. Designed for continuous thrustworthy operation.": "La prochaine version se concentrera sur un procédé entièrement automatisé et surveillé, avec suivi de l’eau, du plastique fondu et de la pression dans le moule. Elle sera conçue pour un fonctionnement continu et fiable.",
    "Full machine enclosure": "Carénage complet de la machine",
    "Pressure sensing and temperature balancing": "Mesure de la pression et équilibrage de la température",
    "Printed molds lifetime improvements": "Amélioration de la durée de vie des moules imprimés",
    "Interactive assembly": "Assemblage interactif",
    "Inspect the machine, not just the pitch.": "Examinez la machine, pas seulement le discours.",
    "No need to take our word for it, convince yourself. Take a look at the InFlux Origin Mk. 1.": "Ne nous croyez pas sur parole : faites-vous votre propre avis. Découvrez InFlux Origin MK1.",
    "Loads a 0.31 MB optimized model and the viewer runtime.": "Charge un modèle optimisé de 0,31 Mo et le moteur de visualisation.",
    "Load interactive 3D": "Charger le modèle 3D interactif",
    "Loading viewer": "Chargement de la visionneuse",
    "Loading optimized assembly": "Chargement de l’assemblage optimisé",
    "Retry interactive 3D": "Réessayer le modèle 3D interactif",
    "Three systems. One machine.": "Trois systèmes. Une seule machine.",
    "Operator": "Opérateur",
    "Control surface": "Interface de contrôle",
    "Motherboard": "Carte mère",
    "Control electronics": "Électronique de commande",
    "Thermal Lab": "Laboratoire thermique",
    "Validation evidence": "Résultats de validation",
    "Operator interface": "Interface opérateur",
    "Everything the operator needs, in one place.": "Tout ce dont l’opérateur a besoin, au même endroit.",
    "A dedicated interface with internet connectivity. It includes complete machine monitoring, control and servicing functions.": "Une interface dédiée avec connexion réseau. Elle permet de surveiller et de contrôler toute la machine, ainsi que d’accéder aux fonctions de diagnostic et de maintenance.",
    "This is where the machine starts thinking.": "C’est ici que la machine commence à penser.",
    "A custom PCB that serves as the central hub for every part of the machine. Offers the possibility for easy expansion and component replacement.": "Une carte de circuit imprimé (PCB) sur mesure qui centralise et coordonne tous les éléments de la machine. Elle facilite aussi les extensions et le remplacement des composants.",
    "Thermal testing": "Essais thermiques",
    "We measure instead of guessing.": "Nous mesurons au lieu de deviner.",
    "We measured heating and cooling time, temperature stability, sensor precision and heat spread to improve the next version of the machine.": "Nous avons mesuré les temps de chauffe et de refroidissement, la stabilité de la température, la précision des capteurs et la répartition de la chaleur afin d’améliorer la prochaine version de la machine.",
    "Volta Circuits record": "Prix de Volta Circuits",
    "Built to": "Conçus pour",
    "go further.": "aller plus loin.",
    "achievements": "réalisations",
    "One continuous record of competition, recognition, and engineering progress.": "Un parcours continu de compétitions, de reconnaissance et de progrès en ingénierie.",
    "National": "National",
    "International": "International",
    "Complete record": "Liste complète des prix",
    "Complete timeline": "Chronologie complète",
    "Every step": "Chaque étape",
    "in one line.": "sur une seule ligne.",
    "achievements · 3 years": "réalisations · 3 ans",
    "Organizer roles": "Rôles d’organisateur",
    "National competition": "Compétition nationale",
    "International competition": "Compétition internationale",
    "Organizer role": "Rôle d’organisateur",
    "Five most important achievements": "Les cinq réalisations les plus importantes",
    "Rank 1, DaVinci 2026": "Rang 1, DaVinci 2026",
    "Rank 2, RoSEF 2026": "Rang 2, RoSEF 2026",
    "Rank 3, ONCS": "Rang 3, ONCS",
    "Rank 4, FRI 2026": "Rang 4, FRI 2026",
    "Rank 5, MILSET Abu Dhabi": "Rang 5, MILSET Abu Dhabi",
    "Jump to achievement year": "Aller à l’année des réalisations",
    "Achievement overview": "Vue d’ensemble des réalisations",
    "Achievements from 2026": "Réalisations de 2026",
    "Achievements from 2025": "Réalisations de 2025",
    "Achievements from 2024": "Réalisations de 2024",
    "Results and competition stages": "Résultats et étapes de la compétition",
    "Final stage": "Phase finale",
    "First place": "1re place",
    "National stage": "Phase nationale",
    "Second place": "2e place",
    "County stage": "Phase départementale",
    "Participation": "Participation",
    "Playoffs": "Éliminatoires",
    "Alliance Captain": "Capitaine d’alliance",
    "Ranking": "Classement",
    "6th place": "6e place",
    "Technical Creativity · 11th grade": "Créativité technique · 11e année",
    "Drag Racing": "Course d’accélération",
    "Delegation award": "Prix de la délégation",
    "Best Delegation": "Meilleure délégation",
    "Alliance competition": "Compétition par alliances",
    "Finalist alliance": "Alliance finaliste",
    "Storyteller Award": "Prix Storyteller",
    "FTC Meet": "Rencontre FTC",
    "Organizers": "Organisateurs",
    "Qualified": "Qualifiés",
    "Final ranking": "Classement final",
    "Third place": "3e place",
    "Teenager Maker Camp and Teacher Workshop": "Camp de jeunes créateurs et atelier pour enseignants",
    "Award winners": "Lauréats",
    "Achievement page sections": "Sections de la page des prix",
    "Upcoming": "À venir",
    "Upcoming events": "Événements à venir",
    "upcoming events": "événements à venir",
    "2026–2027 season": "Saison 2026–2027",
    "Next": "Prochains",
    "events.": "événements.",
    "We almost always accept invitations.": "Nous acceptons presque toujours les invitations.",
    "Invite us": "Invitez-nous",
    "Upcoming event schedule": "Calendrier des événements à venir",
    "Scheduled": "Programmé",
    "Season": "Saison",
    "Dates TBA": "Dates à confirmer",
    "25–28 August 2026": "25–28 août 2026",
    "1–6 September 2026": "1–6 septembre 2026",
    "18–24 September 2026": "18–24 septembre 2026",
    "September 2026 — February 2027": "septembre 2026 — février 2027",
    "November 2026": "novembre 2026",
    "2026 · Dates TBA": "2026 · Dates à confirmer",
    "March–April 2027 · Dates TBA": "mars–avril 2027 · Dates à confirmer",
    "March–May 2027 · Dates TBA": "mars–mai 2027 · Dates à confirmer",
    "Press": "Presse",
    "Press appearances": "Parutions presse",
    "Our work,": "Notre travail,",
    "documented.": "documenté.",
    "appearances": "parutions",
    "Independent and institutional coverage from 2024.": "Couverture indépendante et institutionnelle de 2024.",
    "Drag or use the arrows": "Faites glisser ou utilisez les flèches",
    "Previous article": "Article précédent",
    "Next article": "Article suivant",
    "All press appearances": "Toutes les parutions presse",
    "Open article": "Ouvrir l’article",
    "Co-organizer": "Coorganisateur",
    "Named organizer": "Cité comme organisateur",
    "National qualification": "Qualification nationale",
    "Public outreach": "Présentation publique",
    "Educational partner": "Partenaire éducatif",
    "Summer school organizer": "Organisateur de l’école d’été",
    "National recognition": "Reconnaissance nationale",
    "Featured team": "Équipe mise en avant",
    "Participant": "Participant",
    "Robotics competition in Suceava": "Compétition de robotique à Suceava",
    "Press review clipping naming Volta Circuits": "Extrait de revue de presse citant Volta Circuits",
    "Volta Circuits at a robotics event": "Volta Circuits lors d’un événement de robotique",
    "EduFortress Childhood Festival": "Festival EduFortress Childhood",
    "Volta Circuits summer robotics school": "École d’été de robotique Volta Circuits",
    "Volta Circuits team": "Équipe Volta Circuits",
    "Decode the Bolts robotics event": "Événement de robotique Decode the Bolts",
    "League Meet in Botoșani": "League Meet à Botoșani",

    "Team Volta Circuits": "Équipe Volta Circuits",
    "Four disciplines.": "Quatre disciplines.",
    "One physical result.": "Un résultat concret.",
    "InFlux is built at the intersection of engineering, analysis and business. Nothing is left out.": "InFlux réunit l’ingénierie, l’analyse et la stratégie commerciale. Aucun aspect n’est laissé de côté.",
    "Engineering lead": "Responsable ingénierie",
    "Mechanical engineering, manufacturing, CAD design, electrical integration, microcontrollers, and product development.": "Ingénierie mécanique, fabrication, conception CAO, intégration électrique, microcontrôleurs et développement produit.",
    "Build the machine.": "Construire la machine.",
    "Simulation + analysis lead": "Responsable simulations et analyses",
    "Math, SimScale, Unreal Engine simulations, Python models, machine learning, and data analysis.": "Mathématiques, simulations SimScale et Unreal Engine, modèles Python, apprentissage automatique et analyse de données.",
    "Prove the decisions.": "Justifier les décisions.",
    "Embedded programming": "Programmation embarquée",
    "Arduino, C++, C, backend development, automations, and system integration.": "Arduino, C++, C, développement back-end, automatisations et intégration système.",
    "Make it think.": "La faire réfléchir.",
    "Engineering Rookie": "Ingénieure junior",
    "Newest member of the team, still in training.": "Dernière arrivée dans l’équipe, encore en formation.",
    "Continue the legacy.": "Poursuivre l’héritage.",
    "Working principle": "Principe de fonctionnement",
    "Plan. Build. Measure. Explain. As simple as that.": "Planifier. Construire. Mesurer. Expliquer. C’est aussi simple que cela.",
    "Public collaboration path": "Comment collaborer",
    "Review the work.": "Examinez notre travail.",
    "Challenge us.": "Mettez-nous au défi.",
    "Start with the public dossier, inspect the current artifacts, or follow the active repository.": "Commencez par le dossier public, consultez les ressources disponibles ou suivez le dépôt actif.",
    "Read technical dossier": "Lire le dossier technique",
    "Open public artifacts": "Ouvrir les ressources publiques",
    "View repository": "Voir le dépôt",
    "Contact": "Contactez-",
    "Us": "nous",
    "For sponsorships, collaboration, media or general interest in our project, use the addresses below.": "Pour toute demande de sponsoring, de collaboration, de presse ou pour en savoir plus sur notre projet, utilisez les adresses ci-dessous.",
    "We're here to": "Nous sommes là pour",
    "connect.": "échanger.",
    "Sponsorship": "Sponsoring",
    "Interested in becoming a sponsor? We have multiple ways of promoting your brand, all tailored to your needs.": "Vous souhaitez devenir sponsor ? Nous proposons plusieurs façons de mettre votre marque en valeur, adaptées à vos besoins.",
    "Send sponsorship email": "Envoyer une demande de sponsoring",
    "General Inquiry": "Demandes générales",
    "Questions, collaborations, event invites, media requests or ideas you'd like to discuss with the team. We are open to anything!": "Questions, collaborations, invitations à des événements, demandes médias ou idées à discuter avec l’équipe : nous sommes ouverts à toutes les propositions !",
    "Send general email": "Envoyer un e-mail",
    "Join": "REJOIGNEZ",
    "Recruitment": "Recrutement",
    "Help build what comes next.": "Aidez-nous à construire la suite.",
    "We are looking for driven people ready to turn ambitious engineering into working hardware, software, and proof.": "Nous recherchons des personnes motivées, prêtes à transformer des projets d’ingénierie ambitieux en solutions matérielles et logicielles fonctionnelles, appuyées par des résultats concrets.",
    "Questions? Email David": "Des questions ? Écrivez à David",
    "Apply through Google Forms": "Postuler via Google Forms",
    "Apply": "Postuler",
    "now": "\u200B",
    "Apply now": "Postuler",
    "Current Sponsors": "Sponsors actuels",
    "Thank you to our": "Merci à nos",
    "sponsors!": "sponsors !",
    "Interested in becoming a sponsor? Contact us!": "Vous souhaitez devenir sponsor ? Contactez-nous !",
    "Sponsor visibility": "Visibilité des sponsors",
    "Your brand can travel with the team.": "Votre marque accompagne l’équipe partout où elle va.",
    "Sponsorship packages can include visible placement on our uniforms and public presentation materials.": "Les formules de sponsoring peuvent inclure une présence visible sur nos tenues et nos supports de présentation publics.",
    "See our press coverage": "Voir notre couverture médiatique",
    "Build the next machine": "Construisez la prochaine machine",
    "with us.": "avec nous.",
    "Four partnership levels. Clear visibility at every stage.": "Quatre niveaux de partenariat. Une visibilité claire à chaque étape.",
    "Become a sponsor": "Devenir sponsor",
    "Competition results, builds and team updates.": "Résultats en compétition, prototypes et actualités de l’équipe.",
    "Workshop clips, testing and competition moments.": "Coulisses de l’atelier, essais et moments de compétition.",
    "Team channels": "Canaux de l’équipe",
    "FTC website": "Site web FTC",
    "Official FTC team website, roster and mission.": "Site officiel de l’équipe FTC, composition et mission.",
    "Crowdfunding": "Financement participatif",
    "Support InFlux": "Soutenir InFlux",
    "Want to support us as an individual? Explore our crowdfunding campaign.": "Vous souhaitez nous soutenir à titre individuel ? Découvrez notre campagne de financement participatif.",
    "Why sponsor us?": "Pourquoi nous sponsoriser ?",
    "Your brand, in front of the": "Votre marque, devant la",
    "next generation of engineers.": "prochaine génération d’ingénieurs.",
    "InFlux is more than a competition project. Between September and May, we plan to take it into Romania's technical student community.": "InFlux est plus qu’un projet de concours. De septembre à mai, nous prévoyons de le présenter à la communauté étudiante technique de Roumanie.",
    "Our 2026–27 season": "Notre saison 2026–27",
    "Competitions & events": "Compétitions et événements",
    "Season target, with additional appearances when opportunities arise.": "Objectif de la saison, avec des apparitions supplémentaires lorsque des occasions se présentent.",
    "People per event": "Personnes par événement",
    "Typical total audience: participants, judges, mentors, organizers and visitors.": "Audience totale habituelle : participants, jurés, mentors, organisateurs et visiteurs.",
    "Core audience": "Public principal",
    "Students interested in engineering, programming, electronics, manufacturing and product development.": "Élèves intéressés par l’ingénierie, la programmation, l’électronique, la fabrication et le développement de produits.",
    "Social followers": "Abonnés sur les réseaux sociaux",
    "Combined Instagram and TikTok community.": "Communauté cumulée sur Instagram et TikTok.",
    "Across Romania": "Dans toute la Roumanie",
    "We bring robotics to people.": "Nous rapprochons la robotique du public.",
    "We demonstrate InFlux at schools, businesses, competitions and public events across Romania. We accept most invitations when schedules and logistics allow.": "Nous présentons InFlux dans des écoles, des entreprises, des compétitions et des événements publics en Roumanie. Nous acceptons la plupart des invitations lorsque le calendrier et la logistique le permettent.",
    "What support builds": "Ce que le soutien construit",
    "Tools on the bench.": "Des outils sur l’établi.",
    "Components in the machine.": "Des composants dans la machine.",
    "Support becomes equipment, materials and experiments we can afford to run.": "Le soutien devient des équipements, des matériaux et des expériences que nous pouvons financer.",
    "Identity & workspace": "Identité et espace de travail",
    "Our team rebrand, stronger public identity and the foundation of our laboratory.": "La nouvelle identité de l’équipe, une présence publique plus forte et les bases de notre laboratoire.",
    "Tools & components": "Outils et composants",
    "Equipment, materials, electronics and mechanical parts for manufacturing, assembly and testing.": "Équipements, matériaux, composants électroniques et mécaniques pour fabriquer, assembler et tester.",
    "Experiments & prototypes": "Expériences et prototypes",
    "Iterations we can build, test and learn from—including the ones that fail.": "Des itérations que nous pouvons construire, tester et dont nous pouvons tirer des leçons — y compris celles qui échouent.",
    "The next machine": "La prochaine machine",
    "Continued development of the next InFlux Origin generation.": "La poursuite du développement de la prochaine génération d’InFlux Origin.",
    "You are not simply placing a logo.": "Vous ne faites pas que placer un logo.",
    "You are funding our projects.": "Vous financez nos projets.",
    "Partnership hierarchy": "Hiérarchie des partenariats",
    "Choose how your brand shows up.": "Choisissez comment votre marque sera mise en avant.",
    "Every higher level includes all benefits from the levels before it.": "Chaque niveau supérieur inclut tous les avantages des niveaux précédents.",
    "Discuss a partnership": "Discuter d’un partenariat",
    "Sponsorship levels and benefits": "Niveaux et avantages du sponsoring",
    "Supporter": "Soutien",
    "Silver Sponsor": "Sponsor Argent",
    "Gold Sponsor": "Sponsor Or",
    "Diamond Sponsor": "Sponsor Diamant",
    "1 benefit": "1 avantage",
    "3 benefits total": "3 avantages au total",
    "7 benefits total": "7 avantages au total",
    "11 benefits total": "11 avantages au total",
    "Includes Supporter": "Inclut le niveau Soutien",
    "Includes Silver": "Inclut le niveau Argent",
    "Includes Gold": "Inclut le niveau Or",
    "End-of-season post on Instagram and Facebook": "Publication de fin de saison sur Instagram et Facebook",
    "Logo on the sponsors roll-up banner": "Logo sur le roll-up des sponsors",
    "Special sticker with the sponsor logo": "Autocollant spécial avec le logo du sponsor",
    "Logo on competition T-shirts*": "Logo sur les T-shirts de compétition*",
    "Mention in the description of every social post": "Mention dans la description de chaque publication",
    "Promotion on event video displays": "Promotion sur les écrans vidéo des événements",
    "Logo on the machine walls or panels": "Logo sur les parois ou panneaux de la machine",
    "Mention in all press articles": "Mention dans tous les articles de presse",
    "Special promotional video": "Vidéo promotionnelle spéciale",
    "Logo on a spider display banner": "Logo sur une bannière spider display",
    "Dedicated sponsor post on Instagram and Facebook": "Publication dédiée au sponsor sur Instagram et Facebook",
    "* T-shirt placement depends on production timing. If materials are already ordered, the logo moves to the next relevant batch or equivalent visibility, with temporary placement where appropriate.": "* L’affichage sur les T-shirts dépend du calendrier de production. Si les supports ont déjà été commandés, le logo figurera sur le prochain lot pertinent ou bénéficiera d’une visibilité équivalente, avec un marquage temporaire lorsque cela est approprié.",
    "Custom visibility": "Visibilité personnalisée",
    "Need a tailored package?": "Besoin d’une formule sur mesure ?",
    "Strategic sponsorships can include additional machine, event, presentation, media, or technical visibility, agreed separately in writing.": "Les sponsorings stratégiques peuvent inclure une visibilité supplémentaire sur la machine, lors d’événements, dans les présentations, les médias ou les supports techniques, convenue séparément par écrit.",
    "Request custom visibility": "Demander une visibilité personnalisée",
    "Already building with us.": "Ils construisent déjà à nos côtés.",
    "Proof of the prototype": "Validation du prototype",
    "Not perfect.": "Pas parfait.",
    "But it proves the concept.": "Mais cela valide le concept.",
    "A bad-looking first part doesn't prove the machine is poorly made. It proves the machine can control heat, melt plastic, control injection amount, flow cooling water, clamp molds and eject parts.": "Une première pièce imparfaite ne signifie pas que la machine est mal conçue. Elle prouve que la machine peut maîtriser la température, faire fondre le plastique, doser la quantité injectée, faire circuler l’eau de refroidissement, fermer les moules et éjecter les pièces.",
    "samples in the longest captured thermal campaign, recorded April 16, 2026": "mesures lors de la plus longue campagne thermique enregistrée, le 16 avril 2026",
    "measured heat-up, stabilization, and cooldown period": "période mesurée de chauffe, de stabilisation et de refroidissement",
    "reported thermal model agreement with SimScale simulations": "concordance annoncée du modèle thermique avec les simulations SimScale",
    "operator app, machine, and safety all in one system": "application opérateur, commande de la machine et fonctions de sécurité réunies dans un seul système",
    "Thermal tests": "Essais thermiques",
    "Measurements defined the variables.": "Les mesures ont défini les paramètres.",
    "Thermal camera images and logged sensor data exposed heat loss, hot spots, and control behavior before those weaknesses became hidden inside an enclosure.": "Les images de la caméra thermique et les données enregistrées par les capteurs ont révélé les pertes de chaleur, les points chauds et le comportement du système de commande avant que ces faiblesses ne soient dissimulées par le carénage.",
    "Centralised control": "Contrôle centralisé",
    "Every action answers to the same hub.": "Toutes les actions passent par le même centre de contrôle.",
    "The connectivity board communicates with the user, so the motherboard can focus on safety and precise control. All settings, sensors and outputs are controlled by the motherboard, running an STM32.": "La carte de connectivité échange avec l’utilisateur afin que la carte mère puisse se concentrer sur la sécurité et la précision de la commande. Tous les réglages, les données des capteurs et les sorties sont gérés par la carte mère équipée d’un STM32.",
    "Repeatability": "Répétabilité",
    "56 parts.": "56 pièces.",
    "One mold.": "Un seul moule.",
    "A single 3D printed resin mold was able to produce 56 individual parts before failure. Analysis revealed failure points and proposed quality-of-life improvements. The next version WILL be better.": "Un seul moule en résine imprimé en 3D a permis de produire 56 pièces avant de céder. L’analyse a mis en évidence les points de défaillance et proposé des améliorations pratiques. La prochaine version SERA meilleure.",
    "Prototype status": "État du prototype",
    "What is not proven.": "Ce qui n’est pas encore démontré.",
    ". . .yet": "… pour l’instant",
    "Mold life": "Durée de vie du moule",
    "Resin mold durability across continuous, repeated cycles.": "Durabilité des moules en résine lors de cycles continus et répétés.",
    "Continuous running": "Fonctionnement continu",
    "Stable output quality across longer, controlled runs.": "Qualité de production stable sur des séries contrôlées plus longues.",
    "Price reduction": "Réduction du prix",
    "Reducing the profitable selling cost as much as possible.": "Réduire le prix de vente autant que possible tout en préservant la rentabilité.",
    "Max water temperature": "Température maximale de l’eau",
    "Maximum temperature the mold cooling water reaches during normal operation.": "Température maximale atteinte par l’eau de refroidissement du moule en fonctionnement normal.",
    "Milestones": "Étapes clés",
    "cycle": "cycle",
    "cycles": "cycles",
    "hour": "heure",
    "hours": "heures",
    "1 stack": "1 ensemble",
    "108.6 min": "108,6 min",
    "{value} milestone": "Jalon : {value}",
    "{value} milestone passed": "Jalon atteint : {value}",
    "{current} of {final} ({percent})": "{current} sur {final} ({percent})",
    "{current} reduced from {start} toward {final} ({percent})": "{current}, réduit de {start} vers {final} ({percent})",
    "Download Hub": "Centre de téléchargements",
    "Public files.": "Fichiers publics.",
    "Clearly labeled.": "Clairement identifiés.",
    "Welcome to the download hub! Check out the app, technical notebook or the branding materials.": "Bienvenue dans le centre de téléchargements ! Découvrez l’application, le cahier technique ou les ressources de la marque.",
    "JavaScript is disabled. Direct files:": "JavaScript est désactivé. Fichiers directs :",
    "Operator APK": "APK opérateur",
    "technical notebook": "cahier technique",
    "logo SVG": "logo SVG",
    "Prototype notice:": "Avertissement concernant le prototype :",
    "The public Influx Operator APK is still in development. Do not use it as a general-purpose machine controller. Constant machine supervision is required.": "L’APK public InFlux Operator est encore en développement. Ne l’utilisez pas comme système de commande généraliste. Une surveillance constante de la machine est indispensable.",
    "Integrity:": "Intégrité :",
    "SHA-256 checksums are published in": "Les sommes de contrôle SHA-256 sont publiées dans",
    ". If the checksums don't check out, your file is NOT from Influx! Be careful of modified installations!": ". Si les sommes de contrôle ne correspondent pas, le fichier ne provient PAS d’InFlux ! Méfiez-vous des versions modifiées !",
    "InFlux Operator APK": "APK InFlux Operator",
    "Prototype operator artifact": "Version prototype de l’application opérateur",
    "Latest version of the Influx Origin control app.": "Dernière version de l’application de contrôle InFlux Origin.",
    "Android APK / 19.79 MB / June 2026": "APK Android / 19,79 Mo / juin 2026",
    "ONCS operator artifact": "Version opérateur ONCS",
    "Auto Connect app build used for the ONCS presentation path.": "Version de l’application Auto Connect utilisée pour la présentation ONCS.",
    "Android APK / 19.79 MB / May 2026": "APK Android / 19,79 Mo / mai 2026",
    "Technical Notebook": "Cahier technique",
    "Public documentation / PDF": "Documentation publique / PDF",
    "Ten-page public notebook covering the project, system, testing, and direction.": "Cahier public de dix pages présentant le projet, le système, les essais et son orientation future.",
    "PDF / 645 KB / June 2026": "PDF / 645 Ko / juin 2026",
    "Extended Technical Dossier": "Dossier technique détaillé",
    "Public documentation / web": "Documentation publique / en ligne",
    "Long-form documentation covering mechanics, control, validation, limits, and next steps.": "Documentation complète sur la mécanique, le contrôle, la validation, les limites et les prochaines étapes.",
    "Web technical notebook": "Cahier technique en ligne",
    "InFlux Origin Logo": "Logo InFlux Origin",
    "Public brand asset / SVG": "Ressource publique de la marque / SVG",
    "Scalable monochrome logo for project references and approved public coverage.": "Logo monochrome vectoriel pour les références au projet et les publications publiques autorisées.",
    "External Links + References": "Liens externes et références",
    "Follow the work.": "Suivez le projet.",
    "Check the sources.": "Consultez les sources.",
    "Public project destinations and technical references that informed the platform.": "Pages publiques du projet et références techniques ayant contribué au développement de la plateforme.",
    "Project destinations": "Pages du projet",
    "Technical documentation": "Documentation technique",
    "Read the extended project dossier": "Lire le dossier détaillé du projet",
    "Download hub": "Centre de téléchargements",
    "APK, notebook, and public brand files": "APK, cahier technique et ressources publiques de la marque",
    "Evidence overview": "Présentation des résultats",
    "Results, measurements, and current limits": "Résultats, mesures et limites actuelles",
    "Public repository": "Dépôt public",
    "Inspect the active software and firmware record": "Consulter les versions en cours de développement du logiciel et du micrologiciel",
    "Technical references": "Références techniques",
    "Low-volume injection molding with 3D printed molds": "Moulage par injection en petite série avec des moules imprimés en 3D",
    "Plastic injection molding design guidelines": "Règles de conception pour le moulage par injection plastique",
    "NUCLEO-H753ZI product documentation": "Documentation produit du NUCLEO-H753ZI",
    "Thermocouple fundamentals": "Principes de base des thermocouples",
    "Public technical dossier": "Dossier technique public",
    "A desktop injection molding platform integrating mechanics, thermal control, machine firmware, operator software, safety logic, and experimental tooling.": "Une plateforme de moulage par injection de bureau réunissant mécanique, commande thermique, micrologiciel de la machine, logiciel opérateur, logique de sécurité et outillage expérimental.",
    "Download notebook": "Télécharger le cahier",
    "Back to project hub": "Retour au portail du projet",
    "Current state": "État actuel",
    "Integrated prototype in active calibration": "Prototype intégré en cours de mise au point",
    "Primary objective": "Objectif principal",
    "Repeatable small-part thermoplastic injection": "Injection reproductible de petites pièces thermoplastiques",
    "Tooling direction": "Orientation de l’outillage",
    "Rapid resin molds with controlled cooling": "Moules en résine à fabrication rapide avec refroidissement contrôlé",
    "Control path": "Chaîne de contrôle",
    "Android operator → ESP bridge → Nucleo firmware": "Application Android → passerelle ESP → micrologiciel Nucleo",
    "Volta Circuits": "Volta Circuits",
    "Contents": "Sommaire",
    "1. Project definition": "1. Définition du projet",
    "2. System architecture": "2. Architecture du système",
    "3. Mechanical system": "3. Système mécanique",
    "4. Thermal system": "4. Système thermique",
    "5. Electronics and controls": "5. Électronique et contrôle",
    "6. Firmware and operator stack": "6. Micrologiciel et interface opérateur",
    "7. Safety position": "7. Sécurité",
    "8. Validation evidence": "8. Résultats de validation",
    "9. Current limits": "9. Limites actuelles",
    "10. Product direction": "10. Orientation du produit",
    "11. Team": "11. Équipe",
    "01 / Project definition": "01 / Définition du projet",
    "Manufacturing evidence before industrial tooling.": "Validation de la fabrication avant d’investir dans l’outillage industriel.",
    "InFlux Origin MK1 is a desktop-scale injection molding prototype built to help teams learn from real thermoplastic parts before committing to conventional production tooling. It is intended for process learning, functional validation, education, and future short-run experimentation.": "InFlux Origin MK1 est un prototype compact de moulage par injection, conçu pour aider les équipes à tester le procédé sur de véritables pièces thermoplastiques avant d’investir dans un outillage de production conventionnel. Il est destiné à l’apprentissage du procédé, à la validation fonctionnelle, à l’enseignement et à de futurs essais en petite série.",
    "The project does not claim to replace an industrial injection molding machine. Its purpose is to reduce the distance between a 3D printed model and a professionally tooled production part by making the molding process more accessible, measurable, and iterative.": "Le projet ne prétend pas remplacer une machine industrielle de moulage par injection. Son objectif est de réduire l’écart entre un modèle imprimé en 3D et une pièce de production réalisée avec un outillage professionnel, en rendant le procédé plus accessible, mesurable et itératif.",
    "02 / System architecture": "02 / Architecture du système",
    "A complete machine, not an isolated mechanism.": "Une machine complète, pas un mécanisme isolé.",
    "The platform is organized into six connected layers:": "La plateforme est organisée en six ensembles interconnectés :",
    "Structural frame and aligned movement system.": "Châssis structurel et système de guidage aligné.",
    "Heated barrel, nozzle, and piston-driven injection path.": "Fourreau chauffé, buse et mécanisme d’injection à piston.",
    "Mold support, closing movement, and rapid tooling package.": "Support de moule, mécanisme de fermeture et solution d’outillage rapide.",
    "Power distribution, sensors, motion drivers, and emergency inputs.": "Distribution électrique, capteurs, pilotes de moteurs et entrées d’arrêt d’urgence.",
    "Nucleo machine firmware and ESP32-C6 communication bridge.": "Micrologiciel de la machine sur Nucleo et passerelle de communication ESP32-C6.",
    "Android operator interface and diagnostic support tools.": "Interface opérateur Android et outils d’aide au diagnostic.",
    "The Nucleo controller owns machine state, heating, motion, safety checks, and cycle behavior. The ESP bridge translates same-network operator requests into the machine command protocol. The Android application presents status and sends supported commands.": "Le contrôleur Nucleo gère l’état de la machine, le chauffage, les mouvements, les contrôles de sécurité et le déroulement des cycles. La passerelle ESP traduit les requêtes de l’opérateur sur le même réseau en commandes comprises par la machine. L’application Android affiche l’état et envoie les commandes prises en charge.",
    "Confirmed platform summary": "Résumé vérifié de la plateforme",
    "Machine controller": "Contrôleur de la machine",
    "Communication bridge": "Passerelle de communication",
    "ESP32-C6 / local HTTP to acknowledged UART commands": "ESP32-C6 / HTTP local converti en commandes UART avec accusé de réception",
    "Android application for status and supported commands": "Application Android pour afficher l’état et envoyer les commandes prises en charge",
    "Thermal sensing": "Mesure de la température",
    "Multiple K-type thermocouples across the heated barrel": "Plusieurs thermocouples de type K répartis sur le fourreau chauffé",
    "3D-printed photopolymer resin molds with controlled water cooling": "Moules en résine photopolymère imprimés en 3D avec refroidissement par eau contrôlé",
    "Current status": "État actuel",
    "Supervised integrated prototype in active calibration": "Prototype intégré supervisé en cours de mise au point",
    "03 / Mechanical system": "03 / Système mécanique",
    "Alignment and load paths decide whether the process is repeatable.": "L’alignement et la transmission des efforts déterminent la répétabilité du procédé.",
    "The current structure uses aluminum extrusion, interface plates, linear guidance, lead-screw movement, and a servo-driven injection axis. The architecture remains adjustable because the prototype is still being calibrated around real component behavior and mold geometry.": "La structure actuelle utilise des profilés en aluminium, des plaques d’interface, des guidages linéaires, des vis d’entraînement et un axe d’injection entraîné par servomoteur. L’architecture reste réglable, car le prototype est encore mis au point en fonction du comportement réel des composants et de la géométrie des moules.",
    "Mechanical priorities": "Priorités mécaniques",
    "Keep the nozzle, mold entry, and moving plates aligned across repeated cycles.": "Maintenir l’alignement entre la buse, l’entrée du moule et les plateaux mobiles au fil des cycles.",
    "Carry injection and clamping forces through structure rather than fragile tooling.": "Transmettre les efforts d’injection et de fermeture au châssis plutôt qu’à un outillage fragile.",
    "Make critical supports and service areas accessible during calibration.": "Garder les supports critiques et les zones de maintenance accessibles pendant la mise au point.",
    "Measure and reduce backlash, frame twist, and platen racking.": "Mesurer et réduire le jeu, la torsion du châssis et le désalignement des plateaux.",
    "04 / Thermal system": "04 / Système thermique",
    "Temperature is a process variable, not a visual effect.": "La température est un paramètre du procédé, pas un effet visuel.",
    "The barrel is heated in multiple zones and measured with K-type thermocouples. Logged tests and thermal-camera passes are used to inspect heat-up, stabilization, cooldown, sensor behavior, heat loss, and local hot spots.": "Le fourreau est chauffé en plusieurs zones et surveillé par des thermocouples de type K. Les données enregistrées et les relevés à la caméra thermique permettent d’étudier la montée en température, la stabilisation, le refroidissement, le comportement des capteurs, les pertes de chaleur et les points chauds locaux.",
    "The longest captured campaign contains 6,331 samples across approximately 108.6 minutes. Thermal modeling was compared with SimScale, with reported agreement around ±8% for the compared cases. These results guide insulation, sensor placement, nozzle design, cooling, and safe timing decisions.": "La plus longue campagne enregistrée comprend 6 331 mesures sur environ 108,6 minutes. Le modèle thermique a été comparé à SimScale, avec une concordance annoncée d’environ ±8 % pour les cas étudiés. Ces résultats orientent les choix d’isolation, de placement des capteurs, de conception de la buse, de refroidissement et de définition de temps de procédé sûrs.",
    "Evidence source: barrel-tuning campaign recorded April 16, 2026 and summarized in the public technical notebook.": "Source des résultats : campagne de réglage du fourreau enregistrée le 16 avril 2026 et résumée dans le cahier technique public.",
    "05 / Electronics and controls": "05 / Électronique et contrôle",
    "Prototype flexibility with explicit machine ownership.": "Souplesse du prototype, responsabilités clairement définies.",
    "The integrated control stack is centered on a NUCLEO-H753ZI. It interfaces with thermocouple modules, heater switching, stepper drivers, the injection servo path, safety inputs, and the communication bridge.": "Le système de commande intégré s’articule autour d’un NUCLEO-H753ZI. Il communique avec les modules de thermocouples, la commande des éléments chauffants, les pilotes de moteurs pas à pas, le servomoteur d’injection, les entrées de sécurité et la passerelle de communication.",
    "A dedicated Origin motherboard has been designed in KiCad to organize the current prototype wiring into a cleaner integration layer. It remains a prototype electronics project and is not presented as a certified production controller.": "Une carte mère Origin dédiée a été conçue dans KiCad afin de regrouper le câblage actuel du prototype dans une couche d’intégration plus propre. Elle reste un projet électronique expérimental et n’est pas présentée comme un contrôleur de production certifié.",
    "06 / Firmware and operator stack": "06 / Micrologiciel et interface opérateur",
    "Control remains close to the machine.": "La commande reste au plus près de la machine.",
    "The Nucleo owns safety admission, heating, movement, and cycle sequencing.": "Le Nucleo gère l’autorisation de fonctionnement, le chauffage, les mouvements et l’enchaînement des cycles.",
    "The ESP32-C6 acts as a narrow same-network HTTP-to-command bridge.": "L’ESP32-C6 sert de passerelle simple entre les requêtes HTTP du réseau local et les commandes de la machine.",
    "The Android operator app presents status, supported actions, and service access.": "L’application opérateur Android affiche l’état, les actions disponibles et les fonctions de maintenance.",
    "A desktop serial monitor and diagnostic sketches support commissioning and fault analysis.": "Un moniteur série de bureau et des outils de diagnostic facilitent la mise en service et l’analyse des défauts.",
    "The public operator APK is a prototype artifact for supervised demonstrations. It is not a general-purpose machine controller and should not be treated as a production release.": "L’APK opérateur public est un prototype destiné à des démonstrations supervisées. Il ne s’agit pas d’un système de commande généraliste et il ne doit pas être considéré comme une version de production.",
    "07 / Safety position": "07 / Sécurité du prototype",
    "Current use is supervised and prototype-only.": "L’utilisation actuelle est supervisée et réservée au prototype.",
    "The project combines mains-powered heating, hot surfaces, and powered motion. The current machine is operated as a supervised prototype. Emergency-stop behavior, safe startup defaults, fault handling, grounding, power isolation, and guarded access remain critical requirements.": "Le projet combine chauffage sur secteur, surfaces chaudes et mouvements motorisés. La machine actuelle est utilisée comme prototype sous surveillance. Le fonctionnement de l’arrêt d’urgence, les réglages sûrs par défaut au démarrage, la gestion des défauts, la mise à la terre, l’isolation électrique et la protection des zones d’accès restent des exigences essentielles.",
    "A future product version requires a cleaner enclosure, stronger hardware isolation, validated safety behavior, and a formal review appropriate to its intended users and environment.": "Une future version destinée au marché nécessitera un carénage mieux conçu, une isolation renforcée des circuits, des fonctions de sécurité validées et une évaluation formelle adaptée aux utilisateurs et à l’environnement visés.",
    "08 / Validation evidence": "08 / Résultats de validation",
    "The project has crossed from simulation into physical evidence.": "Le projet est passé des simulations à des preuves concrètes.",
    "A first successful injected part has been produced.": "Une première pièce a été injectée avec succès.",
    "Thermal behavior has been measured with logged sensors and a thermal camera.": "Le comportement thermique a été mesuré à l’aide de capteurs avec enregistrement des données et d’une caméra thermique.",
    "Major mechanical, electrical, firmware, and operator subsystems have been integrated.": "Les principaux sous-systèmes mécaniques, électriques, de micrologiciel et d’interface opérateur ont été intégrés.",
    "A dedicated PCB and a complete operator/control stack have been developed.": "Une carte électronique dédiée et un système complet d’interface opérateur et de commande ont été développés.",
    "The first part is evidence of system function, not proof of production readiness. Its defects are useful because they identify the next work in venting, fill behavior, tooling, and process calibration.": "La première pièce prouve que le système fonctionne, mais pas qu’il est prêt pour la production. Ses défauts sont utiles, car ils indiquent les prochains travaux à mener sur l’évacuation de l’air, le remplissage, l’outillage et le réglage du procédé.",
    "Validation record: public technical notebook, centralized June 11, 2026, with original measurements and active software/firmware sources retained.": "Dossier de validation : cahier technique public consolidé le 11 juin 2026, avec conservation des mesures d’origine ainsi que des sources logicielles et du micrologiciel en cours de développement.",
    "09 / Current limits": "09 / Limites actuelles",
    "What remains unproven.": "Ce qui reste à démontrer.",
    "Stable multi-part repeatability across longer runs.": "Une répétabilité stable sur plusieurs pièces et des séries plus longues.",
    "Long-run life and failure behavior of resin tooling.": "La durée de vie et les modes de défaillance des moules en résine sur de longues séries.",
    "Fully tuned filling, holding, venting, and ejection behavior.": "Le réglage complet du remplissage, du maintien en pression, de l’évacuation de l’air et de l’éjection.",
    "Final enclosure safety and production-grade electrical integration.": "La sécurité du carénage final et une intégration électrique de niveau industriel.",
    "Validated process windows across multiple material families.": "Des plages de paramètres de procédé validées pour plusieurs familles de matériaux.",
    "10 / Product direction": "10 / Orientation du produit",
    "Turn the experiment into a dependable platform.": "Transformer l’expérimentation en une plateforme fiable.",
    "The next Origin direction focuses on repeatability, stronger process sensing, better thermal insulation, refined mold interfaces, safer enclosure design, cleaner electronics, and a simpler operator workflow.": "La prochaine version d’Origin mettra l’accent sur la répétabilité, une surveillance plus poussée du procédé, une meilleure isolation thermique, des interfaces de moule améliorées, un carénage plus sûr, une électronique plus propre et un parcours opérateur plus simple.",
    "The long-term ambition is a useful workshop and education platform that can produce functional small parts, teach the complete molding process, and help hardware teams make better tooling decisions earlier.": "À long terme, nous voulons créer une plateforme utile pour les ateliers et l’enseignement, capable de produire de petites pièces fonctionnelles, d’expliquer l’ensemble du procédé de moulage et d’aider les équipes de développement matériel à prendre plus tôt de meilleures décisions concernant l’outillage.",
    "11 / Team": "11 / Équipe",
    "Engineering lead: mechanics, manufacturing, electronics, integration, and product development.": "Responsable ingénierie : mécanique, fabrication, électronique, intégration et développement produit.",
    "Simulation and analysis lead: SimScale, Python models, mathematics, and data analysis.": "Responsable simulation et analyse : SimScale, modèles Python, mathématiques et analyse de données.",
    "Embedded programming: Arduino, C++, C, backend development, automations, and system integration.": "Programmation embarquée : Arduino, C++, C, développement back-end, automatisations et intégration des systèmes.",
    "Engineering rookie: newest member of the team, still in training.": "Ingénieure junior : dernière arrivée dans l’équipe, encore en formation.",
    "Public technical dossier / integrated prototype in active calibration.": "Dossier technique public / prototype intégré en cours de mise au point.",
    "InFlux Origin AI overview": "Présentation d’InFlux Origin pour l’IA",
    "InFlux Origin structured project context": "Contexte structuré du projet InFlux Origin",
    "InFlux Origin AI technical context": "Contexte technique d’InFlux Origin destiné à l’IA",
    "Open InFlux home": "Ouvrir l’accueil InFlux",
    "InFlux Origin home": "Accueil InFlux Origin",
    "Project views": "Sections du projet",
    "Primary navigation": "Navigation principale",
    "CAD render of the InFlux Origin MK1 machine": "Rendu CAO de la machine InFlux Origin MK1",
    "Original hand-drawn InFlux injection molding system sketch": "Croquis original dessiné à la main du système de moulage par injection InFlux",
    "The first hand-drawn InFlux Origin MK1 logo on the cardboard prototype": "Premier logo InFlux Origin MK1 dessiné à la main sur le prototype en carton",
    "Early InFlux MK1 wireframe plan": "Première esquisse structurelle d’InFlux MK1",
    "InFlux Origin MK1 integrated machine render": "Rendu de la machine intégrée InFlux Origin MK1",
    "InFlux packaging and product development concept": "Concept d’emballage et de développement produit InFlux",
    "Preview of the InFlux Origin MK1 assembly": "Aperçu de l’assemblage InFlux Origin MK1",
    "Other project stages": "Autres étapes du projet",
    "InFlux Operator application screens": "Écrans de l’application InFlux Operator",
    "InFlux Operator dashboard screen": "Tableau de bord de l’application InFlux Operator",
    "InFlux Operator production and temperature controls": "Commandes de production et de température dans InFlux Operator",
    "InFlux Operator machine movement controls": "Commandes de déplacement de la machine dans InFlux Operator",
    "Annotated view of the Origin motherboard design": "Vue annotée de la conception de la carte mère Origin",
    "Landscape view of the InFlux Origin motherboard PCB layout": "Vue d’ensemble du routage PCB de la carte mère InFlux Origin",
    "Annotated thermal testing results": "Résultats annotés des essais thermiques",
    "Thermal camera image captured during InFlux testing": "Image capturée par caméra thermique pendant les essais InFlux",
    "Thermal testing equipment used on the InFlux machine": "Équipement utilisé pour les essais thermiques de la machine InFlux",
    "Stefan Tonegari at a Volta Circuits event": "Stefan Tonegari lors d’un événement Volta Circuits",
    "Pintilei David at a Volta Circuits event": "Pintilei David lors d’un événement Volta Circuits",
    "Lavinia Ichim portrait not yet published": "Portrait de Lavinia Ichim non encore publié",
    "Ciprian Ursu portrait not yet published": "Portrait de Ciprian Ursu non encore publié",
    "Apply to join InFlux using Google Forms (opens in a new tab)": "Postuler pour rejoindre InFlux via Google Forms (s’ouvre dans un nouvel onglet)",
    "Current InFlux sponsors": "Sponsors actuels d’InFlux",
    "Volta Circuits team uniform render showing sponsor placement areas": "Rendu de la tenue de l’équipe Volta Circuits illustrant les emplacements réservés aux sponsors",
    "First successfully injected InFlux part": "Première pièce InFlux injectée avec succès",
    "InFlux thermal testing in the laboratory": "Essais thermiques d’InFlux en laboratoire",
    "Landscape view of the InFlux dedicated motherboard design": "Vue d’ensemble de la carte mère dédiée d’InFlux",
    "Box containing 56 parts injected by InFlux Origin MK1": "Boîte contenant 56 pièces injectées par InFlux Origin MK1",
    "Mold life validation": "Validation de la durée de vie du moule",
    "Continuous running validation": "Validation du fonctionnement continu",
    "Production readiness validation": "Validation de la préparation à la production",
    "Process calibration validation": "Validation du réglage du procédé",
    "Interactive 3D assembly of InFlux Origin MK1": "Assemblage 3D interactif d’InFlux Origin MK1"
});

  const TRANSLATIONS = Object.freeze({
    ro: RO,
    fr: FR
  });
  const FRENCH_READY = Object.keys(FR).length === Object.keys(RO).length &&
    Object.keys(RO).every((key) => typeof FR[key] === "string" && FR[key].trim());
  const SUPPORTED_LANGUAGES = new Set(["en", "ro", ...(FRENCH_READY ? ["fr"] : [])]);
  const LANGUAGE_STATUS = Object.freeze({
    en: "English is active.",
    ro: "Limba română este activă.",
    fr: "Le français est actif."
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
  let meltHeaderCanvas;
  let meltHeaderContext;
  let meltProjectIndexCanvas;
  let meltProjectIndexContext;
  let meltDpr = 1;
  const CONTINUOUS_MELT_DURATION = 1320;
  const CONTINUOUS_MELT_WAVE_DURATION = 360;

  function usesParticleMeltPreview() {
    const parameters = new URLSearchParams(window.location.search);
    return parameters.get("beta-preview") === "1" &&
      parameters.get("beta-transition") === "particle-wipe";
  }

  function normalize(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function readStoredLanguage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED_LANGUAGES.has(stored)) return stored;
      if (stored) localStorage.removeItem(STORAGE_KEY);
      return memoryLanguage;
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
    if (!meltCanvas) {
      meltCanvas = document.createElement("canvas");
      meltCanvas.className = "language-melt-canvas";
      meltCanvas.setAttribute("aria-hidden", "true");
      (document.querySelector("main") || document.body).appendChild(meltCanvas);
      meltContext = meltCanvas.getContext("2d");
    }
    if (!meltHeaderCanvas) {
      meltHeaderCanvas = document.createElement("canvas");
      meltHeaderCanvas.className = "language-melt-canvas language-melt-canvas--header";
      meltHeaderCanvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(meltHeaderCanvas);
      meltHeaderContext = meltHeaderCanvas.getContext("2d");
    }
    if (!meltProjectIndexCanvas) {
      meltProjectIndexCanvas = document.createElement("canvas");
      meltProjectIndexCanvas.className = "language-melt-canvas language-melt-canvas--project-index";
      meltProjectIndexCanvas.setAttribute("aria-hidden", "true");
      (document.querySelector("main") || document.body).appendChild(meltProjectIndexCanvas);
      meltProjectIndexContext = meltProjectIndexCanvas.getContext("2d");
    }
    return meltCanvas;
  }

  function resizeMeltCanvas() {
    ensureMeltCanvas();
    meltDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    [meltCanvas, meltHeaderCanvas, meltProjectIndexCanvas].forEach((canvas) => {
      canvas.width = Math.round(window.innerWidth * meltDpr);
      canvas.height = Math.round(window.innerHeight * meltDpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    });
    meltContext.setTransform(meltDpr, 0, 0, meltDpr, 0, 0);
    meltHeaderContext.setTransform(meltDpr, 0, 0, meltDpr, 0, 0);
    meltProjectIndexContext.setTransform(meltDpr, 0, 0, meltDpr, 0, 0);
  }

  function parseMeltColor(value) {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    const context = probe.getContext("2d", { willReadFrequently: true });
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "#f4f1ed";
    context.fillStyle = String(value || "#f4f1ed");
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, alpha] = context.getImageData(0, 0, 1, 1).data;
    return {
      r,
      g,
      b,
      a: alpha / 255
    };
  }

  function transformedMeltText(text, style) {
    const locale = document.documentElement.lang || undefined;
    if (style.textTransform === "uppercase") return text.toLocaleUpperCase(locale);
    if (style.textTransform === "lowercase") return text.toLocaleLowerCase(locale);
    if (style.textTransform === "capitalize") {
      return text.replace(/(^|[\s-])(\p{L})/gu, (match, prefix, letter) =>
        `${prefix}${letter.toLocaleUpperCase(locale)}`
      );
    }
    return text;
  }

  function effectiveMeltOpacity(element) {
    let opacity = 1;
    let current = element;
    while (current && current !== document.documentElement) {
      const value = Number.parseFloat(getComputedStyle(current).opacity);
      if (Number.isFinite(value)) opacity *= value;
      current = current.parentElement;
    }
    return Math.max(0, Math.min(1, opacity));
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

  function renderMeltTextBuffer(element, preserveColor = false) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const textNodes = [...element.childNodes].filter((node) =>
      node.nodeType === Node.TEXT_NODE && normalize(node.nodeValue)
    );
    if (!textNodes.length) return null;
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
    context.font = `${style.fontStyle || "normal"} ${style.fontVariantCaps || "normal"} ${style.fontWeight || 400} ${fontSize}px ${style.fontFamily || "sans-serif"}`;
    context.textBaseline = "alphabetic";
    const textFill = style.webkitTextFillColor;
    context.fillStyle = preserveColor && textFill && textFill !== "rgba(0, 0, 0, 0)"
      ? textFill
      : preserveColor ? style.color : "#fff";
    context.globalAlpha = preserveColor ? effectiveMeltOpacity(element) : 1;

    textNodes.forEach((node) => {
      const rawText = String(node.nodeValue || "");
      const firstCharacter = rawText.search(/\S/);
      const lastCharacter = rawText.search(/\s*$/);
      if (firstCharacter < 0 || lastCharacter <= firstCharacter) return;
      const text = transformedMeltText(
        normalize(rawText.slice(firstCharacter, lastCharacter)),
        style
      );
      const range = document.createRange();
      range.setStart(node, firstCharacter);
      range.setEnd(node, lastCharacter);
      const lineRects = [...range.getClientRects()].filter((lineRect) =>
        lineRect.width > 1 && lineRect.height > 1
      );
      range.detach?.();

      if (!lineRects.length) return;
      const words = text.split(/\s+/);
      let wordIndex = 0;
      lineRects.forEach((lineRect) => {
        let line = "";
        while (wordIndex < words.length) {
          const trial = line ? `${line} ${words[wordIndex]}` : words[wordIndex];
          if (line && measureSpacedText(context, trial, letterSpacing) > lineRect.width + 1) break;
          line = trial;
          wordIndex += 1;
        }
        if (!line && wordIndex < words.length) {
          line = words[wordIndex];
          wordIndex += 1;
        }
        if (!line) return;
        const x = lineRect.left - rect.left;
        const y = lineRect.top - rect.top + (lineRect.height - fontSize) / 2 + fontSize;
        fillSpacedText(context, line, x, y, letterSpacing);
      });
    });

    return { buffer, rect, renderDpr, fontSize };
  }

  function configureMeltTextContext(context, style, preserveColor, element, renderDpr) {
    const fontSize = Number.parseFloat(style.fontSize) || 16;
    context.scale(renderDpr, renderDpr);
    context.font = `${style.fontStyle || "normal"} ${style.fontVariantCaps || "normal"} ${style.fontWeight || 400} ${fontSize}px ${style.fontFamily || "sans-serif"}`;
    context.textBaseline = "alphabetic";
    const textFill = style.webkitTextFillColor;
    context.fillStyle = preserveColor && textFill && textFill !== "rgba(0, 0, 0, 0)"
      ? textFill
      : preserveColor ? style.color : "#fff";
    context.globalAlpha = preserveColor ? effectiveMeltOpacity(element) : 1;
    return fontSize;
  }

  function renderContinuousMeltTextLines(element) {
    const style = getComputedStyle(element);
    const renderDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const textNodes = [...element.childNodes].filter((node) =>
      node.nodeType === Node.TEXT_NODE && normalize(node.nodeValue)
    );
    const rasters = [];

    textNodes.forEach((node) => {
      const rawText = String(node.nodeValue || "");
      const firstCharacter = rawText.search(/\S/);
      const lastCharacter = rawText.search(/\s*$/);
      if (firstCharacter < 0 || lastCharacter <= firstCharacter) return;

      const renderedText = transformedMeltText(
        rawText.slice(firstCharacter, lastCharacter),
        style
      );
      const range = document.createRange();
      const lines = [];

      for (let offset = firstCharacter; offset < lastCharacter; offset += 1) {
        const sourceCharacter = rawText[offset];
        if (/\s/.test(sourceCharacter)) continue;
        range.setStart(node, offset);
        range.setEnd(node, offset + 1);
        const characterRect = [...range.getClientRects()].find((rect) =>
          rect.width > .1 && rect.height > 1
        );
        if (!characterRect) continue;

        let line = lines.find((candidate) =>
          Math.abs(candidate.top - characterRect.top) < 2
        );
        if (!line) {
          line = {
            top: characterRect.top,
            left: characterRect.left,
            right: characterRect.right,
            bottom: characterRect.bottom,
            characters: []
          };
          lines.push(line);
        }
        line.left = Math.min(line.left, characterRect.left);
        line.right = Math.max(line.right, characterRect.right);
        line.top = Math.min(line.top, characterRect.top);
        line.bottom = Math.max(line.bottom, characterRect.bottom);
        line.characters.push({
          value: renderedText[offset - firstCharacter] || sourceCharacter,
          rect: characterRect
        });
      }
      range.detach?.();

      lines.forEach((line) => {
        const padding = 1;
        const rect = {
          left: line.left - padding,
          top: line.top - padding,
          right: line.right + padding,
          bottom: line.bottom + padding,
          width: line.right - line.left + padding * 2,
          height: line.bottom - line.top + padding * 2
        };
        const buffer = document.createElement("canvas");
        buffer.width = Math.max(1, Math.ceil(rect.width * renderDpr));
        buffer.height = Math.max(1, Math.ceil(rect.height * renderDpr));
        const context = buffer.getContext("2d", { willReadFrequently: true });
        const fontSize = configureMeltTextContext(
          context,
          style,
          true,
          element,
          renderDpr
        );

        line.characters.forEach((character) => {
          const x = character.rect.left - rect.left;
          const y = character.rect.top - rect.top +
            (character.rect.height - fontSize) / 2 + fontSize;
          context.fillText(character.value, x, y);
        });
        rasters.push({ buffer, rect, renderDpr, fontSize });
      });
    });

    return rasters;
  }

  function sampleMeltText(element) {
    const rendered = renderMeltTextBuffer(element);
    if (!rendered) return [];
    const { buffer, rect, renderDpr, fontSize } = rendered;
    const context = buffer.getContext("2d", { willReadFrequently: true });
    const image = context.getImageData(0, 0, buffer.width, buffer.height);
    const gapCss = Math.min(7.6, Math.max(3.2, fontSize / 8.2));
    const gap = Math.max(3, Math.round(gapCss * renderDpr));
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
      const budget = fontSize > 64 ? 2600 : fontSize > 28 ? 1500 : 700;
      const stride = Math.max(1, Math.ceil(points.length / budget));
      const textFill = style.webkitTextFillColor;
      const color = parseMeltColor(textFill && textFill !== "rgba(0, 0, 0, 0)" ? textFill : style.color);
      const effectiveOpacity = effectiveMeltOpacity(element);
      for (let index = 0; index < points.length; index += stride) {
        const point = points[index];
        const yNorm = Math.max(0, Math.min(1, (point.y - rect.top) / Math.max(1, rect.height)));
        particles.push({
          x: point.x,
          y: point.y,
          radius: 1.05 + Math.random() * 1.45,
          drift: (Math.random() - .5) * 28,
          delay: (1 - yNorm) * .06 + Math.random() * .025,
          seed: Math.random() * Math.PI * 2,
          color,
          alpha: color.a * effectiveOpacity
        });
      }
    });
    return particles;
  }

  function updateMeltWipe(elements, wipeX) {
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const hiddenWidth = Math.max(0, Math.min(rect.width, wipeX - rect.left));
      element.style.clipPath = `inset(0 0 0 ${hiddenWidth}px)`;
      if (wipeX >= rect.right - .5) {
        element.style.visibility = "hidden";
      } else {
        element.style.removeProperty("visibility");
      }
    });
  }

  function drawMeltFrame(particles, elapsed) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wipeDuration = 360;
    meltContext.setTransform(meltDpr, 0, 0, meltDpr, 0, 0);
    meltContext.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      const activation = Math.max(0, Math.min(1, particle.x / Math.max(1, width))) * wipeDuration;
      if (elapsed < activation) return;
      const fallStart = activation + 100;
      const fallDuration = Math.max(1, 1080 - fallStart);
      const delayedElapsed = elapsed - fallStart - particle.delay * fallDuration;
      const local = Math.max(0, Math.min(1, delayedElapsed / Math.max(1, fallDuration * (1 - particle.delay))));
      const fall = local ** 4;
      const x = particle.x + particle.drift * fall + Math.sin(particle.seed + fall * 8) * 1.2;
      const y = particle.y + height * 1.28 * fall;
      const stretch = 1 + fall * 6;
      const rx = particle.radius / Math.sqrt(stretch);
      const ry = particle.radius * stretch;
      const fade = local > .9 ? 1 - (local - .9) / .1 : 1;
      meltContext.beginPath();
      meltContext.fillStyle = `rgba(${particle.color.r},${particle.color.g},${particle.color.b},${particle.alpha * Math.max(0, fade)})`;
      meltContext.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      meltContext.fill();
    });
  }

  function captureContinuousMeltText(elements) {
    return elements.flatMap((element, elementIndex) =>
      renderContinuousMeltTextLines(element).map((rendered, lineIndex) => ({
        element,
        ...rendered,
        seed: elementIndex * 1.618 + lineIndex * .73 + rendered.rect.left * .013
      }))
    );
  }

  function isVisibleMeltTarget(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 2 && rect.height > 2 &&
      rect.bottom > 0 && rect.top < window.innerHeight &&
      rect.right > 0 && rect.left < window.innerWidth &&
      style.display !== "none" && style.visibility !== "hidden" &&
      Number.parseFloat(style.opacity || "1") > 0;
  }

  function createMeltBuffer(rect) {
    const renderDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const buffer = document.createElement("canvas");
    buffer.width = Math.max(1, Math.ceil(rect.width * renderDpr));
    buffer.height = Math.max(1, Math.ceil(rect.height * renderDpr));
    const context = buffer.getContext("2d", { willReadFrequently: true });
    context.scale(renderDpr, renderDpr);
    return { buffer, context, renderDpr };
  }

  function roundedMeltRectangle(context, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }

  function captureContactMeltDecoration(element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const before = getComputedStyle(element, "::before");
    const after = getComputedStyle(element, "::after");
    const { buffer, context, renderDpr } = createMeltBuffer(rect);
    const radius = Number.parseFloat(style.borderRadius) || 0;

    context.globalAlpha = effectiveMeltOpacity(element);
    context.fillStyle = style.backgroundColor;
    roundedMeltRectangle(context, 0, 0, rect.width, rect.height, radius);
    context.fill();

    if (element.id === "tab-contact") {
      const envelopeWidth = Number.parseFloat(before.width) || 19;
      const envelopeHeight = Number.parseFloat(before.height) || 15;
      const envelopeX = Number.parseFloat(style.paddingLeft) || 0;
      const envelopeY = (rect.height - envelopeHeight) / 2;
      context.strokeStyle = before.color || style.color;
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      roundedMeltRectangle(
        context,
        envelopeX + envelopeWidth * .068,
        envelopeY + envelopeHeight * .094,
        envelopeWidth * .864,
        envelopeHeight * .812,
        1
      );
      context.stroke();
      context.beginPath();
      context.moveTo(envelopeX + envelopeWidth * .09, envelopeY + envelopeHeight * .19);
      context.lineTo(envelopeX + envelopeWidth * .5, envelopeY + envelopeHeight * .59);
      context.lineTo(envelopeX + envelopeWidth * .91, envelopeY + envelopeHeight * .19);
      context.stroke();

      const arrowWidth = Number.parseFloat(after.width) || 14;
      const arrowHeight = Number.parseFloat(after.height) || 18;
      const arrowRight = Number.parseFloat(after.right) || 13;
      const arrowX = rect.width - arrowRight - arrowWidth;
      const arrowY = (rect.height - arrowHeight) / 2;
      context.strokeStyle = after.color || style.color;
      context.lineWidth = 3;
      context.lineCap = "square";
      context.lineJoin = "miter";
      context.beginPath();
      context.moveTo(arrowX + arrowWidth * .214, arrowY + arrowHeight * .111);
      context.lineTo(arrowX + arrowWidth * .714, arrowY + arrowHeight * .5);
      context.lineTo(arrowX + arrowWidth * .214, arrowY + arrowHeight * .889);
      context.stroke();
    }

    return {
      buffer,
      rect,
      renderDpr,
      fontSize: 40,
      fadeStart: .70,
      fadeLength: .25
    };
  }

  function captureUnderlineMeltDecoration(element) {
    const elementRect = element.getBoundingClientRect();
    const pseudo = getComputedStyle(element, "::after");
    const left = Number.parseFloat(pseudo.left) || 0;
    const right = Number.parseFloat(pseudo.right) || 0;
    const bottom = Number.parseFloat(pseudo.bottom) || 0;
    const height = Number.parseFloat(pseudo.height) || 0;
    const width = Math.max(0, elementRect.width - left - right);
    if (width <= 1 || height <= 0) return null;
    const rect = {
      left: elementRect.left + left,
      top: elementRect.bottom - bottom - height,
      right: elementRect.left + left + width,
      bottom: elementRect.bottom - bottom,
      width,
      height
    };
    const { buffer, context, renderDpr } = createMeltBuffer(rect);
    context.globalAlpha = effectiveMeltOpacity(element) *
      Math.max(0, Math.min(1, Number.parseFloat(pseudo.opacity || "1")));
    context.fillStyle = pseudo.backgroundColor;
    context.fillRect(0, 0, width, height);
    return {
      buffer,
      rect,
      renderDpr,
      fontSize: 16,
      fadeStart: .58,
      fadeLength: .30
    };
  }

  function collectContinuousMeltDecorations() {
    const decorations = [];
    document.querySelectorAll("#tab-contact, .technical-page .header-action")
      .forEach((element) => {
        if (isVisibleMeltTarget(element)) {
          decorations.push({ element, type: "contact" });
        }
      });
    document.querySelectorAll(".primary-nav button.is-active:not(#tab-contact)")
      .forEach((element) => {
        if (isVisibleMeltTarget(element)) {
          decorations.push({ element, type: "underline" });
        }
      });
    return decorations;
  }

  function captureContinuousMeltDecorations(decorations) {
    return decorations.map((decoration, index) => {
      const rendered = decoration.type === "contact"
        ? captureContactMeltDecoration(decoration.element)
        : captureUnderlineMeltDecoration(decoration.element);
      return rendered ? {
        ...rendered,
        element: decoration.element,
        seed: 1000 + index * 1.618 + rendered.rect.left * .013
      } : null;
    }).filter(Boolean);
  }

  function setMeltDecorationsHidden(decorations, hidden) {
    decorations.forEach(({ element, type }) => {
      element.classList.toggle(
        type === "contact" ? "language-melt-contact" : "language-melt-underline",
        hidden
      );
    });
  }

  function drawContinuousMeltLayer(context, rasters, elapsed) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const sliceWidth = 5;
    context.setTransform(meltDpr, 0, 0, meltDpr, 0, 0);
    context.clearRect(0, 0, width, height);

    rasters.forEach(({
      buffer,
      rect,
      renderDpr,
      fontSize,
      seed,
      fadeStart: rasterFadeStart,
      fadeLength: rasterFadeLength
    }) => {
      const localWaveDuration = Math.min(90, CONTINUOUS_MELT_WAVE_DURATION * .25);
      const elementWaveDuration = CONTINUOUS_MELT_WAVE_DURATION - localWaveDuration;
      const elementActivation = Math.max(
        0,
        Math.min(1, rect.left / Math.max(1, width))
      ) * elementWaveDuration;

      for (let sliceX = 0; sliceX < rect.width; sliceX += sliceWidth) {
        const absoluteX = rect.left + sliceX;
        const activation = elementActivation +
          Math.max(0, Math.min(1, sliceX / Math.max(1, rect.width))) * localWaveDuration;
        if (elapsed < activation) {
          const sourceX = Math.round(sliceX * renderDpr);
          const sourceWidth = Math.min(
            buffer.width - sourceX,
            Math.ceil(sliceWidth * renderDpr)
          );
          if (sourceWidth <= 0) continue;
          context.globalAlpha = 1;
          context.drawImage(
            buffer,
            sourceX,
            0,
            sourceWidth,
            buffer.height,
            rect.left + sliceX,
            rect.top,
            sourceWidth / renderDpr + .65,
            rect.height
          );
          continue;
        }

        const local = Math.max(0, Math.min(
          1,
          (elapsed - activation) / CONTINUOUS_MELT_DURATION
        ));
        const accelerated = local * local * (.58 + .42 * local);
        const ripple = Math.sin(absoluteX * .045 + seed);
        const drop = height * 1.28 * accelerated * (.97 + ripple * .03);
        const stretch = 1 + accelerated * (6.2 + ripple * .45);
        const drift = Math.sin(absoluteX * .025 + seed + local * 3) *
          2.4 * local * local;
        const fadeStart = Number.isFinite(rasterFadeStart)
          ? rasterFadeStart
          : fontSize < 18 ? .54 : fontSize < 32 ? .64 : .76;
        const fadeLength = Number.isFinite(rasterFadeLength)
          ? rasterFadeLength
          : fontSize < 18 ? .28 : fontSize < 32 ? .30 : .24;
        const fadeProgress = Math.max(0, Math.min(1, (local - fadeStart) / fadeLength));
        const fade = 1 - fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
        const sourceX = Math.round(sliceX * renderDpr);
        const sourceWidth = Math.min(
          buffer.width - sourceX,
          Math.ceil(sliceWidth * renderDpr)
        );
        if (sourceWidth <= 0 || fade <= 0) continue;

        context.globalAlpha = fade;
        context.drawImage(
          buffer,
          sourceX,
          0,
          sourceWidth,
          buffer.height,
          rect.left + sliceX + drift,
          rect.top + drop,
          sourceWidth / renderDpr + .65,
          rect.height * stretch
        );
      }
    });
    context.globalAlpha = 1;
  }

  function drawContinuousMeltFrame(rasters, elapsed) {
    const headerRasters = rasters.filter(({ element }) =>
      element.closest(".site-header")
    );
    const projectIndexRasters = rasters.filter(({ element }) =>
      element.closest(".project-index")
    );
    const contentRasters = rasters.filter(({ element }) =>
      !element.closest(".site-header, .project-index")
    );
    drawContinuousMeltLayer(meltContext, contentRasters, elapsed);
    drawContinuousMeltLayer(meltHeaderContext, headerRasters, elapsed);
    drawContinuousMeltLayer(meltProjectIndexContext, projectIndexRasters, elapsed);
  }

  function collectMeltElements({ includeProjectIndex = true } = {}) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (normalize(node.nodeValue) &&
        parent &&
        !parent.closest("[data-no-i18n], script, style, svg, canvas, code, pre, textarea, option, .visually-hidden") &&
        !parent.closest(".recruitment-apply b") &&
        (includeProjectIndex || !parent.closest(".project-index"))) {
        const style = getComputedStyle(parent);
        const rawText = String(node.nodeValue || "");
        const firstCharacter = rawText.search(/\S/);
        const lastCharacter = rawText.search(/\s*$/);
        if (firstCharacter >= 0 && lastCharacter > firstCharacter &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          Number.parseFloat(style.opacity || "1") > 0) {
          const range = document.createRange();
          range.setStart(node, firstCharacter);
          range.setEnd(node, lastCharacter);
          const visible = [...range.getClientRects()].some((rect) =>
            rect.width > 2 &&
            rect.height > 2 &&
            rect.bottom > 0 &&
            rect.top < window.innerHeight &&
            rect.right > 0 &&
            rect.left < window.innerWidth
          );
          range.detach?.();
          if (visible) textNodes.push(node);
        }
      }
      node = walker.nextNode();
    }

    return textNodes.map((textNode) => {
      const parent = textNode.parentElement;
      if (parent?.classList.contains("language-melt-run")) return parent;
      const run = document.createElement("language-melt-run");
      run.className = "language-melt-run";
      run.dataset.languageMeltRun = "";
      textNode.parentNode.insertBefore(run, textNode);
      run.appendChild(textNode);
      return run;
    });
  }

  function unwrapProjectIndexMeltRuns(elements) {
    elements.forEach((element) => {
      if (!element.isConnected ||
        !element.classList.contains("language-melt-run") ||
        !element.closest(".project-index")) return;
      element.replaceWith(...element.childNodes);
    });
  }

  function triggerLanguagePop(elements, decorations = []) {
    const visible = elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return element.isConnected &&
        !element.closest(".project-index") &&
        rect.width > 0 && rect.height > 0;
    });
    if (!visible.length) return;

    const minimumX = Math.min(...visible.map((element) => element.getBoundingClientRect().left));
    const maximumX = Math.max(...visible.map((element) => element.getBoundingClientRect().right));
    const span = Math.max(1, maximumX - minimumX);
    const popHosts = [...new Set(visible.map((element) => {
      let host = element.parentElement;
      while (host && host !== document.body) {
        const display = getComputedStyle(host).display;
        if (display !== "inline" && display !== "contents") {
          return host.matches(".recruitment-apply b") ? null : host;
        }
        host = host.parentElement;
      }
      return element;
    }).filter(Boolean))];

    visible.forEach((element) => {
      const factor = (element.getBoundingClientRect().left - minimumX) / span;
      element.style.setProperty("--language-pop-delay", `${Math.round(factor * 230)}ms`);
      element.classList.add("language-pop-text");
    });
    popHosts.forEach((element) => {
      const factor = (element.getBoundingClientRect().left - minimumX) / span;
      element.style.setProperty("--language-host-pop-delay", `${Math.round(factor * 230)}ms`);
      element.classList.add("language-pop-host");
    });
    decorations.forEach(({ element, type }) => {
      const factor = (element.getBoundingClientRect().left - minimumX) / span;
      element.style.setProperty("--language-decoration-pop-delay", `${Math.round(factor * 230)}ms`);
      element.classList.add(
        type === "contact" ? "language-pop-contact" : "language-pop-underline"
      );
    });
    document.documentElement.classList.add("is-language-popping");

    window.setTimeout(() => {
      document.documentElement.classList.remove("is-language-popping");
      visible.forEach((element) => {
        element.classList.remove("language-pop-text");
        element.style.removeProperty("--language-pop-delay");
      });
      popHosts.forEach((element) => {
        element.classList.remove("language-pop-host");
        element.style.removeProperty("--language-host-pop-delay");
      });
      decorations.forEach(({ element }) => {
        element.classList.remove("language-pop-contact", "language-pop-underline");
        element.style.removeProperty("--language-decoration-pop-delay");
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

  async function runContinuousMeltTransition(language, elements) {
    const animatedElements = elements;
    resizeMeltCanvas();
    const decorations = collectContinuousMeltDecorations();
    const rasters = [
      ...captureContinuousMeltDecorations(decorations),
      ...captureContinuousMeltText(animatedElements)
    ];
    if (!rasters.length) {
      applyLanguage(language);
      return;
    }

    languageTransitionActive = true;
    document.documentElement.classList.add("is-language-transitioning", "is-language-melting");
    drawContinuousMeltFrame(rasters, 0);
    meltCanvas.classList.add("is-active");
    meltHeaderCanvas.classList.add("is-active");
    meltProjectIndexCanvas.classList.add("is-active");
    animatedElements.forEach((element) => element.classList.add("language-melt-text"));
    setMeltDecorationsHidden(decorations, true);
    document.querySelectorAll(".language-toggle").forEach((toggle) => toggle.setAttribute("aria-disabled", "true"));

    try {
      const start = performance.now();
      await new Promise((resolve) => {
        const frame = (now) => {
          const elapsed = now - start;
          drawContinuousMeltFrame(rasters, elapsed);
          if (elapsed < CONTINUOUS_MELT_DURATION + CONTINUOUS_MELT_WAVE_DURATION) {
            requestAnimationFrame(frame);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(frame);
      });
      applyLanguage(language);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      animatedElements.forEach((element) => {
        element.classList.remove("language-melt-text");
        element.style.removeProperty("clip-path");
        element.style.removeProperty("visibility");
      });
      setMeltDecorationsHidden(decorations, false);
      unwrapProjectIndexMeltRuns(animatedElements);
      meltContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltHeaderContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltProjectIndexContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltCanvas.classList.remove("is-active");
      meltHeaderCanvas.classList.remove("is-active");
      meltProjectIndexCanvas.classList.remove("is-active");
      triggerLanguagePop(animatedElements.filter((element) => element.isConnected), decorations);
    } finally {
      animatedElements.forEach((element) => {
        element.classList.remove("language-melt-text");
        element.style.removeProperty("clip-path");
        element.style.removeProperty("visibility");
      });
      setMeltDecorationsHidden(decorations, false);
      unwrapProjectIndexMeltRuns(animatedElements);
      meltContext?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltHeaderContext?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltProjectIndexContext?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltCanvas?.classList.remove("is-active");
      meltHeaderCanvas?.classList.remove("is-active");
      meltProjectIndexCanvas?.classList.remove("is-active");
      document.documentElement.classList.remove("is-language-melting", "is-language-transitioning");
      document.querySelectorAll(".language-toggle").forEach((toggle) => toggle.removeAttribute("aria-disabled"));
      languageTransitionActive = false;
    }
  }

  async function requestLanguage(language) {
    if (!SUPPORTED_LANGUAGES.has(language) || language === currentLanguage || languageTransitionActive) return;
    previewLanguageToggle(language);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyLanguage(language);
      return;
    }

    const particlePreview = usesParticleMeltPreview();
    const elements = collectMeltElements({ includeProjectIndex: !particlePreview });
    if (!particlePreview) {
      await runContinuousMeltTransition(language, elements);
      return;
    }

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
          const wipeProgress = Math.max(0, Math.min(1, elapsed / 360));
          const easedWipe = wipeProgress * wipeProgress * (3 - 2 * wipeProgress);
          updateMeltWipe(elements, window.innerWidth * easedWipe);
          drawMeltFrame(particles, elapsed);
          if (elapsed < 1080) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
      elements.forEach((element) => {
        element.style.clipPath = "inset(0 0 0 100%)";
      });
      applyLanguage(language);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      elements.forEach((element) => {
        element.classList.remove("language-melt-source");
        element.style.removeProperty("clip-path");
        element.style.removeProperty("visibility");
      });
      meltContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltCanvas.classList.remove("is-active");
      triggerLanguagePop(elements);
    } finally {
      elements.forEach((element) => {
        element.classList.remove("language-melt-source");
        element.style.removeProperty("clip-path");
        element.style.removeProperty("visibility");
      });
      meltContext?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      meltCanvas?.classList.remove("is-active");
      document.documentElement.classList.remove("is-language-melting", "is-language-transitioning");
      document.querySelectorAll(".language-toggle").forEach((toggle) => toggle.removeAttribute("aria-disabled"));
      languageTransitionActive = false;
    }
  }

  function translatedValue(source, language) {
    const dictionary = TRANSLATIONS[language];
    return dictionary?.[normalize(source)] || source;
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
    const translated = TRANSLATIONS[language]?.[sourceKey];
    const next = translated
      ? `${leading}${translated}${trailing}`
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
    document.documentElement.classList.remove("i18n-language-pending", "i18n-ro-pending");
    if (persist) storeLanguage(nextLanguage);

    if (announce) {
      const status = document.querySelector("[data-language-status]");
      if (status) status.textContent = LANGUAGE_STATUS[nextLanguage];
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
    toggle.setAttribute("aria-label", FRENCH_READY ? "Language / Limbă / Langue" : "Language / Limbă");
    toggle.setAttribute("data-no-i18n", "");
    const frenchButton = FRENCH_READY ? `
      <button type="button" data-language="fr" aria-label="French / Français" aria-pressed="false" draggable="false">
        <span class="language-toggle__ring" aria-hidden="true">
          <span class="language-toggle__flag">
            <svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">
              <rect width="34" height="100" fill="#0055A4"/>
              <rect x="33" width="34" height="100" fill="#FFFFFF"/>
              <rect x="66" width="34" height="100" fill="#EF4135"/>
            </svg>
          </span>
        </span>
      </button>` : "";
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
      ${frenchButton}
      <span class="visually-hidden" aria-live="polite" data-language-status></span>`;
    identity.appendChild(toggle);
    toggle.style.setProperty("--language-count", String(toggle.querySelectorAll("[data-language]").length));

    bindLanguageSlider(toggle);

    toggle.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const buttons = [...toggle.querySelectorAll("[data-language]")];
      const currentIndex = Math.max(0, buttons.findIndex((button) =>
        button.dataset.language === currentLanguage
      ));
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
      const language = buttons[nextIndex].dataset.language;
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
    memoryLanguage = SUPPORTED_LANGUAGES.has(document.documentElement.lang)
      ? document.documentElement.lang
      : "en";
    applyLanguage(readStoredLanguage(), { persist: false, announce: false });
    observeDynamicContent();
  }

  window.InFluxI18n = Object.freeze({
    setLanguage: (language) => applyLanguage(language),
    getLanguage: () => currentLanguage,
    getAvailableLanguages: () => [...SUPPORTED_LANGUAGES],
    isFrenchReady: () => FRENCH_READY,
    refresh: scheduleRefresh,
    translateValue: (value) => translatedValue(value, currentLanguage)
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
