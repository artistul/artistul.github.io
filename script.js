document.write('<script src="achievements.js?v=2026-08-05-native-integration"></script><script src="script-core.js?v=2026-08-05-achievements-core"></script>');
HUB.tabs.achievements = { title: "Achievements | InFlux Origin" };
if (new URLSearchParams(window.location.search).get("tab") === "achievements") {
  activateTab("achievements", { fromHistory: true, instant: true, keepScroll: true });
}
