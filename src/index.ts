import { Elysia, t } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { sendCommand } from "./util/client";
import { players } from "./routers/players";
import Rcon from "rcon";
import { params } from "./util/params";

const config = {
	name: "Factorio API",
	version: "2025-03-09.1"
}

const app = new Elysia()
app.use(swagger({
	documentation: {
		tags: [
			{ name: "Player", description: "Player endpoints." }
		],
		info: {
			title: config.name,
			version: config.version,
			description: "Documentation for the Factorio API by Exerra."
		},
		components: {
			securitySchemes: {
				apiKey: {
					type: "apiKey",
					name: "x-api-key",
					in: "header",
					description: "API Key",
				}
			}
		}
	},

}))
app.use(players)

app.derive(async ({ headers, request }) => {

	if (new URL(request.url).pathname.startsWith("/swagger")) return {}
	if (new URL(request.url).pathname == "/") return {}

	const host = headers["x-factorio-host"] as string
	const port = headers["x-factorio-port"] as string
	const password = headers["x-factorio-password"] as string

	let options = {
		tcp: true,
		challenge: false
	}

	const client = new Rcon(host, parseInt(port), password, options)

	client.connect()

	const promise = new Promise<void>((resolve, reject) => {
		client.connect()

		client.once("auth", () => resolve())
		client.once("error", () => reject())
	})

	await promise

	return {
		client
	}
})

app.get("/", () => {
	return { 
		name: config.name,
		version: config.version,
		docs: "/swagger"
	}
}, {
	detail: {
		summary: "API info (/)",
		description: "Returns general info about the API. Should be used to check whether the API is online.",
	},
	response: {
		"200": t.Object({
			name: t.String(),
			version: t.String(),
			docs: t.String()
		})
	},
})

app.get("/server/info", async ({ client }) => {
	const time = await sendCommand(client, "/time")
	const seed = await sendCommand(client, "/seed")
	const version = await sendCommand(client, "/version")

	return {
		time,
		seed,
		version
	}
}, {
	detail: {
		summary: "Server info (/server/info)",
		description: "Returns general info about the Factorio server provided in the headers. Should be used to check whether the API is online.",
		parameters: params
	},
})


app.post("/console", async ({ query, body, headers, client }) => {
	const { msg } = body

	console.log(headers)

	if (msg == "") return ""

	return await sendCommand(client, msg)
}, {
	detail: {
		description: "Lets you run console commands directly without any processing. The API, essentially, acts as a proxy rather than wrapper.",
		responses: {
			"200": {
				description: "Successful. Returns raw text output of the console response. May be blank.",
			}
		},
		security: [{
			apiKey: []
		}],
		parameters: params
	},
	body: t.Object({
		msg: t.String({ minLength: 1 })
	})
})

app.listen(Bun.env.PORT || Bun.env.port || 3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
