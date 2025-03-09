import Elysia, { t } from "elysia"
import { sendCommand } from "../util/client"
import Rcon from "rcon"
import { params } from "../util/params"

export const players = new Elysia({ prefix: "/players", detail: { tags: ["Player"] } })

players.derive(async ({ headers }) => {
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

players.get("/", async ({ client }) => {
    console.log(client)
    let playersMsg = await sendCommand(client, "/players")
    let adminsMsg = await sendCommand(client, "/players")
    let regex = /^  ([a-zA-Z0-9]+)(?: \(online\))?$/

    let admins = []

    for (const line of adminsMsg.trim().split("\n")) {
        const match = line.match(regex)
        if (!match) continue

        let exec = regex.exec(line)

        if (!exec) continue

        let username = exec[1]

        admins.push(username)
    }

    let players = []

    for (const line of playersMsg.trim().split("\n")) {
        const match = line.match(regex)
        if (!match) continue

        let exec = regex.exec(line)

        if (!exec) continue

        let username = exec[1]
        let online = line.includes("(online)")

        players.push({
            username,
            online,
            admin: admins.includes(username)
        })
    }

    return players
}, {
    detail: {
        description: "Gets a list of all players, whether they are online and whether they are admins",
        parameters: params
        // responses: {
        //     "200": {
        //         description: "Successful. Returns an array object.",
        //     }
        // }
    },
    response: {
        "200": t.Array(t.Object({
            username: t.String(),
            online: t.Boolean(),
            admin: t.Boolean()
        }))
    }
})

players.get("/whitelisted", async ({ client }) => {
    let whitelisted: string[] = []
    const whitelistText = await sendCommand(client, "/whitelist get")

    if (whitelistText == "The whitelist is empty.") return whitelisted

    let parsed = whitelistText.replace("Whitelisted players:", "").replaceAll(", ", " ").replace(" and ", " ").trim()
    whitelisted = parsed.split(" ")

    return whitelisted
}, {
    detail: {
        description: "Gets a list of all whitelisted players",
        parameters: params
        // responses: {
        //     "200": {
        //         description: "Successful. Returns a string array.",
        //     }
        // }
    },
    response: {
        "200": t.Array(t.String())
    }
})

players.get("/banned", async ({ client }) => {
    let banlisted: string[] = []
    const banlistText = await sendCommand(client, "/banlist get")

    if (banlistText == "The banlist is empty.") return banlisted

    let parsed = banlistText.replace("Banned players:", "").replaceAll(", ", " ").replace(" and ", " ").trim()
    banlisted = parsed.split(" ")

    return banlisted
}, {
    detail: {
        description: "Gets a list of all banned players",
        parameters: params
        // responses: {
        //     "200": {
        //         description: "Successful. Returns a string array.",
        //     }
        // }
    },
    response: {
        "200": t.Array(t.String())
    }
})

// players.post("/ban", async ({ body }) => {
//     const { username, reason } = body

//     const res = await sendCommand(`/ban ${username.trim()} ${reason.trim()}`)

//     return res
// }, {
//     body: t.Object({
//         username: t.String({ minLength: 1 }),
//         reason: t.String({ minLength: 0 })
//     }),
//     response: t.String()
// })