(() => {
  "use strict";
  if (document.querySelector("[data-panel='achievements']")) return;

  const T = (en, ro, fr) => ({ en, ro, fr });
  const labels = {
    nav: T("Achievements", "Rezultate", "Palmarès"),
    first: T("1st place", "Locul I", "1re place"),
    second: T("2nd place", "Locul II", "2e place"),
    third: T("3rd place", "Locul III", "3e place"),
    county: T("County stage", "Etapa județeană", "Étape départementale"),
    national: T("National stage", "Etapa națională", "Étape nationale"),
    final: T("Final stage", "Etapa finală", "Étape finale"),
    international: T("International", "Internațional", "International"),
    unknown: T("Stage not stated", "Etapă neprecizată", "Niveau non précisé"),
    participation: T("Participation", "Participare", "Participation"),
    organizer: T("Organizer", "Organizator", "Organisateur"),
    qualified: T("Qualified", "Calificare", "Qualification"),
    major: T("Major", "Major", "Majeur"),
    notable: T("Notable", "Notabil", "Notable"),
    supporting: T("Supporting", "Complementar", "Complémentaire"),
    pinnacle: T("Pinnacle", "Vârf", "Sommet")
  };

  const result = (kind, text, stage, stageKind = "") => ({ kind, text, stage, stageKind });
  const achievements = [
    {
      year: 2026, weight: "pinnacle", rank: 1,
      title: "DaVinci Technical Innovation Contest",
      results: [result("gold", labels.first, labels.final, "final")],
      description: T("First place at the final stage of the technical innovation competition.", "Locul I la etapa finală a concursului de inovație tehnică.", "Première place à l'étape finale du concours d'innovation technique.")
    },
    {
      year: 2026, weight: "pinnacle", rank: 2,
      title: "Romanian Science and Engineering Fair",
      results: [result("silver", labels.second, labels.national, "national")],
      description: T("Second place at the national stage.", "Locul al II-lea la etapa națională.", "Deuxième place à l'étape nationale.")
    },
    {
      year: 2026, weight: "major",
      title: T("National Scientific Creativity Olympiad", "Olimpiada Națională de Creativitate Științifică", "Olympiade nationale de créativité scientifique"),
      results: [result("gold", labels.first, labels.county, "county"), result("participation", labels.participation, labels.national, "national")],
      description: T("County-stage win followed by participation at the national stage.", "Locul I la etapa județeană, urmat de participarea la etapa națională.", "Victoire à l'étape départementale, suivie d'une participation à l'étape nationale.")
    },
    {
      year: 2026, weight: "major",
      title: T("Student for a Day — Technical Creativity, Grade XI", "Student pentru o Zi — Creativitate Tehnică, clasa a XI-a", "Étudiant pour un jour — Créativité technique, classe de XIe"),
      results: [result("gold", labels.first, labels.unknown)],
      description: T("First place; the supplied record does not identify the competition stage.", "Locul I; informațiile furnizate nu precizează etapa competiției.", "Première place; les informations fournies ne précisent pas le niveau de la compétition.")
    },
    {
      year: 2026, weight: "major", title: "FRI 2026",
      results: [
        result("finalist", T("Alliance Captain", "Căpitan de alianță", "Capitaine d'alliance"), T("Playoffs", "Playoff", "Playoffs"), "final"),
        result("award", T("6th place", "Locul 6", "6e place"), T("Overall", "Clasament general", "Classement général"))
      ],
      description: T("Playoff Alliance Captain and sixth place overall.", "Căpitan de alianță în playoff și locul 6 în clasamentul general.", "Capitaine d'alliance en playoffs et sixième place au classement général.")
    },
    {
      year: 2026, weight: "notable", title: "Bolts and Speed",
      results: [result("silver", labels.second, labels.unknown)],
      description: T("Second place in Drag Racing.", "Locul al II-lea la proba de Drag Racing.", "Deuxième place en Drag Racing.")
    },
    {
      year: 2025, weight: "pinnacle", rank: 3, title: "MILSET Abu Dhabi",
      results: [result("award", T("Best Delegation Award", "Best Delegation Award", "Best Delegation Award"), labels.international, "international")],
      description: T("Best Delegation Award during international science and engineering representation in Abu Dhabi.", "Best Delegation Award în cadrul reprezentării internaționale de știință și inginerie din Abu Dhabi.", "Best Delegation Award lors de la représentation internationale en sciences et ingénierie à Abou Dhabi.")
    },
    {
      year: 2025, weight: "pinnacle", rank: 4, title: "Open Robotics Intelligent Grid",
      results: [
        result("finalist", T("Finalist Alliance", "Alianță finalistă", "Alliance finaliste"), labels.unknown),
        result("gold", T("1st Storyteller Award", "Locul I Storyteller Award", "1er prix Storyteller"), T("Judged award", "Premiu jurizat", "Prix du jury"))
      ],
      description: T("Finalist Alliance and first place in the Storyteller Award category.", "Alianță finalistă și locul I la categoria Storyteller Award.", "Alliance finaliste et première place dans la catégorie Storyteller Award.")
    },
    {
      year: 2025, weight: "pinnacle", rank: 5, title: "Romanian Science and Engineering Fair",
      results: [result("silver", labels.second, labels.national, "national")],
      description: T("Second place at the national stage.", "Locul al II-lea la etapa națională.", "Deuxième place à l'étape nationale.")
    },
    {
      year: 2025, weight: "major",
      title: T("National Scientific Creativity Olympiad", "Olimpiada Națională de Creativitate Științifică", "Olympiade nationale de créativité scientifique"),
      results: [result("gold", labels.first, labels.county, "county"), result("participation", labels.participation, labels.national, "national")],
      description: T("County-stage win followed by participation at the national stage.", "Locul I la etapa județeană, urmat de participarea la etapa națională.", "Victoire à l'étape départementale, suivie d'une participation à l'étape nationale.")
    },
    {
      year: 2025, weight: "supporting", title: "Meet FTC — Suceava League Meet",
      results: [result("organizer", labels.organizer, T("Official meet", "Meet oficial", "Rencontre officielle"))],
      description: T("Organizer role.", "Rol de organizator.", "Rôle d'organisateur.")
    },
    {
      year: 2024, weight: "major", title: "FIRST Tech Challenge",
      results: [result("qualified", labels.qualified, labels.national, "national")],
      description: T("Qualified for the national stage.", "Calificare la etapa națională.", "Qualification pour l'étape nationale.")
    },
    {
      year: 2024, weight: "notable", title: "Open Robotics Intelligent Grid",
      results: [result("bronze", labels.third, labels.unknown)],
      description: T("Third place; the supplied record does not identify the competition stage.", "Locul al III-lea; informațiile furnizate nu precizează etapa competiției.", "Troisième place; les informations fournies ne précisent pas le niveau de la compétition.")
    },
    {
      year: 2024, weight: "notable", title: "CanSat",
      results: [result("award", T("Award recipient", "Premiant", "Lauréat"), labels.unknown)],
      description: T("The exact award name and stage have not yet been confirmed in the supplied record.", "Denumirea exactă a premiului și etapa nu au fost încă confirmate în informațiile furnizate.", "Le nom exact du prix et le niveau n'ont pas encore été confirmés dans les informations fournies.")
    },
    {
      year: 2024, weight: "supporting", title: "Belt and Road Teenager Maker Camp and Teacher Workshop — China",
      results: [result("participation", labels.participation, labels.international, "international")],
      description: T("International participation.", "Participare internațională.", "Participation internationale.")
    },
    {
      year: 2024, weight: "supporting", title: "Meet FTC — League Meet of Penguins",
      results: [result("organizer", labels.organizer, T("Official meet", "Meet oficial", "Rencontre officielle"))],
      description: T("Organizer role.", "Rol de organizator.", "Rôle d'organisateur.")
    }
  ];

  const localized = (value) => {
    if (typeof value === "string") return value;
    return `<span data-achievements-en="${value.en}" data-achievements-ro="${value.ro}" data-achievements-fr="${value.fr}">${value.en}</span>`;
  };
  const resultMarkup = (entry) => `<span class="achievement-pair"><span class="result-badge result-${entry.kind}">${localized(entry.text)}</span><span class="stage-badge ${entry.stageKind ? `stage-${entry.stageKind}` : ""}">${localized(entry.stage)}</span></span>`;
  const cardMarkup = (item) => `<article class="achievement-card" data-weight="${item.weight}">
    <span class="achievement-weight">${item.rank ? `${localized(labels.pinnacle)} · Top 5 #0${item.rank}` : localized(labels[item.weight])}</span>
    <div class="achievement-pair-list">${item.results.map(resultMarkup).join("")}</div>
    <h3>${localized(item.title)}</h3><p>${localized(item.description)}</p>
  </article>`;
  const podiumMarkup = (item) => `<article class="podium-card rank-${item.rank}" data-rank="0${item.rank}">
    <div class="podium-rank">${item.rank === 1 ? `<span data-achievements-en="No. 01 · Highest-ranked" data-achievements-ro="Nr. 01 · Cel mai important" data-achievements-fr="N° 01 · Premier du classement">No. 01 · Highest-ranked</span>` : `<span data-achievements-en="No. 0${item.rank}" data-achievements-ro="Nr. 0${item.rank}" data-achievements-fr="N° 0${item.rank}">No. 0${item.rank}</span>`}</div>
    <div class="podium-year">${item.year}</div><h3>${localized(item.title)}</h3>
    <div class="podium-result">${item.results.map(resultMarkup).join("")}</div>
  </article>`;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "achievements.css?v=2026-08-05-native-integration";
  document.head.append(stylesheet);

  const tab = document.createElement("button");
  Object.assign(tab, { id: "tab-achievements", type: "button", tabIndex: -1 });
  tab.dataset.nav = "achievements";
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-controls", "achievements");
  tab.setAttribute("aria-selected", "false");
  tab.innerHTML = localized(labels.nav);
  document.querySelector(".story-tabs")?.insertBefore(tab, document.querySelector("#tab-proof"));

  const topFive = achievements.filter((item) => item.rank).sort((a, b) => a.rank - b.rank);
  const years = [...new Set(achievements.map((item) => item.year))].sort((a, b) => b - a);
  const panel = document.createElement("section");
  panel.className = "tab-panel achievements-panel";
  panel.id = "achievements";
  panel.dataset.panel = "achievements";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", "tab-achievements");
  panel.tabIndex = 0;
  panel.innerHTML = `
    <header class="achievements-hero reveal">
      <div class="achievements-hero-copy">
        <p class="section-index">${localized(T("Competition record", "Palmares competițional", "Palmarès des compétitions"))}</p>
        <h1><span>${localized(T("Built.", "Construit.", "Construit."))}</span><br><b>${localized(T("Proven.", "Dovedit.", "Prouvé."))}</b></h1>
        <p>${localized(T("The competitions, international programs, technical distinctions and organizer roles that shaped the team behind InFlux. Results and competition stages are shown separately, because a county win and a national result are not the same achievement.", "Competițiile, programele internaționale, distincțiile tehnice și rolurile de organizare care au format echipa din spatele InFlux. Rezultatul și etapa competiției sunt afișate separat, deoarece un loc întâi județean și un rezultat național nu reprezintă aceeași performanță.", "Les compétitions, programmes internationaux, distinctions techniques et rôles d'organisation qui ont façonné l'équipe derrière InFlux. Le résultat et le niveau de la compétition sont présentés séparément, car une victoire départementale et un résultat national ne représentent pas la même performance."))}</p>
      </div>
      <aside class="achievement-summary"><strong>2024—2026</strong><p>${localized(T("Every documented result remains visible. The strongest national and international outcomes lead; qualifications, participation and organizer roles support the record without being presented as equivalent wins.", "Fiecare rezultat documentat rămâne vizibil. Cele mai puternice performanțe naționale și internaționale sunt prioritare, iar calificările, participările și rolurile de organizare completează palmaresul fără a fi prezentate drept victorii echivalente.", "Chaque résultat documenté reste visible. Les performances nationales et internationales les plus fortes sont mises en avant; les qualifications, participations et rôles d'organisation complètent le palmarès sans être présentés comme des victoires équivalentes."))}</p></aside>
    </header>

    <section class="achievement-section" aria-labelledby="achievement-top-five">
      <div class="achievement-heading reveal"><p class="section-index">${localized(T("01 / Top five", "01 / Top cinci", "01 / Top cinq"))}</p><div>
        <h2 id="achievement-top-five">${localized(T("The results that define the record.", "Rezultatele care definesc palmaresul.", "Les résultats qui définissent le palmarès."))}</h2>
        <p>${localized(T("Ranked by competition level, result, international reach and relevance to the team's engineering work. The stage remains visually distinct from the prize.", "Clasificate după nivelul competiției, rezultat, expunere internațională și relevanță pentru activitatea inginerească a echipei. Etapa rămâne vizual distinctă de premiu.", "Classés selon le niveau de la compétition, le résultat, la portée internationale et la pertinence pour le travail d'ingénierie de l'équipe. Le niveau reste visuellement distinct du prix."))}</p>
      </div></div>
      <div class="achievement-podium reveal" aria-label="Top five achievements">${topFive.map(podiumMarkup).join("")}</div>
    </section>

    <section class="achievement-section" aria-labelledby="achievement-complete-record">
      <div class="achievement-heading reveal"><p class="section-index">${localized(T("02 / Complete record", "02 / Palmares complet", "02 / Palmarès complet"))}</p><div>
        <h2 id="achievement-complete-record">${localized(T("Every result. Correctly weighted.", "Fiecare rezultat. Ponderat corect.", "Chaque résultat. Pondéré correctement."))}</h2>
        <p>${localized(T("Prize badges answer what the team received. Stage badges answer how far the competition had progressed. Card scale indicates the result's overall importance.", "Insignele de premiu arată ce a obținut echipa. Insignele de etapă arată nivelul la care ajunsese competiția. Dimensiunea cardului indică importanța generală a rezultatului.", "Les badges de prix indiquent ce que l'équipe a obtenu. Les badges de niveau indiquent jusqu'où la compétition était arrivée. La taille de la carte exprime l'importance globale du résultat."))}</p>
      </div></div>
      <div class="achievement-key reveal">
        <div><strong>${localized(labels.pinnacle)}</strong><span>${localized(T("Top-five national or international result.", "Rezultat național sau internațional din top cinci.", "Résultat national ou international du top cinq."))}</span></div>
        <div><strong>${localized(labels.major)}</strong><span>${localized(T("Strong placement, national pathway or significant distinction.", "Clasare puternică, parcurs național sau distincție importantă.", "Classement solide, parcours national ou distinction importante."))}</span></div>
        <div><strong>${localized(labels.notable)}</strong><span>${localized(T("Competitive result or recognized participation.", "Rezultat competitiv sau participare recunoscută.", "Résultat compétitif ou participation reconnue."))}</span></div>
        <div><strong>${localized(labels.supporting)}</strong><span>${localized(T("Organizer role or participation without a stated placement.", "Rol de organizator sau participare fără clasare precizată.", "Rôle d'organisateur ou participation sans classement indiqué."))}</span></div>
      </div>
      <div class="achievement-timeline">${years.map((year) => `<section class="achievement-year-row reveal" aria-labelledby="achievements-${year}"><h3 class="achievement-year" id="achievements-${year}">${year}</h3><div class="achievement-year-grid">${achievements.filter((item) => item.year === year).map(cardMarkup).join("")}</div></section>`).join("")}</div>
    </section>

    <section class="achievement-close reveal"><div><p class="section-index">${localized(T("What the record proves", "Ce demonstrează palmaresul", "Ce que prouve le palmarès"))}</p><h2>${localized(T("Not one project. A repeatable engineering practice.", "Nu un singur proiect. O practică inginerească repetabilă.", "Pas un seul projet. Une pratique d'ingénierie reproductible."))}</h2></div><button class="action action-primary" type="button" data-nav="contact">${localized(T("Work with the team", "Colaborează cu echipa", "Collaborer avec l'équipe"))}</button></section>`;
  document.querySelector("main")?.append(panel);

  const applyLanguage = () => {
    const lang = document.documentElement.lang === "ro" ? "ro" : document.documentElement.lang === "fr" ? "fr" : "en";
    document.querySelectorAll("[data-achievements-en]").forEach((node) => {
      const next = lang === "ro" ? node.dataset.achievementsRo : lang === "fr" ? node.dataset.achievementsFr : node.dataset.achievementsEn;
      if (next !== undefined && node.textContent !== next) node.textContent = next;
    });
    if (new URLSearchParams(location.search).get("tab") === "achievements") {
      const nextTitle = lang === "ro" ? "Rezultate | InFlux Origin" : lang === "fr" ? "Palmarès | InFlux Origin" : "Achievements | InFlux Origin";
      if (document.title !== nextTitle) document.title = nextTitle;
    }
  };
  new MutationObserver(applyLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  new MutationObserver(applyLanguage).observe(document.querySelector("title"), { childList: true });
  tab.addEventListener("click", () => requestAnimationFrame(applyLanguage));
  applyLanguage();
})();
