export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const res = await $fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          config.public.spotifyClientId +
            ':' +
            config.spotifyClientSecret
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  })

  return res
})
