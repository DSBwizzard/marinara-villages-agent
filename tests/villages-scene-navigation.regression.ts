import assert from "node:assert/strict";
import { sceneNavigationScreen } from "../packages/villages/src/client/shell/navigation.js";

for (const requested of ["setup", "resume", "preparing"]) {
  assert.equal(sceneNavigationScreen(requested, true), "room");
  assert.equal(sceneNavigationScreen(requested, false), requested);
}
for (const requested of ["home", "room", "menu", "venue", "person"]) {
  assert.equal(sceneNavigationScreen(requested, true), requested);
  assert.equal(sceneNavigationScreen(requested, false), requested);
}
assert.equal(sceneNavigationScreen("home", true, true), "home");
for (const requested of ["setup", "resume", "preparing"]) {
  assert.equal(sceneNavigationScreen(requested, true, true), "room");
}
console.log("Scene menus remain available; exploration stays fenced");
