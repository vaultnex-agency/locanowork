import { stopById } from "../src/data/stops.ts";
import { getBus, searchStops, resolveStop, matchBuses } from "../src/lib/bus-service.ts";

console.log("=== CRITERION 2 ===");
const bus1 = getBus("1");
const bus1A = getBus("1a");
const bus1B_1 = getBus("1b");
const bus1B_2 = getBus("1b-2");

console.log("Bus 1 start:", stopById.get(bus1.stops[0]).name, "end:", stopById.get(bus1.stops[bus1.stops.length - 1]).name);
console.log("Bus 1A start:", stopById.get(bus1A.stops[0]).name, "end:", stopById.get(bus1A.stops[bus1A.stops.length - 1]).name);
console.log("Bus 1B road 1 ID:", bus1B_1?.id, "road 2 ID:", bus1B_2?.id);

console.log("\n=== CRITERION 3 ===");
const yenepoyaMatch = resolveStop("Yenepoya");
console.log("Yenepoya resolves to stop ID:", yenepoyaMatch.stop?.id, "name:", yenepoyaMatch.stop?.name);

console.log("\n=== CRITERION 4 ===");
const vSuggestions = searchStops("v");
console.log("Suggestions for 'v':", vSuggestions.map(s => s.name));
const allStartWithV = vSuggestions.every(s => s.name.toLowerCase().startsWith("v"));
console.log("All start with V?", allStartWithV);

console.log("\n=== CRITERION 5 ===");
const b1Matches = matchBuses("1B");
console.log("Matches for '1B':", b1Matches.map(b => b.id));
console.log("Multiple roads?", b1Matches.length > 1);

console.log("\n=== VERIFICATION COMPLETE ===");
