import { defineRelations } from "drizzle-orm";
import * as models from "./models";

// Auth relations are defined via defineRelationsPart in models/auth.ts
// and merged here. App-specific cross-domain relations go in this file.
export const relations = defineRelations(models, (r) => ({
	user: {
		sessions: r.many.session(),
		accounts: r.many.account(),
		passkeys: r.many.passkey(),
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
}));
