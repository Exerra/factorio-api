import Rcon from "rcon"

let options = {
	tcp: true,
	challenge: false
}

export const sendCommand = async (client: Rcon, cmd: string) => {
	client.send(cmd)

	let res = "not changed"

	const promise = new Promise<void>((resolve, reject) => {
		client.once("response", (str: string) => {
			console.log(str)
			res = str

			resolve()
		})
	})

	await promise

	return res
}