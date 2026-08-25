import { defineRelations } from "drizzle-orm";
import * as models from "./models";

export const relations = defineRelations(models, (r) => ({
	user: {
		sessions: r.many.session(),
		accounts: r.many.account(),
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
}));
