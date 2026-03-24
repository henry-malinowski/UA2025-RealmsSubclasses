import { AuraSelectorApp } from "./aura-selector.mjs";

globalThis.AuraSelectorApp = AuraSelectorApp;

export const MODULE_ID = "UA2025-RealmsSubclasses";

const MODULE_SOCKET = `module.${MODULE_ID}`;

Hooks.once("init", () => {
	CONFIG.DND5E.featureTypes.class.subtypes.dreadAllegiance = "Dread Allegiance";
	console.log(`${MODULE_ID}.mjs hooked`);

	game.settings.register(MODULE_ID, "lastVersion", {
		name: "Last Version",
		hint: "The last version checked against to determine whether to show the changelog.",
		scope: "world",
		config: false,
		type: String,
		default: "1.0.0",
	});
});

Hooks.on("dnd5e.postSummon", async (activity, _profile, createdTokens) => {
	if (activity.item.system.identifier !== "purple-dragon-companion") return;
	const bonus = String(activity.actor.system.abilities.int.mod);
	await Promise.all(
		createdTokens
			.filter((t) => t.actor?.canUserModify(game.user, "update"))
			.map((t) => t.actor.update({ "system.bonuses.mwak.attack": bonus })),
	);
});

Hooks.once("setup", () => {
	game.socket.on(MODULE_SOCKET, (data) => {
		if (data?.action !== "notifyUsers") return;
		if (!Array.isArray(data.recipients)) return;
		if (typeof data.message !== "string") return;
		if (!data.recipients.includes(game.user.id)) return;
		ui.notifications.info(data.message);
	});
});

Hooks.once("ready", async () => {
	const currentVersion = game.modules.get(MODULE_ID).version;
	const lastVersion = game.settings.get(MODULE_ID, "lastVersion");
	if (foundry.utils.isNewerVersion(currentVersion, lastVersion)) {
		const journal = await fromUuid(
			"Compendium.UA2025-RealmsSubclasses.content.JournalEntry.uarsChangelog000",
		);
		const page = journal.pages.contents.at(-1);
		journal.sheet.render(true, { pageId: page.id });
		game.settings.set(MODULE_ID, "lastVersion", currentVersion);
	}
});
