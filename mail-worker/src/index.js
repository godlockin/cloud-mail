export default {
	async fetch(req, env, ctx) {
		try {
			const url = new URL(req.url);

			if (url.pathname.startsWith('/api/')) {
				url.pathname = url.pathname.replace('/api', '');
				req = new Request(url.toString(), req);
				const { default: app } = await import('./hono/webs');
				return await app.fetch(req, env, ctx);
			}

			return await env.assets.fetch(req);
		} catch (err) {
			return new Response(`Worker Runtime Error:\nMessage: ${err.message}\nStack:\n${err.stack}`, {
				status: 500,
				headers: { 'content-type': 'text/plain; charset=utf-8' }
			});
		}
	},
	async email(message, env, ctx) {
		const { email } = await import('./email/email');
		return await email(message, env, ctx);
	},
	async scheduled(c, env, ctx) {
		const { default: verifyRecordService } = await import('./service/verify-record-service');
		const { default: userService } = await import('./service/user-service');
		await verifyRecordService.clearRecord({ env });
		await userService.resetDaySendCount({ env });
	},
};
