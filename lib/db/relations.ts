import { defineRelations } from "drizzle-orm";
import * as models from "./models";

export const relations = defineRelations(models, (r) => ({
	user: {
		sessions: r.many.session(),
		accounts: r.many.account(),
		passkeys: r.many.passkey(),
		libraryEntries: r.many.library(),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
		}),
	},
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id,
		}),
	},
	passkey: {
		user: r.one.user({
			from: r.passkey.userId,
			to: r.user.id,
		}),
	},
	manga: {
		libraryEntries: r.many.library(),
	},
	library: {
		user: r.one.user({
			from: r.library.userId,
			to: r.user.id,
		}),
		manga: r.one.manga({
			from: r.library.mangaId,
			to: r.manga.id,
		}),
	},
}));
