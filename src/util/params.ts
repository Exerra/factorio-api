export const params =  [
    {
        name: "x-factorio-host",
        description: "Hostname of the Factorio server",
        required: true,
        in: "header"
    },
    {
        name: "x-factorio-port",
        description: "Port of the Factorio RCON server",
        required: true,
        in: "header"
    },
    {
        name: "x-factorio-password",
        description: "Password of the Factorio RCON server",
        required: true,
        in: "header"
    }
]